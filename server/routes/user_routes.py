from flask import jsonify, request, session
from flask_mail import Message
from models import db, User
import random, string, os, re
from flask_bcrypt import Bcrypt

# Fetch pepper from environment
PEPPER = os.getenv("PEPPER")

def init_user_routes(app, mail):  # Accept mail as a parameter
    bcrypt = Bcrypt(app)

    # Helper function for password hashing
    def hash_password(password, pepper):
        return bcrypt.generate_password_hash(password + pepper).decode('utf-8')

    def check_password(hashed_password, password, pepper):
        return bcrypt.check_password_hash(hashed_password, password + pepper)

    def generate_verification_code():
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

    def send_verification_email(email, code):
        msg = Message(
            subject='Verification Code',
            sender=os.getenv('MAIL_DEFAULT_SENDER'),
            recipients=[email]
        )
        msg.body = f'Your verification code is: {code}'
        mail.send(msg)  # Use the passed mail object to send the email

    
    # Forgot Password
    @app.route("/api/forgot_password", methods=["POST"])
    def forgot_password():
        email = request.json.get("email")
        
        if not User.is_valid_email(email):
            return jsonify({"error": "Invalid email address"}), 400
        
        user = User.query.filter_by(email=email).first()
        if user is None:
            return jsonify({"error": "Email not found"}), 404

        def generate_password():
            while True:
                password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
                if re.search(r'\d', password) and len(password) >= 8:
                    return password

        new_password = generate_password()
        hashed_password = hash_password(new_password, PEPPER)  # Use the hash_password function
        
        user.password = hashed_password
        db.session.commit()

        msg = Message('Your New Password', 
                      sender=os.getenv('MAIL_USERNAME'), 
                      recipients=[email])
        msg.body = f'Your new password is: {new_password}'
        email.send(msg)

        return jsonify({"message": "New password sent to your email"}), 200

    # SignUp
    @app.route("/api/create_token", methods=["POST"])
    def create_token():
        name = request.json["name"]
        email = request.json["email"]
        password = request.json["password"]
        
        user = User.query.filter_by(email=email).first()

        if user and user.is_verified:
            return jsonify({"error": "Email already exists"}), 409
        elif user and not user.is_verified:
            # Resend verification code
            verification_code = generate_verification_code()
            user.verification_code = verification_code
            user.password = hash_password(password, PEPPER)  # Hash with pepper
            db.session.commit()
            send_verification_email(email, verification_code)
            return jsonify({"message": "Verification email resent. Please check your email."}), 200
        
        # Create new user if not exists
        verification_code = generate_verification_code()
        hashed_password = hash_password(password, PEPPER)   # Hash with pepper
        new_user = User(name=name, email=email, password=hashed_password, is_verified=False, verification_code=verification_code)
        db.session.add(new_user)
        db.session.commit()

        send_verification_email(email, verification_code)
        
        return jsonify({
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        })
    
    # Verify account
    @app.route("/api/verify_account", methods=["POST"])
    def verify_account():
        email = request.json["email"]
        code = request.json["code"]
    
        user = User.query.filter_by(email=email).first()
    
        if user is None or user.verification_code != code:
            return jsonify({"error": "Invalid verification code"}), 400
        
        user.is_verified = True
        db.session.commit()
    
        session['user_id'] = user.id
    
        return jsonify({"status": "verified"})
    
    # SignUp Website
    @app.route("/api/create_token1", methods=["POST"])
    def create_token1():
        name = request.json["name"]
        email = request.json["email"]
        password = request.json["password"]
        
        user_exists = User.query.filter_by(email=email).first() is not None
    
        if user_exists:
            return jsonify({"error": "Email already exists"}), 409
        
        verification_code = generate_verification_code()
        hashed_password = hash_password(password, PEPPER)   # Hash with pepper
        new_user = User(name=name, email=email, password=hashed_password, is_verified=True, verification_code=verification_code)
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        })
    
    # Login
    @app.route("/api/token", methods=["POST"])
    def token():
        email = request.json["email"]
        password = request.json["password"]
    
        user = User.query.filter_by(email=email).first()
    
        if user is None:
            return jsonify({"error": "Email not exist"}), 401
        
        if not check_password(user.password, password, PEPPER):  # Use check_password with PEPPER
            return jsonify({"error": "Wrong password"}), 401
        
        if not user.is_verified:
            return jsonify({"error": "Account not verified"}), 403
    
        session["user_id"] = user.id
    
        return jsonify({
            "status": "success",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }), 200
    
    @app.route("/api/user/<id>", methods=["GET"])
    def get_user(id):
        user = User.query.get(id)
        if user is None:
            return jsonify({"error": "User not found"}), 404
    
        return jsonify({
            "id": user.id,
            "name": user.name,
            "email": user.email
        })
    
    @app.route("/api/check-password", methods=["POST"])
    def check_password_route():
        id = request.json["id"]
        password = request.json["password"]
        
        # Get the user based on the ID
        user = User.query.get(id)
        if user is None:
            return jsonify({"error": "User not found"}), 404

        # Use the check_password helper function with the correct arguments (hashed password, plain password, pepper)
        if check_password(user.password, password, PEPPER):
            return jsonify({"valid": True}), 200
        else:
            return jsonify({"valid": False}), 200
    
    @app.route("/api/update/<id>", methods=["PUT"])
    def update_profile(id):
        data = request.json

        user = User.query.get(id)
        if user is None:
            return jsonify({"error": "User not found"}), 404

        if 'name' in data:
            user.name = data['name']

        if 'password' in data:
            new_password = hash_password(data['password'], PEPPER)  # Pass PEPPER here
            user.password = new_password

        try:
            db.session.commit()
            return jsonify({"updated": True}), 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({"error": "Could not update profile"}), 500

