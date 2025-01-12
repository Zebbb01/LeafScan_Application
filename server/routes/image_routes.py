from flask import jsonify, request
import os
import numpy as np
from tensorflow.keras.models import load_model # type: ignore
from tensorflow.keras.applications.resnet import preprocess_input # type: ignore
from PIL import Image
from werkzeug.utils import secure_filename
from models import DiseaseInfo, db, ScanRecord
from flask import session
from datetime import datetime


def init_image_routes(app):
    # Load your trained model
    model_path = os.path.abspath("saved_models/CacaoScanner_best_v1.h5")
    if not os.path.exists(model_path):
        raise ValueError(f"File not found: filepath={model_path}. Please ensure the file exists.")
    
    model = load_model(model_path, compile=False)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    CLASS_NAMES = ["Vascular Streak Dieback (VSD)", "N/A", "Invalid Image", "Cacao Early Blight", "N/A", "Cacao Late Blight", "Cacao Leaf Spot"]

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
                .filter(~ScanRecord.disease.in_(["N/A", "Invalid Image"]))
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
            if not image_file.filename.lower().endswith(('png', 'jpg', 'jpeg')):
                return jsonify({"error": "Invalid file type"}), 400

            save_dir = "uploads/scanned_images"
            os.makedirs(save_dir, exist_ok=True)
            filename = secure_filename(image_file.filename)
            file_path = os.path.join(save_dir, filename)
            image_file.save(file_path)

            # Process the image
            image = Image.open(file_path)
            image = image.resize((224, 224))
            image = np.array(image)
            if image.shape[2] == 4:
                image = image[..., :3]
            image = preprocess_input(image)
            img_batch = np.expand_dims(image, 0)

            # Predict using the model
            predictions = model.predict(img_batch)
            predicted_class_index = np.argmax(predictions[0])
            predicted_class = CLASS_NAMES[predicted_class_index]
            confidence = predictions[0][predicted_class_index]

            # Fetch disease info from the database
            disease_info = DiseaseInfo.query.filter_by(name=predicted_class).first()
            if not disease_info:
                disease_info = DiseaseInfo(
                    name=predicted_class,
                    prevention="No information available.",
                    cause="No information available.",
                    contributing_factors="No information available.",
                    more_info_url="N/A"
                )

            # Save the scan result to the database
            user_id = session.get("user_id", None)
            scan_record = ScanRecord(
                image_path=file_path,
                disease=predicted_class,
                user_id=user_id
            )
            db.session.add(scan_record)
            db.session.commit()

            # Return the prediction and disease details
            return jsonify({
                "disease": predicted_class,
                "confidence": float(confidence * 100),
                "prevention": disease_info.prevention,
                "cause": disease_info.cause,
                "contributing_factors": disease_info.contributing_factors,
                "more_info_url": disease_info.more_info_url,
            }), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @app.route("/api/diseases", methods=["GET", "POST", "PUT", "DELETE"])
    def manage_diseases():
        if request.method == "GET":
            diseases = DiseaseInfo.query.all()
            return jsonify([disease.to_dict() for disease in diseases])

        if request.method == "POST":
            data = request.json
            new_disease = DiseaseInfo(
                name=data["name"],
                prevention=data.get("prevention", ""),
                cause=data.get("cause", ""),
                contributing_factors=data.get("contributing_factors", ""),
                more_info_url=data.get("more_info_url", "")
            )
            db.session.add(new_disease)
            db.session.commit()
            return jsonify(new_disease.to_dict()), 201

        if request.method == "PUT":
            data = request.json
            disease = DiseaseInfo.query.filter_by(name=data["name"]).first()
            if not disease:
                return jsonify({"error": "Disease not found"}), 404
            disease.prevention = data.get("prevention", disease.prevention)
            disease.cause = data.get("cause", disease.cause)
            disease.contributing_factors = data.get("contributing_factors", disease.contributing_factors)
            disease.more_info_url = data.get("more_info_url", disease.more_info_url)
            db.session.commit()
            return jsonify(disease.to_dict())

        if request.method == "DELETE":
            data = request.json
            disease = DiseaseInfo.query.filter_by(name=data["name"]).first()
            if not disease:
                return jsonify({"error": "Disease not found"}), 404
            db.session.delete(disease)
            db.session.commit()
            return jsonify({"message": "Disease deleted"}), 200