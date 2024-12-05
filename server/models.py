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