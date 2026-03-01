import os
import uuid
from flask import Flask, render_template, request, send_from_directory, jsonify
from werkzeug.utils import secure_filename
from splash_utils import HoliSplashGenerator

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'static/uploads'
OUTPUT_FOLDER = 'static/outputs'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB limit

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

generator = HoliSplashGenerator()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Generate unique filenames
        unique_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        extension = filename.rsplit('.', 1)[1].lower()
        
        input_filename = f"{unique_id}_input.{extension}"
        output_filename = f"{unique_id}_output.{extension}"
        
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], input_filename)
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        
        file.save(input_path)
        
        try:
            # Get theme if provided
            theme = request.form.get('theme', 'classic')
            
            # Apply AI Splash
            generator.apply_holi_splash(input_path, output_path, theme=theme)
            
            return jsonify({
                'success': True,
                'input_url': f'/static/uploads/{input_filename}',
                'output_url': f'/static/outputs/{output_filename}'
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
            
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/static/outputs/<filename>')
def download_file(filename):
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)

@app.route('/raishab-admin-secret')
def admin_secret():
    # Password check
    # Check if 'password' query parameter is 'raishab0001'
    # URL will be: /raishab-admin-secret?pw=raishab0001
    password = request.args.get('pw')
    if password != 'raishab0001':
        return "<h1>Unauthorized!</h1><p>You need a secret key to access the Raishab Intelligence Panel.</p>", 403

    # List all files in the output directory
    try:
        files = os.listdir(app.config['OUTPUT_FOLDER'])
        files.sort(key=lambda x: os.path.getmtime(os.path.join(app.config['OUTPUT_FOLDER'], x)), reverse=True)
        images = [f for f in files if f.endswith(('.png', '.jpg', '.jpeg'))]
        return render_template('admin_secret.html', images=images)
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
