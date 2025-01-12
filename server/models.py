from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
import re
from werkzeug.security import generate_password_hash
from datetime import datetime

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

# User Table
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, index=True)
    password = db.Column(db.Text, nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    verification_code = db.Column(db.String(32), nullable=True)
    scan_count = db.Column(db.Integer, default=0)  # Track the number of scans
    scanned_today = db.Column(db.Integer, default=0)  # Track the number of scans today
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Track user creation timestamp

    @staticmethod
    def is_valid_email(email):
        """Validate email format."""
        return re.match(r"[^@]+@[^@]+\.[^@]+", email) is not None

    @staticmethod
    def hash_password(password):
        """Hash password before storing."""
        return generate_password_hash(password)

    def set_password(self, password):
        self.password = self.hash_password(password)

    def __repr__(self):
        return f"<User {self.name} - {self.email}>"
    
# Scanner Table  
class ScanRecord(db.Model):
    __tablename__ = 'scan_records'
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)  # Nullable if scans are anonymous
    image_path = db.Column(db.String(255), nullable=False)  # Path to saved image file
    disease = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Timestamp when scan is created

    user = db.relationship('User', backref=db.backref('scans', lazy=True))  # Relationship to track user

# Production Table
class Production(db.Model):
    __tablename__ = 'production'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    value = db.Column(db.Float)  # Adjust the column names and types as needed

    def __init__(self, date, value):
        self.date = date
        self.value = value

    def __repr__(self):
        return f'<Production {self.date} - {self.value}>'
    
# Disease Info Table    
class DiseaseInfo(db.Model):
    __tablename__ = "disease_info"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    prevention = db.Column(db.Text, nullable=True)
    cause = db.Column(db.Text, nullable=True)
    contributing_factors = db.Column(db.Text, nullable=True)
    more_info_url = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            "name": self.name,
            "prevention": self.prevention,
            "cause": self.cause,
            "contributing_factors": self.contributing_factors,
            "more_info_url": self.more_info_url
        }

    @staticmethod
    def seed():
        """Seed the disease information table with initial data."""
        diseases_data = {
            "Vascular Streak Dieback (VSD)": {
                "prevention": "Implement regular pruning practices to remove infected or dead branches, which helps reduce sources of infection. Disinfect pruning tools before and after each use to prevent spreading the fungus. Apply fungicide sprays, particularly during the rainy season or in humid conditions, as a preventive measure. Ensure proper soil nutrition through regular fertilization, which strengthens plant resistance against pathogens. Additionally, manage shade to improve air circulation around branches and reduce humidity levels.",
                "cause": "Caused by fungal pathogens such as *Phytophthora* species or *Moniliophthora roreri*.",
                "contributing_factors": "Poor pruning practices, mechanical damage, environmental stress (e.g., drought), and poor soil nutrition can weaken branches, making them more susceptible to infections. High humidity and wet conditions can also exacerbate the spread of these pathogens.",
                "more_info_url": "https://www.sciencedirect.com/science/article/abs/pii/S1878614611001437"
            },
            "Cacao Early Blight": {
                "prevention": "Use resistant cacao varieties whenever possible, as these can significantly reduce the risk of early blight. Apply fungicides preventatively, especially in the rainy season when humidity levels are high. Ensure proper spacing between trees to promote air circulation and reduce humidity around the plants. Keep the plantation weed-free, as weeds can increase local humidity and harbor pests that contribute to stress. Proper fertilization and irrigation practices are also important to maintain plant health and reduce susceptibility.",
                "cause": "Caused by *Phytophthora megakarya* or *Phytophthora palmivora*.",
                "contributing_factors": "Similar to late blight, early blight is favored by wet, humid environments, particularly during the rainy season. Overcrowded plants and stressed cacao trees are more susceptible.",
                "more_info_url": "https://apsjournals.apsnet.org/doi/10.1094/PDIS-03-20-0565-RE"
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

        # Add each disease data to the table
        for name, data in diseases_data.items():
            disease = DiseaseInfo.query.filter_by(name=name).first()
            if not disease:
                disease = DiseaseInfo(
                    name=name,
                    prevention=data["prevention"],
                    cause=data["cause"],
                    contributing_factors=data["contributing_factors"],
                    more_info_url=data["more_info_url"]
                )
                db.session.add(disease)
        db.session.commit()
