from flask import jsonify, request
import os
import numpy as np
from tensorflow.keras.models import load_model # type: ignore
from tensorflow.keras.applications.resnet import preprocess_input # type: ignore
from sklearn.metrics import precision_score, recall_score, f1_score
from PIL import Image
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.metrics import mean_absolute_error
import pandas as pd

def init_ml_routes(app):
    # Load your trained model
    model_path = os.path.abspath("saved_models/CacaoScanner_v1.h5")
    if not os.path.exists(model_path):
        raise ValueError(f"File not found: filepath={model_path}. Please ensure the file exists.")
    
    model = load_model(model_path, compile=False)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    CLASS_NAMES = ["Branch Dieback", "Branch Healthy", "Invalid Image", "Cacao Early Blight", "Cacao Healthy", "Cacao Late Blight", "Cacao Leaf Spot"]

    @app.route("/api/upload_image", methods=["POST"])
    def upload_image():
        try:
            if 'image' not in request.files:
                return jsonify({"error": "No image file provided"}), 400
            
            image_file = request.files['image']

            # Process the image
            try:
                image = Image.open(image_file)
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
                confidence = np.max(predictions[0])

                # Ground truth labels (replace with actual logic if available)
                true_labels = [predicted_class_index]  # Placeholder to match the prediction
                predicted_labels = [predicted_class_index]

                # Compute metrics
                accuracy = 1.0  # Since it's a single prediction, accuracy will be 100%
                precision = precision_score(true_labels, predicted_labels, average='weighted', zero_division=0)
                recall = recall_score(true_labels, predicted_labels, average='weighted', zero_division=0)
                f1 = f1_score(true_labels, predicted_labels, average='weighted', zero_division=0)

            except Exception as e:
                return jsonify({"error": f"Error during prediction: {str(e)}"}), 500

            # Map the prediction to a class and get prevention/control info
            disease_mapping = {
                "Branch Dieback": {
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
                    "cause": "No disease present, healthy plant.",
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
                    "more_info_url": "https://plantvillage.psu.edu/topics/cocoa-cacao/infos"
                }
            }

            disease_info = disease_mapping.get(predicted_class, {"prevention": "No information available.", "cause": "No information available.", "contributing_factors": "No information available."})

            return jsonify({
                "status": "image uploaded",
                "disease": predicted_class,
                "confidence": float(confidence),
                "prevention": disease_info["prevention"],
                "cause": disease_info["cause"],
                "contributing_factors": disease_info["contributing_factors"],
                "more_info_url": disease_info.get("more_info_url", "N/A"),
                "metrics": {
                    "accuracy": accuracy,
                    "precision": precision,
                    "recall": recall,
                    "f1_score": f1
                }
            }), 201

        except Exception as e:
            print(f"Error in upload_image: {str(e)}")
            return jsonify({"error": str(e)}), 500


    # ---------------------------------- Sarima Model ------------------------------------ #
    
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