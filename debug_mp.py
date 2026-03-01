import mediapipe as mp
try:
    print(f"Solutions: {mp.solutions}")
except AttributeError:
    print("mp.solutions not found")
    try:
        from mediapipe.python import solutions
        print(f"Found in python: {solutions}")
    except ImportError:
        print("mediapipe.python.solutions not found")
