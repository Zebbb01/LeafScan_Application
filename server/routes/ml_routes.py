from flask import jsonify, request
import os
import numpy as np
from tensorflow.keras.models import load_model # type: ignore
from tensorflow.keras.applications.resnet import preprocess_input # type: ignore
from sklearn.metrics import precision_score, recall_score, f1_score
from PIL import Image
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import KFold, TimeSeriesSplit # mao ni ang gi gamit sa pag K-fold cross validation
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
    model_path = os.path.abspath("saved_models/CacaoScanner_v1.h5")
    if not os.path.exists(model_path):
        raise ValueError(f"File not found: filepath={model_path}. Please ensure the file exists.")
    
    model = load_model(model_path, compile=False)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    CLASS_NAMES = ["Branch Dieback", "Branch Healthy", "Invalid Image", "Cacao Early Blight", "Cacao Healthy", "Cacao Late Blight", "Cacao Leaf Spot"]


        
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
            scanned_today = 0  # This should return how many scans the user has done today
            if user_id:
                scans_today = db.session.query(ScanRecord).filter(
                    db.func.date(ScanRecord.created_at) == today,
                    ScanRecord.user_id == user_id
                ).count()
                user = User.query.get(user_id)
                if user:
                    scanned_today = user.scanned_today  # Fetch the actual scanned_today value for the user

            return jsonify({
                "total_scans": total_scans,
                "scans_today": scans_today,
                "scanned_today": scanned_today  # Ensure this is returned
            })

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

                # Ground truth labels (placeholder logic for single prediction)
                true_labels = [predicted_class_index]
                predicted_labels = [predicted_class_index]

                # Compute metrics
                accuracy = 1.0  # 100% accuracy for a single prediction
                precision = precision_score(true_labels, predicted_labels, average='weighted', zero_division=0)
                recall = recall_score(true_labels, predicted_labels, average='weighted', zero_division=0)
                f1 = f1_score(true_labels, predicted_labels, average='weighted', zero_division=0)
            except Exception as e:
                return jsonify({"error": f"Error during prediction: {str(e)}"}), 500

            # Map the prediction to a class and get disease details
            disease_mapping = {
                "Branch Dieback": {
                    "prevention": "Implement regular ...",
                    "cause": "Caused by fungal pathogens such as *Phytophthora* species or *Moniliophthora roreri*.",
                    "contributing_factors": "Poor pruning ...",
                    "more_info_url": "https://www.sciencedirect.com/science/article/abs/pii/S1878614611001437"
                },
                "Branch Healthy": {
                    "prevention": "Continue monitoring ...",
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
                    "prevention": "Use resistant ...",
                    "cause": "Caused by *Phytophthora megakarya* or *Phytophthora palmivora*.",
                    "contributing_factors": "Similar to late blight...",
                    "more_info_url": "https://apsjournals.apsnet.org/doi/10.1094/PDIS-03-20-0565-RE"
                },
                "Cacao Healthy": {
                    "prevention": "Maintain good farm ...",
                    "cause": "No disease present, healthy plant.",
                    "contributing_factors": "Proper care, pest control, and monitoring.",
                    "more_info_url": "https://www.webmd.com/diet/health-benefits-cacao-powder"
                },
                "Cacao Late Blight": {
                    "prevention": "Apply copper-based ...",
                    "cause": "Caused by *Phytophthora palmivora*.",
                    "contributing_factors": "Over-watering, poor drainage...",
                    "more_info_url": "https://www.sciencedirect.com/topics/agricultural-and-biological-sciences/phytophthora-megakarya"
                },
                "Cacao Leaf Spot": {
                    "prevention": "Avoid overcrowding ...",
                    "cause": "Fungal pathogens like *Pseudocercospora* species.",
                    "contributing_factors": "High humidity, ...",
                    "more_info_url": "https://plantvillage.psu.edu/topics/cocoa-cacao/infos"
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
                "metrics": {
                    "accuracy": accuracy,
                    "precision": precision,
                    "recall": recall,
                    "f1_score": f1
                },
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

        if file and file.filename.endswith('.csv'):
            try:
                # Read the uploaded CSV file into a pandas DataFrame
                data = pd.read_csv(file)
                
                # Check if the necessary columns exist in the CSV
                if 'Date' not in data.columns or 'Production' not in data.columns:
                    return jsonify({'error': 'Invalid CSV format. Ensure the CSV has Date and Production columns.'}), 400

                # Validate and process each row
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

                    # Check if the record already exists
                    existing_record = db.session.query(Production).filter_by(date=date).first()

                    if existing_record:
                        # If record exists, update the production value
                        existing_record.value = production_value
                    else:
                        # If record does not exist, create a new record
                        new_record = Production(date=date, value=production_value)
                        db.session.add(new_record)

                db.session.commit()
                return jsonify({'message': 'File uploaded successfully. Data updated if necessary.'}), 200

            except Exception as e:
                return jsonify({'error': f"An error occurred: {str(e)}"}), 500
        else:
            return jsonify({'error': 'Invalid file format. Please upload a CSV file.'}), 400



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

    def fetch_disease_data():
        """Fetch disease data and categorize leaf and branch diseases."""
        try:
            leaf_diseases = ["Cacao Early Blight", "Cacao Late Blight", "Cacao Leaf Spot"]
            branch_diseases = ["Branch Dieback"]

            # Fetch all non-healthy disease records from the ScanRecord table
            records = ScanRecord.query.filter(ScanRecord.disease != 'Healthy').all()

            # Initialize counters for leaf and branch diseases
            leaf_disease_count = sum(1 for record in records if record.disease in leaf_diseases)
            branch_disease_count = sum(1 for record in records if record.disease in branch_diseases)

            return {'leaf_diseases': leaf_disease_count, 'branch_diseases': branch_disease_count}
        except Exception as e:
            app.logger.error(f"Error fetching disease data: {e}")
            raise
    def time_series_k_fold(data, k=5, seasonal_periods=4, forecast_steps=8):
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
            
            # Fetch disease data
            disease_data = fetch_disease_data()
            leaf_disease_count = disease_data['leaf_diseases']
            branch_disease_count = disease_data['branch_diseases']

            # Calculate losses
            leaf_disease_loss = (leaf_disease_count // 10) * 0.03 if leaf_disease_count >= 10 else 0
            branch_disease_loss = (branch_disease_count // 10) * 0.1 if branch_disease_count >= 10 else 0
            total_loss = leaf_disease_loss + branch_disease_loss

            # Perform k-fold cross-validation
            cv_metrics = time_series_k_fold(production_data, k=5)  # k=5 folds for example
            
            # Forecast the next 8 quarters using the model trained on all data (no cross-validation here)
            model = ExponentialSmoothing(
                production_data['value'], 
                trend='add', 
                seasonal='add', 
                seasonal_periods=4
            ).fit()
            forecast = model.forecast(8)

            # Apply predicted losses
            adjusted_production = [
                value * (1 - total_loss) if total_loss > 0 else value
                for value in forecast
            ]

            # Generate forecast dates
            last_date = production_data.index[-1]
            forecast_dates = [last_date + pd.DateOffset(months=3 * i) for i in range(1, 9)]

            response = {
                'forecast_dates': [date.strftime('%Y-%d-%m') for date in forecast_dates],
                'next_8_quarters_forecast': forecast.tolist(),
                'adjusted_production': adjusted_production,
                'predicted_losses': [total_loss] * 8,
                'evaluation_metrics': cv_metrics,  # Return cross-validation metrics
                'leaf_disease_loss': leaf_disease_loss,
                'branch_disease_loss': branch_disease_loss,
                'leaf_disease_count': leaf_disease_count,
                'branch_disease_count': branch_disease_count
            }
            return jsonify(response)

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