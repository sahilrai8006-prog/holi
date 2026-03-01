# 🎨 Raishab Holi Generator

A production-ready full-stack AI application that applies realistic, organic Holi color splashes to faces using Computer Vision and Deep Learning.

![Preview](https://img.shields.io/badge/AI-Holi%20Splash-ff1493)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Flask](https://img.shields.io/badge/Flask-3.0-green)

---

## 🚀 Features

- **AI Face Detection**: Uses MediaPipe for high-precision face localization.
- **Organic Splash Algorithm**: Generates irregular, noise-based color masks for realistic powder effects.
- **Premium UI**: Dark-themed Glassmorphism interface with smooth animations.
- **Before/After Comparison**: Interactive slider to compare the original and processed images.
- **Ultra-Fast Processing**: Optimized NumPy operations for near-instant results.
- **Production Ready**: Configured for Gunicorn and easy deployment.

## 🛠️ Tech Stack

- **Backend**: Python, Flask, OpenCV, MediaPipe, NumPy
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Deployment**: Gunicorn, Render/Heroku support

---

## 💻 Local Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd holi
```

### 2. Create a Virtual Environment
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On Mac/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python app.py
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 📦 Project Structure

```text
/
├── app.py              # Flask server routes
├── splash_utils.py     # AI & Image processing logic
├── static/
│   ├── css/            # Premium styles
│   ├── js/             # Frontend logic
│   ├── uploads/        # Temporary storage for inputs
│   └── outputs/        # Processed images
├── templates/
│   └── index.html      # Main UI
├── requirements.txt    # Dependency list
└── render.yaml         # Cloud deployment config
```

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---
**Made with ❤️ for Holi Celebration**
"# holi" 
