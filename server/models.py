from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
import re
from werkzeug.security import generate_password_hash

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, index=True)
    password = db.Column(db.Text, nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    verification_code = db.Column(db.String(32), nullable=True)

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
