from flask import jsonify, session, current_app, url_for
import requests  # Use requests to call the forecast API internally
from routes.utility import fetch_production_data

def get_severity_label(severity):
    """Function to map severity value to a label."""
    if 1 <= severity <= 3:
        return 'Low'
    elif 4 <= severity <= 6:
        return 'Moderate'
    elif 7 <= severity <= 10:
        return 'Severe'
    else:
        return 'Mixed'

def init_report_routes(app):
    @app.route('/api/report_data', methods=['GET'], endpoint='unique_report_data')
    def get_report_data():
        try:
            # Fetch production data
            production_data = fetch_production_data()

            if production_data.empty:
                return jsonify({'error': 'No production data available. Please upload data first.'}), 400

            # Fetch the severity value from the session
            severity_value = session.get('severity', 1)  # Default severity to 1 if not set
            severity_label = get_severity_label(severity_value)  # Get severity label
            loss_percentage = severity_value / 100  # Calculate loss percentage

            # Adjust production data
            production_data['adjusted_production'] = production_data['value'] * (1 - loss_percentage)
            production_data['loss'] = production_data['value'] * loss_percentage

            # Call forecast API using Flask's internal routing
            forecast_route = url_for('forecast_losses', _external=True)
            forecast_response = requests.get(forecast_route)

            if not forecast_response.ok:
                return jsonify({'error': 'Unable to fetch forecast data.'}), 500

            forecast_data = forecast_response.json()

            # Adjusted production (forecast minus the loss)
            adjusted_production = [
                forecast_value * (1 - loss_percentage) for forecast_value in forecast_data.get("next_8_quarters_forecast", [])
            ]
            
            # Actual losses (calculated based on the loss percentage)
            actual_losses = [
                forecast_value * loss_percentage for forecast_value in forecast_data.get("next_8_quarters_forecast", [])
            ]

            # Return structured data
            report_data = {
                "severity_label": severity_label,
                "severity_value": severity_value,
                "loss_percentage": round(loss_percentage * 100, 2),
                "data": production_data.to_dict(orient='records'),
                "next_8_quarters_forecast": forecast_data.get("next_8_quarters_forecast", []),
                "adjusted_production": adjusted_production,  # Updated adjusted production calculation
                "actual_losses": actual_losses,  # Updated actual losses calculation
            }
            return jsonify(report_data)

        except Exception as e:
            return jsonify({'error': str(e)}), 500

