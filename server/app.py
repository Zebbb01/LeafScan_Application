from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_mail import Mail
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from models import db, DiseaseInfo  # Import DiseaseInfo model
from dotenv import load_dotenv
import os

# Import routes
from routes.user_routes import init_user_routes
from routes.forecasting_routes import init_forecasting_routes
from routes.image_routes import init_image_routes
from routes.csv_routes import init_csv_routes
from routes.report_routes import init_report_routes

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Flask Configurations
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = os.getenv('SQLALCHEMY_TRACK_MODIFICATIONS', 'False').lower() == 'true'
app.config['SQLALCHEMY_ECHO'] = os.getenv('SQLALCHEMY_ECHO') == 'True'

# Mail configuration
app.config.update(
    MAIL_SERVER=os.getenv('MAIL_SERVER'),
    MAIL_PORT=int(os.getenv('MAIL_PORT', 465)),
    MAIL_USERNAME=os.getenv('MAIL_USERNAME'),
    MAIL_PASSWORD=os.getenv('MAIL_PASSWORD'),
    MAIL_USE_TLS=os.getenv('MAIL_USE_TLS') == 'True',
    MAIL_USE_SSL=os.getenv('MAIL_USE_SSL') == 'True',
    MAIL_DEFAULT_SENDER=os.getenv('MAIL_DEFAULT_SENDER')
)

mail = Mail(app)
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Initialize PostgreSQL database and migration
db.init_app(app)
migrate = Migrate(app, db)

# Seed the database
with app.app_context():
    DiseaseInfo.seed()

# Serve frontend
website_folder = os.path.join(os.getcwd(), "..", "frontend", "build")
@app.route("/", defaults={"filename": ""})
@app.route("/<path:filename>")
def index(filename):
    if not filename:
        filename = "index.html"
    return send_from_directory(website_folder, filename)

# Initialize routes
init_user_routes(app, mail)
init_forecasting_routes(app)
init_image_routes(app)
init_csv_routes(app)
init_report_routes(app)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
