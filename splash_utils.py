import cv2
import numpy as np
import random
import os

class HoliSplashGenerator:
    def __init__(self):
        self.use_mediapipe = False
        try:
            import mediapipe as mp
            self.mp_face_detection = mp.solutions.face_detection
            self.face_detection = self.mp_face_detection.FaceDetection(
                model_selection=1, min_detection_confidence=0.5
            )
            self.use_mediapipe = True
        except (AttributeError, ImportError, Exception):
            print("MediaPipe fallback utilized.")
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Theme-based Palettes (BGR format for OpenCV)
        self.palettes = {
            'classic': [(231, 20, 255), (255, 191, 0), (50, 205, 50), (0, 165, 255), (255, 255, 0)], # BGR Pink, Cyan, etc
            'neon': [(0, 255, 57), (255, 0, 255), (0, 255, 255), (255, 100, 0), (255, 255, 0)],
            'vintage': [(120, 80, 200), (80, 120, 180), (100, 150, 100), (150, 100, 80)],
            'pastel': [(221, 160, 221), (176, 224, 230), (152, 251, 152), (255, 218, 185), (255, 250, 205)]
        }

    def _detect_faces(self, image):
        h, w, _ = image.shape
        faces = []
        if self.use_mediapipe:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.face_detection.process(rgb_image)
            if results.detections:
                for d in results.detections:
                    b = d.location_data.relative_bounding_box
                    faces.append((int(b.xmin * w), int(b.ymin * h), int(b.width * w), int(b.height * h)))
        else:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            detected = self.face_cascade.detectMultiScale(gray, 1.1, 4)
            for (x, y, w_f, h_f) in detected:
                faces.append((x, y, w_f, h_f))
        return faces

    def _generate_organic_mask(self, size):
        """Generates a high-fidelity 'Dust-Mist' mask for realistic powder scattering."""
        mask = np.zeros((size, size), dtype=np.float32)
        center = size // 2
        
        # 1. Base irregular blob (The core splash)
        num_points = random.randint(20, 30) # More points for complexity
        radius_base = size // 3.5
        points = []
        for i in range(num_points):
            angle = (i / num_points) * 2 * np.pi
            r = radius_base + random.randint(-int(radius_base * 0.6), int(radius_base * 0.4))
            points.append([int(center + r * np.cos(angle)), int(center + r * np.sin(angle))])
        
        cv2.fillPoly(mask, [np.array(points)], 1.0)
        
        # 2. Scatter Points (Dust particles around the core)
        for _ in range(80):
            sx = random.randint(0, size-1)
            sy = random.randint(0, size-1)
            # Gaussian distribution for scattering density
            dist = np.sqrt((sx-center)**2 + (sy-center)**2)
            prob = np.exp(-(dist**2) / (size * 10.0))
            if random.random() < prob:
                cv2.circle(mask, (sx, sy), random.randint(1, 3), 0.8, -1)

        # 3. Micro-Texture (Grain)
        noise = np.random.normal(0.6, 0.4, (size, size)).astype(np.float32)
        mask = mask * noise
        
        # 4. Multiscale Blurring for softness + core density
        mask_soft = cv2.GaussianBlur(mask, (25, 25), 0)
        mask_detail = cv2.GaussianBlur(mask, (5, 5), 0)
        mask = cv2.addWeighted(mask_soft, 0.4, mask_detail, 0.6, 0)
        
        return np.clip(mask, 0, 1)

    def _apply_blend(self, roi, color_img, mask):
        """Ultra-Realistic Physical Blending Layering."""
        mask_3d = np.expand_dims(mask, axis=2)
        
        # LUMINANCE PRESERVATION logic
        # Convert ROI to grayscale to use as a luminance map
        gray_roi = cv2.cvtColor(roi.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
        gray_roi_3d = np.stack([gray_roi]*3, axis=2)
        
        # 1. TEXTURE MULTIPLY (The powder 'sinks' into skin wrinkles)
        # We multiply the color by the original surface luminance
        textured_color = color_img * (gray_roi_3d * 0.6 + 0.4) 
        
        # 2. SOFT LIGHT BLEND
        # This preserves the underlying skin texture (pores, shadows)
        # Result = (1-2b)*a^2 + 2b*a
        a = roi / 255.0
        b = textured_color / 255.0
        soft_light = (1.0 - 2.0*b)*a*a + 2.0*b*a
        soft_light_255 = np.clip(soft_light * 255.0, 0, 255)
        
        # Final weighted composition based on organic mask
        # Higher opacity in center, feathered edges
        alpha = mask_3d * 0.85
        blended = (1.0 - alpha) * roi + alpha * soft_light_255
        
        return blended

    def _add_particles(self, canvas, faces):
        """Adds fine dust particles floating in the air with bokeh-blur."""
        h, w, _ = canvas.shape
        num_particles = 3000 # Double particles for depth
        
        # Create a particle overlay for alpha blending
        overlay = canvas.copy().astype(np.float32)
        
        for _ in range(num_particles):
            px, py = random.randint(0, w-1), random.randint(0, h-1)
            near_face = any(fx-100 < px < fx+fw+100 and fy-100 < py < fh+fy+100 for (fx, fy, fw, fh) in faces)
            
            size = random.randint(1, 4)
            # Variation in brightness for 'sparkle' effect
            val = random.randint(180, 255)
            color = random.choice([
                (val, 20, 200), (val, 150, 20), (20, val, 255), (255, 255, val)
            ])
            
            if near_face or random.random() < 0.15:
                # Add sparkle
                cv2.circle(overlay, (px, py), size, (color[2], color[1], color[0]), -1)
        
        # Blend overlay back with low opacity for 'cloud' feel
        cv2.addWeighted(overlay, 0.2, canvas.astype(np.float32), 0.8, 0, canvas)

    def apply_holi_splash(self, image_path, output_path, theme='classic'):
        image = cv2.imread(image_path)
        if image is None: return False
            
        h, w, _ = image.shape
        faces = self._detect_faces(image)
        canvas = image.astype(np.float32)
        
        # Get theme palettes
        holi_colors = self.palettes.get(theme, self.palettes['classic'])

        # 1. Apply Splashes
        for (fx, fy, fw, fh) in faces:
            for _ in range(random.randint(6, 10)): # More splashes for realism
                color = random.choice(holi_colors)
                # Note: colors stored as BGR in palettes now
                color_bgr = np.array([color[0], color[1], color[2]], dtype=np.float32)
                
                s_size = random.randint(fh // 2, int(fh * 1.8))
                mask = self._generate_organic_mask(s_size)
                
                # Offset with shadow logic
                ox, oy = fx + random.randint(-fw//2, fw), fy + random.randint(-fh//2, fh)
                
                x1, y1 = max(0, ox), max(0, oy)
                x2, y2 = min(w, ox + s_size), min(h, oy + s_size)
                
                if x2 > x1 and y2 > y1:
                    sx1, sy1 = x1 - ox, y1 - oy
                    sx2, sy2 = sx1 + (x2 - x1), sy1 + (y2 - y1)
                    
                    sub_mask = mask[sy1:sy2, sx1:sx2]
                    roi = canvas[y1:y2, x1:x2]
                    color_img = np.full(roi.shape, color_bgr, dtype=np.float32)
                    
                    # Apply complex blending
                    canvas[y1:y2, x1:x2] = self._apply_blend(roi, color_img, sub_mask)

        # 4. Cinematic Post-Processing
        # - Theme-specific grading
        if theme == 'vintage':
            canvas[:,:,0] *= 0.85 # Less Blue
            canvas[:,:,1] *= 0.9 # Less Green
            canvas[:,:,2] *= 1.1 # More Red (Warm)
            canvas = np.power(canvas / 255.0, 1.1) * 255.0 # Higher contrast
        elif theme == 'neon':
            canvas = np.power(canvas / 255.0, 0.8) * 255.0 # High vibrancy
        else:
            canvas = np.power(canvas / 255.0, 0.9) * 255.0 # Standard
        
        # - Bloom Effect (Subtle glow on highlights)
        img_uint = np.clip(canvas, 0, 255).astype(np.uint8)
        bloom = cv2.GaussianBlur(img_uint, (0, 0), sigmaX=30, sigmaY=30)
        canvas = cv2.addWeighted(canvas, 1.0, bloom.astype(np.float32), 0.15, 0)

        # 5. Add Floating Particles
        processed = np.clip(canvas, 0, 255).astype(np.uint8)
        self._add_particles(processed, faces)
        
        # 6. Global grading & Vignette
        h, w = processed.shape[:2]
        kernel_x = cv2.getGaussianKernel(w, w/2)
        kernel_y = cv2.getGaussianKernel(h, h/2)
        kernel = kernel_y * kernel_x.T
        mask = kernel / kernel.max()
        
        processed = processed.astype(np.float32)
        vignette_intensity = 0.85 if theme == 'vintage' else 0.8
        for i in range(3):
            processed[:,:,i] *= (1 - vignette_intensity + vignette_intensity * mask)

        # Highlight boost
        if theme == 'pastel':
            processed *= 1.05
        else:
            processed[:,:,2] *= 1.05 # Red
            processed[:,:,1] *= 1.02 # Green
        
        final = np.clip(processed, 0, 255).astype(np.uint8)
        cv2.imwrite(output_path, final)
        return True
