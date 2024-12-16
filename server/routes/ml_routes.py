from flask import jsonify, request
import os
import numpy as np
from tensorflow.keras.models import load_model # type: ignore
from tensorflow.keras.applications.resnet import preprocess_input # type: ignore
from PIL import Image
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import KFold # mao ni ang gi gamit sa pag K-fold cross validation
import pandas as pd
from werkzeug.utils import secure_filename
from models import User, db, ScanRecord, Production
from flask import session
from datetime import datetime
import logging
from sklearn.metrics import mean_squared_error


# Set up logging
logging.basicConfig(level=logging.DEBUG)

def init_ml_routes(app):
    # Load your trained model
    model_path = os.path.abspath("saved_models/CacaoScanner_best_v1.h5")
    if not os.path.exists(model_path):
        raise ValueError(f"File not found: filepath={model_path}. Please ensure the file exists.")
    
    model = load_model(model_path, compile=False)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    CLASS_NAMES = ["Vascular Streak Dieback (VSD)", "Branch Healthy", "Invalid Image", "Cacao Early Blight", "Cacao Healthy", "Cacao Late Blight", "Cacao Leaf Spot"]

    @app.route("/api/get_scan_counts", methods=["GET"])
    def get_scan_counts():
        try:
            # Get today's date
            today = datetime.utcnow().date()

            # Get total scans (for all users)
            total_scans = db.session.query(ScanRecord).count()

            # Get scans today for the specific user (if logged in)
            user_id = session.get("user_id", None)
            scans_today = 0
            total_user_scans = 0  # Total scans by this user
            if user_id:
                scans_today = db.session.query(ScanRecord).filter(
                    db.func.date(ScanRecord.created_at) == today,
                    ScanRecord.user_id == user_id
                ).count()
                # Calculate total scans for the user
                total_user_scans = db.session.query(ScanRecord).filter(
                    ScanRecord.user_id == user_id
                ).count()

            return jsonify({
                "total_scans": total_scans,
                "scans_today": scans_today,
                "total_user_scans": total_user_scans  # Include if needed
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500


        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/api/get_disease_counts", methods=["GET"])
    def get_disease_counts():
        try:
            # Query all records excluding healthy classifications
            diseases = (
                db.session.query(ScanRecord.disease, db.func.count(ScanRecord.disease))
                .filter(~ScanRecord.disease.in_(["Branch Healthy", "Cacao Healthy", "Invalid Image"]))
                .group_by(ScanRecord.disease)
                .all()
            )

            # Map results into a dictionary
            disease_counts = {disease: count for disease, count in diseases}
            total_diseases_detected = sum(disease_counts.values())

            return jsonify({
                "total_diseases_detected": total_diseases_detected,
                "disease_counts": disease_counts
            })

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        
    @app.route("/api/upload_image", methods=["POST"])
    def upload_image():
        try:
            if 'image' not in request.files:
                return jsonify({"error": "No image file provided"}), 400

            image_file = request.files['image']
            print(f"Received file: {image_file.filename}")  # Check if the file is received correctly

            # Check the file type (optional)
            if not image_file.filename.lower().endswith(('png', 'jpg', 'jpeg')):
                return jsonify({"error": "Invalid file type"}), 400

            # Save the image to a folder
            save_dir = "uploads/scanned_images"
            os.makedirs(save_dir, exist_ok=True)
            filename = secure_filename(image_file.filename)
            file_path = os.path.join(save_dir, filename)
            image_file.save(file_path)
            print(f"File saved to {file_path}")  # Check if the file is saved correctly

            # Process the image
            try:
                image = Image.open(file_path)
                image = image.resize((224, 224))  # Resize to match the model input size
                image = np.array(image)

                if image.shape[2] == 4:  # Handle alpha channel (convert to RGB if needed)
                    image = image[..., :3]

                image = preprocess_input(image)  # Preprocess as per ResNet50 expectations
                img_batch = np.expand_dims(image, 0)  # Add batch dimension
            except Exception as e:
                return jsonify({"error": f"Error processing image: {str(e)}"}), 400

            # Predict using the loaded model
            try:
                predictions = model.predict(img_batch)
                predicted_class_index = np.argmax(predictions[0])
                predicted_class = CLASS_NAMES[predicted_class_index]
                confidence = predictions[0][predicted_class_index]



            except Exception as e:
                return jsonify({"error": f"Error during prediction: {str(e)}"}), 500

            # Map the prediction to a class and get prevention/control info
            disease_mapping = {
                "Vascular Streak Dieback (VSD)": {
                    "prevention": "Implement regular pruning practices to remove infected or dead branches, which helps reduce sources of infection. Disinfect pruning tools before and after each use to prevent spreading the fungus. Apply fungicide sprays, particularly during the rainy season or in humid conditions, as a preventive measure. Ensure proper soil nutrition through regular fertilization, which strengthens plant resistance against pathogens. Additionally, manage shade to improve air circulation around branches and reduce humidity levels.",
                    "cause": "Caused by fungal pathogens such as *Phytophthora* species or *Moniliophthora roreri*.",
                    "contributing_factors": "Poor pruning practices, mechanical damage, environmental stress (e.g., drought), and poor soil nutrition can weaken branches, making them more susceptible to infections. High humidity and wet conditions can also exacerbate the spread of these pathogens.",
                    "more_info_url": "https://www.sciencedirect.com/science/article/abs/pii/S1878614611001437"
                },
                "Branch Healthy": {
                    "prevention": "Continue monitoring plant health and apply regular care.",
                    "cause": "Healthy branches with no disease or infection.",
                    "contributing_factors": "Proper care, watering, and pruning.",
                    "more_info_url": "https://www.webmd.com/diet/health-benefits-cacao-powder"
                },
                "Invalid Image": {
                    "prevention": "N/A",
                    "cause": "N/A",
                    "contributing_factors": "N/A",
                    "more_info_url": " "
                },
                "Cacao Early Blight": {
                    "prevention": "Use resistant cacao varieties whenever possible, as these can significantly reduce the risk of early blight. Apply fungicides preventatively, especially in the rainy season when humidity levels are high. Ensure proper spacing between trees to promote air circulation and reduce humidity around the plants. Keep the plantation weed-free, as weeds can increase local humidity and harbor pests that contribute to stress. Proper fertilization and irrigation practices are also important to maintain plant health and reduce susceptibility.",
                    "cause": "Caused by *Phytophthora megakarya* or *Phytophthora palmivora*.",
                    "contributing_factors": "Similar to late blight, early blight is favored by wet, humid environments, particularly during the rainy season. Overcrowded plants and stressed cacao trees are more susceptible.",
                    "more_info_url": "https://apsjournals.apsnet.org/doi/10.1094/PDIS-03-20-0565-RE"
                },
                "Cacao Healthy": {
                    "prevention": "Maintain good farm hygiene practices and regularly monitor for pests and diseases.",
                    "cause": "No cause present, healthy plant.",
                    "contributing_factors": "Proper care, pest control, and monitoring.",
                    "more_info_url": "https://www.webmd.com/diet/health-benefits-cacao-powder"
                },
                "Cacao Late Blight": {
                    "prevention": "Apply copper-based fungicides during high-risk periods, such as the rainy season, to prevent late blight. Ensure proper soil drainage by creating raised beds or adding organic material to prevent waterlogging. Prune excess branches to improve air circulation and manage canopy density, reducing humidity around the leaves. Regularly monitor soil moisture to avoid over-watering, and remove any fallen or diseased plant material immediately to prevent further spread.",
                    "cause": "Caused by *Phytophthora palmivora*.",
                    "contributing_factors": "Over-watering, poor drainage, high humidity, and poor canopy management. The fungus attacks the leaves, pods, and roots, causing significant damage.",
                    "more_info_url": "https://www.sciencedirect.com/topics/agricultural-and-biological-sciences/phytophthora-megakarya"
                },
                "Cacao Leaf Spot": {
                    "prevention": "Avoid overcrowding of plants by maintaining optimal spacing to allow for good air circulation. Prune regularly to prevent excessive foliage, which can trap moisture and create a favorable environment for fungal growth. Apply protective fungicidal sprays before the rainy season or when conditions are humid. Remove any affected leaves or plant debris from the field to limit sources of infection. Consider intercropping with non-host plants to improve biodiversity and resilience against fungal diseases.",
                    "cause": "Fungal pathogens like *Pseudocercospora* species.",
                    "contributing_factors": "High humidity, poor air circulation, and excessive rainfall create ideal conditions for fungal growth. Overcrowded plantations or improper pruning can also facilitate disease spread.",
                    "more_info_url": "https://www.missouribotanicalgarden.org/gardens-gardening/your-garden/help-for-the-home-gardener/advice-tips-resources/insects-pests-and-problems/diseases/fungal-spots/leaf-spot-shade#:~:text=Leaf%20spot%20is%20a%20common,like%20a%20leaf%20spot%20disease."
                }
            }

            disease_info = disease_mapping.get(predicted_class, {
                "prevention": "No information available.",
                "cause": "No information available.",
                "contributing_factors": "No information available.",
                "more_info_url": "N/A"
            })

            # Get user_id from session, if available
            user_id = session.get("user_id", None)

            # Save the scan result to the database
            scan_record = ScanRecord(
                image_path=file_path,
                disease=predicted_class,
                user_id=user_id
            )
            db.session.add(scan_record)

            # Get today's date
            today = datetime.utcnow().date()

            # Increment scan_count for the user
            if user_id:
                user = User.query.get(user_id)
                if user:
                    user.scan_count += 1  # Increment total scan count
                    scans_today = db.session.query(ScanRecord).filter(
                        db.func.date(ScanRecord.created_at) == today,
                        ScanRecord.user_id == user_id
                    ).count()
                    user.scanned_today = scans_today  # Set today's scan count directly
                    db.session.commit()

            # Save the scan record
            db.session.commit()

            # Return the prediction, disease details, and updated scan counts
            return jsonify({
                "disease": predicted_class,
                "confidence": float(confidence * 100),
                "prevention": disease_info["prevention"],
                "cause": disease_info["cause"],
                "contributing_factors": disease_info["contributing_factors"],
                "more_info_url": disease_info["more_info_url"],
                "scan_counts": {
                    "scans_today": scans_today,
                    "scanned_today": user.scanned_today if user else 0
                }
            }), 201

        except Exception as e:
            print(f"Error: {str(e)}")  # Log the error
            return jsonify({"error": str(e)}), 500
        
    
    @app.route('/api/upload_csv', methods=['POST'])
    def upload_csv():
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        severity = request.form.get('severity')

        if severity:
            try:
                # Parse the severity value directly as an integer
                severity_value = int(severity)
            except ValueError:
                return jsonify({'error': 'Invalid severity value. It should be an integer.'}), 400

            # Store the severity value for forecasting logic or pass it downstream
            session['severity'] = severity_value
        else:
            return jsonify({'error': 'Severity value is required.'}), 400

        if file and file.filename.endswith('.csv'):
            try:
                # Read the uploaded CSV file into a pandas DataFrame
                data = pd.read_csv(file)

                # Check if the necessary columns exist in the CSV
                if 'Date' not in data.columns or 'Production' not in data.columns:
                    return jsonify({'error': 'Invalid CSV format. Ensure the CSV has Date and Production columns.'}), 400

                # Clear the existing records in the database (or set to empty)
                db.session.query(Production).delete()

                # Process the new data
                for _, row in data.iterrows():
                    # Convert the date column, handle invalid formats
                    try:
                        date = pd.to_datetime(row['Date'], errors='coerce').date()
                    except Exception:
                        return jsonify({'error': f"Invalid date format in row: {row}"}), 400

                    if pd.isna(date):
                        return jsonify({'error': f"Invalid date in row: {row}"}), 400

                    # Check if the production value is valid
                    try:
                        production_value = float(row['Production'])
                    except ValueError:
                        return jsonify({'error': f"Invalid production value in row: {row}"}), 400

                    # Add the new record to the database
                    new_record = Production(date=date, value=production_value)
                    db.session.add(new_record)

                db.session.commit()
                return jsonify({'message': 'File uploaded successfully. Data has been replaced.'}), 200

            except Exception as e:
                return jsonify({'error': f"An error occurred: {str(e)}"}), 500
        else:
            return jsonify({'error': 'Invalid file format. Please upload a CSV file.'}), 400




    @app.route('/api/production-raw', methods=['GET'])
    def production_raw():
        try:
            # Fetch production data from the database
            production_data = fetch_production_data()

            # Return the data as JSON
            return jsonify({'production': production_data.to_dict(orient='records')}), 200
        except Exception as e:
            app.logger.error(f"Error fetching production data: {e}")
            return jsonify({'error': str(e)}), 500


    # Utility Functions
    def fetch_production_data():
        """Fetch production data as a DataFrame."""
        try:
            records = Production.query.order_by(Production.date).all()
            if not records:
                raise ValueError("No production data found.")
            data = [{'date': r.date.strftime('%Y-%m-%d'), 'value': round(r.value, 2)} for r in records]
            return pd.DataFrame(data)
        except Exception as e:
            app.logger.error(f"Error fetching production data: {e}")
            raise

    def time_series_k_fold(data, k=5, seasonal_periods=4):
        # Initialize KFold (here k=5 for example)
        kf = KFold(n_splits=k, shuffle=False)

        mae_scores = []
        mse_scores = []
        rmse_scores = []

        for train_index, test_index in kf.split(data):
            # Split the data into train and test
            train_data, test_data = data.iloc[train_index], data.iloc[test_index]

            # Fit the model on training data
            model = ExponentialSmoothing(
                train_data['value'], 
                trend='add', 
                seasonal='add', 
                seasonal_periods=seasonal_periods
            ).fit()

            # Forecast on the test data
            forecast = model.forecast(len(test_data))

            # Evaluate the model
            y_true = test_data['value'].values
            y_pred = forecast.values
            mae = mean_absolute_error(y_true, y_pred)
            mse = mean_squared_error(y_true, y_pred)
            rmse = np.sqrt(mse)

            mae_scores.append(mae)
            mse_scores.append(mse)
            rmse_scores.append(rmse)

        # Return average scores from all folds
        return {
            'MAE': np.mean(mae_scores),
            'MSE': np.mean(mse_scores),
            'RMSE': np.mean(rmse_scores)
        }

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