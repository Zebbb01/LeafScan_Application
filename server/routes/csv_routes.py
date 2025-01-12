from flask import request, jsonify, session
import pandas as pd
from models import Production, db


def init_csv_routes(app):
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