from flask import jsonify
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.metrics import mean_absolute_error
import pandas as pd
from models import Production
from flask import session

from routes.utility import fetch_production_data, time_series_k_fold


def init_forecasting_routes(app):
    @app.route('/api/get_production_data', methods=['GET'])
    def get_production_data():
        try:
            production_data = Production.query.order_by(Production.date).all()
            result = [{'date': str(item.date), 'value': item.value} for item in production_data]
            return jsonify({'production': result}), 200
        except Exception as e:
            app.logger.error(f"Error fetching production data: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/forecast-losses', methods=['GET'])
    def forecast_losses():
        try:
            production_data = fetch_production_data()
            production_data['date'] = pd.to_datetime(production_data['date'])
            production_data.set_index('date', inplace=True)

            # Fetch the severity value from the session
            severity_value = session.get('severity', 1)  # Default to severity of 1 if not set

            # Calculate the loss percentage based on the severity value (scaled from 1 to 10)
            total_loss_percentage = severity_value / 100  # Severity of 1 -> 1%, Severity of 10 -> 10%

            # Perform k-fold cross-validation
            cv_metrics = time_series_k_fold(production_data, k=10)

            # Train the model and forecast the first quarter
            model = ExponentialSmoothing(
                production_data['value'],
                trend='add',
                seasonal='add',
                seasonal_periods=4
            ).fit()
            first_quarter_forecast = model.forecast(1)

            # Calculate actual losses for the first quarter
            actual_loss_first_quarter = first_quarter_forecast[0] * total_loss_percentage if total_loss_percentage > 0 else 0
            adjusted_first_quarter = first_quarter_forecast[0] - actual_loss_first_quarter

            # Update the production data with the adjusted first quarter
            last_date = production_data.index[-1]
            updated_data = production_data.copy()
            updated_data.loc[last_date + pd.DateOffset(months=3)] = adjusted_first_quarter

            # Re-train the model on the updated data and forecast the remaining 7 quarters
            model = ExponentialSmoothing(
                updated_data['value'],
                trend='add',
                seasonal='add',
                seasonal_periods=4
            ).fit()
            remaining_forecast = model.forecast(7)

            # Calculate actual losses and adjusted values for the remaining quarters
            actual_losses = [
                value * total_loss_percentage if total_loss_percentage > 0 else 0
                for value in remaining_forecast
            ]
            adjusted_remaining_forecast = [
                value - loss for value, loss in zip(remaining_forecast, actual_losses)
            ]

            # Combine forecasts
            forecast_dates = [last_date + pd.DateOffset(months=3 * i) for i in range(1, 9)]
            combined_forecast = [adjusted_first_quarter] + adjusted_remaining_forecast
            actual_losses = [actual_loss_first_quarter] + actual_losses

            response = {
                'forecast_dates': [date.strftime('%Y-%m-%d') for date in forecast_dates],
                'next_8_quarters_forecast': [first_quarter_forecast[0]] + remaining_forecast.tolist(),
                'adjusted_production': combined_forecast,
                'actual_losses': actual_losses,
                'evaluation_metrics': cv_metrics,
                'severity_range': [f"{severity_value * 1}%"]  # Show severity as a percentage
            }
            return jsonify(response)

        except Exception as e:
            app.logger.error(f"Error during forecasting: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/bar-forecast-losses', methods=['GET']) 
    def bar_forecast_losses():
        try:
            production_data = fetch_production_data()
            production_data['date'] = pd.to_datetime(production_data['date'])
            production_data.set_index('date', inplace=True)

            severity_value = session.get('severity', 1)  # Default to severity of 1 if not set
            total_loss_percentage = severity_value / 100

            model = ExponentialSmoothing(
                production_data['value'],
                trend='add',
                seasonal='add',
                seasonal_periods=4
            ).fit()
            first_quarter_forecast = model.forecast(1)

            actual_loss_first_quarter = first_quarter_forecast[0] * total_loss_percentage
            adjusted_first_quarter = first_quarter_forecast[0] - actual_loss_first_quarter

            last_date = production_data.index[-1]
            updated_data = production_data.copy()
            updated_data.loc[last_date + pd.DateOffset(months=3)] = adjusted_first_quarter

            model = ExponentialSmoothing(
                updated_data['value'],
                trend='add',
                seasonal='add',
                seasonal_periods=4
            ).fit()
            remaining_forecast = model.forecast(7)

            actual_losses = [value * total_loss_percentage for value in remaining_forecast]
            adjusted_remaining_forecast = [
                value - loss for value, loss in zip(remaining_forecast, actual_losses)
            ]

            forecast_dates = [last_date + pd.DateOffset(months=3 * i) for i in range(1, 9)]
            combined_forecast = [adjusted_first_quarter] + adjusted_remaining_forecast
            actual_losses = [actual_loss_first_quarter] + actual_losses

            response = {
                'forecast_dates': [date.strftime('%Y-%m-%d') for date in forecast_dates],
                'expected_production': [first_quarter_forecast[0]] + remaining_forecast.tolist(),
                'adjusted_production': combined_forecast,
                'loss_production_impact': actual_losses,
            }
            return jsonify(response)
        except Exception as e:
            app.logger.error(f"Error during forecasting: {e}")
            return jsonify({'error': str(e)}), 500

    
    @app.route('/api/production-losses', methods=['GET'])
    def production_losses():
        try:
            # Fetch production data from the database
            production_data = fetch_production_data()

            if production_data.empty:
                return jsonify({'error': 'No production data available. Please upload data first.'}), 400

            # Fetch the severity from the session
            severity_value = session.get('severity', 1)  # Default severity to 1 if not set

            # Adjust loss percentage calculation based on severity
            loss_percentage = severity_value / 100  # Map severity to a percentage (1 -> 1%, 2 -> 2%, etc.)

            # Apply losses to production data based on the calculated percentage
            production_data['adjusted_production'] = production_data['value'] * (1 - loss_percentage)

            # Prepare response data
            response = {
                'dates': production_data['date'].tolist(),
                'production_raw': production_data['value'].tolist(),
                'adjusted_production': production_data['adjusted_production'].round(2).tolist(),
                'loss_percentage': round(loss_percentage * 100, 2)
            }

            return jsonify(response), 200
        except Exception as e:
            app.logger.error(f"Error calculating production losses: {e}")
            return jsonify({'error': str(e)}), 500
                
    @app.route('/api/bargraph-losses', methods=['GET'])
    def bargraph_losses():
        try:
            # Fetch production data
            production_data = fetch_production_data()

            if production_data.empty:
                return jsonify({'error': 'No production data available. Please upload data first.'}), 400

            production_data['date'] = pd.to_datetime(production_data['date'])
            production_data.set_index('date', inplace=True)

            # Define cutoff date for checking future data
            future_start_date = pd.to_datetime('2024-01-01')

            # Check if data contains any future dates
            if production_data.index.max() <= future_start_date:
                return jsonify({'error': 'No future data available for forecasting.'}), 400

            # Define the cutoff date for historical data: up to 2024Q1
            cutoff_date = pd.to_datetime('2024-03-31')
            historical_data = production_data.loc[:cutoff_date]

            if historical_data.empty:
                return jsonify({'error': 'No historical data available for forecasting.'}), 400

            # Fit the model on historical data
            model = ExponentialSmoothing(
                historical_data['value'],
                trend='add',
                seasonal='add',
                seasonal_periods=4
            ).fit()

            # Generate forecast
            forecast_start_date = pd.to_datetime('2024-04-01')
            forecast_end_date = forecast_start_date + pd.DateOffset(years=2)
            forecast_index = pd.date_range(start=forecast_start_date, end=forecast_end_date, freq='Q')
            forecast_values = model.forecast(len(forecast_index))

            if len(forecast_values) == 0:
                return jsonify({'error': 'Forecasting failed. No data available for predictions.'}), 400

            # Adjust values based on severity
            severity_value = session.get('severity', 1)
            loss_percentage = severity_value / 100
            adjusted_values = [val * (1 - loss_percentage) for val in forecast_values]
            actual_losses = [val * loss_percentage for val in forecast_values]

            forecast_dates_formatted = [
                f"{date.year}Q{(date.month - 1) // 3 + 1}" for date in forecast_index
            ]

            return jsonify({
                'dates': forecast_dates_formatted,
                'expected_production': forecast_values.tolist(),
                'adjusted_production': adjusted_values,
                'actual_losses': actual_losses,
            }), 200

        except Exception as e:
            app.logger.error(f"Error during forecasting: {e}")
            return jsonify({'error': str(e)}), 500

     
     # ---------------------------------- ExponentialSmoothing Model ------------------------------------ #
    
    @app.route('/api/prediction', methods=['GET'])
    def prediction():
        try:
            # Load the dataset
            dataframe = pd.read_csv('Cacao Production (DDN).csv')

            # Convert the 'Date' column to datetime
            dataframe['Date'] = pd.to_datetime(dataframe['Date'], format='%m/%d/%Y')

            if dataframe.empty or 'Production' not in dataframe.columns:
                return jsonify({"error": "Dataset is empty or malformed"}), 500

            # Define Exponential Smoothing model
            exp_smooth_model = ExponentialSmoothing(dataframe['Production'], trend='add', seasonal='add', seasonal_periods=4).fit()

            # Forecast the next 8 quarters (2 years) starting from 2024/4/1 (Q2 2024)
            forecast_start_date = pd.Timestamp('2024-04-01')  # Start from Q2 2024
            steps = 8

            predictions = exp_smooth_model.forecast(steps=steps)
            
            # Round the forecasted production values to 2 decimal places
            pred_mean_rounded = predictions.round(2)

            # Generate future dates in 'Year-Q' format starting from 2024-Q2
            future_dates = pd.date_range(forecast_start_date, periods=steps, freq='Q')
            future_formatted_dates = [f"{date.year}-Q{(date.month - 1) // 3 + 1}" for date in future_dates]

            # Combine actual and forecasted data
            actual_data = dataframe[['Date', 'Production']].copy()
            actual_data['Date'] = actual_data['Date'].dt.to_period('Q').astype(str)  # Convert to 'Year-Q' format

            # Calculate MAE using actual data and model fitted values
            mae = mean_absolute_error(dataframe['Production'], exp_smooth_model.fittedvalues.round(2))
            print(f"Calculated MAE: {mae}")  # Debugging line

            forecast_data = pd.DataFrame({
                'Date': future_formatted_dates,
                'Production': pred_mean_rounded
            })

            return jsonify({
                'actual': actual_data.to_dict(orient='records'),
                'forecast': forecast_data.to_dict(orient='records'),
                'dates': future_formatted_dates,
                'mae': round(mae, 2)  # Return MAE rounded to 2 decimal places
            })

        except Exception as e:
            print(f"Error in prediction endpoint: {str(e)}")
            return jsonify({"error": str(e)}), 500
               
        # ---------------------------------- Bar Graph Model ------------------------------------ #
        
    @app.route('/api/production_by_year', methods=['GET'])
    def production_by_year():
        try:
            # Load the dataset
            dataframe = pd.read_csv('Cacao Production (DDN).csv')
            dataframe['Date'] = pd.to_datetime(dataframe['Date'], format='%m/%d/%Y')
            
            # Aggregate production by year
            dataframe['Year'] = dataframe['Date'].dt.year
            yearly_production = dataframe.groupby('Year')['Production'].sum().reset_index()
            
            return jsonify(yearly_production.to_dict(orient='records'))
        
        except Exception as e:
            print(f"Error in production_by_year endpoint: {str(e)}")
            return jsonify({"error": str(e)}), 500