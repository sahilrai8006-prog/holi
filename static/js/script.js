// Particle Background System
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 60;
let clickParticles = [];
let currentTheme = 'classic';
let isMusicPlaying = false;
const playlist = [
    '/static/audio/libertybeats-colors-of-joy-holi-festival-india-344926.mp3',
    '/static/audio/india_happy-holi-festival-dance-487100.mp3'
];
let currentTrackIndex = 0;
const audio = new Audio(playlist[currentTrackIndex]);
audio.loop = false;

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    audio.src = playlist[currentTrackIndex];
    if (isMusicPlaying) {
        audio.play().catch(e => console.log("Audio play blocked"));
    }
}

audio.addEventListener('ended', nextTrack);

const skipBtn = document.getElementById('skip-btn');
if (skipBtn) {
    skipBtn.addEventListener('click', () => {
        nextTrack();
        // Shake animation on skip
        skipBtn.style.transform = 'scale(1.2)';
        setTimeout(() => skipBtn.style.transform = 'scale(1)', 200);
    });
}

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 4 + 1,
            speedX: Math.random() * 1 - 0.5,
            speedY: Math.random() * 1 - 0.5,
            color: `hsla(${Math.random() * 360}, 70%, 60%, ${Math.random() * 0.4 + 0.1})`
        });
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    });

    // Animate Click Splashes
    for (let i = clickParticles.length - 1; i >= 0; i--) {
        const p = clickParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        p.size *= 0.98;

        if (p.alpha <= 0) {
            clickParticles.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha})`;
        ctx.fill();
    }

    requestAnimationFrame(animateParticles);
}

// Interactive Click Splash
window.addEventListener('mousedown', (e) => {
    createSplash(e.clientX, e.clientY, 20);
});

window.addEventListener('mousemove', (e) => {
    // Lower chance of splash on move for performance and subtlety
    if (Math.random() < 0.15) {
        createSplash(e.clientX, e.clientY, 3);
    }
});

function createSplash(x, y, count) {
    const colors = [
        [255, 20, 147], [0, 191, 255], [255, 215, 0], [50, 205, 50], [255, 165, 0]
    ];
    for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        clickParticles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: Math.random() * 5 + 2,
            alpha: 1,
            r: color[0], g: color[1], b: color[2]
        });
    }
}

window.addEventListener('resize', initParticles);
initParticles();
animateParticles();

// Holi Countdown Logic
function updateCountdown() {
    const targetDate = new Date('March 3, 2026 00:00:00').getTime();
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff > 0) {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(d).padStart(2, '0');
        document.getElementById('hours').innerText = String(h).padStart(2, '0');
        document.getElementById('minutes').innerText = String(m).padStart(2, '0');
        document.getElementById('seconds').innerText = String(s).padStart(2, '0');
    }
}

setInterval(updateCountdown, 1000);
updateCountdown();

// Fade-in Intersection Observer
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Uploader Logic
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadPrompt = document.getElementById('upload-prompt');
const loader = document.getElementById('loader');
const resultView = document.getElementById('result-view');
const slider = document.getElementById('slider');
const afterImg = document.querySelector('.after');
const sliderDivider = document.querySelector('.slider-divider');

if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        const files = e.dataTransfer.files;
        if (files.length) handleUpload(files[0]);
    });

    dropZone.addEventListener('click', () => fileInput.click());
}

// Theme Selection
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTheme = btn.dataset.theme;

        // Update Theme Pill
        const pill = document.querySelector('#theme-pill');
        const color = btn.style.getPropertyValue('--col');
        pill.querySelector('.dot').style.background = color;
        pill.querySelector('.dot').style.boxShadow = `0 0 10px ${color}`;
        pill.innerText = '';
        pill.innerHTML = `<span class="dot" style="background:${color}; box-shadow: 0 0 10px ${color}"></span> ${btn.innerText} Mode`;
    });
});

// Music Toggle
const musicBtn = document.getElementById('music-btn');
if (musicBtn) {
    musicBtn.addEventListener('click', () => {
        isMusicPlaying = !isMusicPlaying;
        if (isMusicPlaying) {
            audio.play().catch(e => console.log("Audio play blocked by browser"));
            musicBtn.innerText = '⏸️';
            musicBtn.style.background = 'var(--primary)';
        } else {
            audio.pause();
            musicBtn.innerText = '🎵';
            musicBtn.style.background = 'var(--glass-heavy)';
        }
    });
}

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleUpload(e.target.files[0]);
    });
}

async function handleUpload(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload a cinematic portrait image.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('theme', currentTheme);

    // Show loading sequence
    uploadPrompt.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            displayResult(data.input_url, data.output_url);
        } else {
            alert(data.error || 'The neural engine encountered an issue.');
            resetUI();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Processing failed. Please check your connection.');
        resetUI();
    }
}

function displayResult(inputUrl, outputUrl) {
    document.getElementById('before-img').src = inputUrl;
    document.getElementById('after-img').src = outputUrl;
    document.getElementById('download-btn').href = outputUrl;

    dropZone.classList.add('hidden');
    resultView.classList.remove('hidden');
    resultView.scrollIntoView({ behavior: 'smooth' });
}

function resetUI() {
    uploadPrompt.classList.remove('hidden');
    loader.classList.add('hidden');
}

// Share Logic
const shareBtn = document.getElementById('share-btn');
if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
        const afterImg = document.getElementById('after-img');
        if (!afterImg.src) return;

        try {
            const response = await fetch(afterImg.src);
            const blob = await response.blob();
            const file = new File([blob], 'raishab_holi_splash.png', { type: 'image/png' });

            if (navigator.share) {
                await navigator.share({
                    title: 'My Raishab Holi Splash!',
                    text: 'Check out my cinematic Holi makeover! Created with Raishab Holi AI.',
                    files: [file]
                });
            } else {
                alert('Sharing not supported on this browser. You can download the image instead!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    });
}

// Slider logic
if (slider) {
    slider.addEventListener('input', (e) => {
        const value = e.target.value;
        afterImg.style.clipPath = `inset(0 0 0 ${value}%)`;
        sliderDivider.style.left = `${value}%`;
    });
}

// Holi Wish Generator
function generateHoliWish() {
    const nameInput = document.getElementById('wish-name');
    const photoInput = document.getElementById('wish-photo');
    const name = nameInput.value.trim() || 'My Dear Friend';
    const output = document.getElementById('wish-output');
    const textEl = document.getElementById('wish-text');
    const photoDisplay = document.getElementById('wish-photo-display');
    const wishImg = document.getElementById('selected-wish-img');

    // Handle Image Preview
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            wishImg.src = e.target.result;
            photoDisplay.classList.remove('hidden');
        }
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        photoDisplay.classList.add('hidden');
    }

    const wishes = [
        `May the colors of Holi fill your life with cinematic joy and prosperity, ${name}! 🌈`,
        `Wishing you a vibrant Holi splash of happiness and success, ${name}! 🎨`,
        `${name}, आपको और आपके परिवार को होली की हार्दिक शुभकामनाएं! यह त्योहार आपके जीवन में खुशियों के रंग भर दे। 🌸`,
        `May your life be as bright and colorful as the Holi powder, ${name}! ✨`,
        `होली के इस पावन पर्व पर, आपके जीवन में सुख, शांति और समृद्धि आए, ${name}! 🌈`,
        `Sending you a digital splash of love and vibrant colors this Holi, ${name}! ❤️`,
        `${name}, let the colors of Holi dance in your heart today! 🎭`,
        `रंगों का त्योहार है होली, खुशियों की बौछार है होली! ${name}, हैप्पी होली! 🎨`,
        `Wishing you a Holi full of cinematic frames and vibrant memories, ${name}! 📸`
    ];

    const randomWish = wishes[Math.floor(Math.random() * wishes.length)];

    textEl.innerText = randomWish;
    output.classList.remove('hidden');
    output.scrollIntoView({ behavior: 'smooth' });
}

async function downloadHoliCard() {
    const name = document.getElementById('wish-name').value.trim() || 'My Dear Friend';
    const wishText = document.getElementById('wish-text').innerText;
    const userImg = document.getElementById('selected-wish-img');
    const hasPhoto = !document.getElementById('wish-photo-display').classList.contains('hidden');

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');

    // 1. Background - Premium Dark Gradient
    const bgGradient = ctx.createRadialGradient(540, 675, 100, 540, 675, 1000);
    bgGradient.addColorStop(0, '#151515');
    bgGradient.addColorStop(1, '#050505');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1080, 1350);

    // 2. Artistic Color Splashes
    const colors = ['#FF1493', '#00BFFF', '#FFD700', '#32CD32', '#FF8C00'];
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 1080;
        const y = Math.random() * 1350;
        const size = Math.random() * 400 + 100;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
        const col = colors[Math.floor(Math.random() * colors.length)];
        grad.addColorStop(0, col + '44');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3. User Portrait (if available)
    if (hasPhoto && userImg.complete) {
        // Draw image frame
        const frameSize = 650;
        const fx = 540 - frameSize / 2;
        const fy = 180;

        ctx.save();
        // Create rounded clip for image
        ctx.beginPath();
        ctx.roundRect(fx, fy, frameSize, frameSize, 50);
        ctx.clip();

        // Draw Image - Maintain Aspect Ratio (Cover)
        const imgRatio = userImg.naturalWidth / userImg.naturalHeight;
        let dw, dh, dx, dy;
        if (imgRatio > 1) {
            dh = frameSize;
            dw = frameSize * imgRatio;
            dx = fx - (dw - frameSize) / 2;
            dy = fy;
        } else {
            dw = frameSize;
            dh = frameSize / imgRatio;
            dx = fx;
            dy = fy - (dh - frameSize) / 2;
        }
        ctx.drawImage(userImg, dx, dy, dw, dh);
        ctx.restore();

        // Frame Border Glow
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 4;
        ctx.strokeRect(fx, fy, frameSize, frameSize);
    }

    // 4. Text - Greeting
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';

    // Header
    ctx.font = 'bold 100px Outfit';
    ctx.fillText('HAPPY HOLI', 540, hasPhoto ? 950 : 450);

    // Premium Line
    ctx.strokeStyle = '#FF1493';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(440, hasPhoto ? 980 : 480);
    ctx.lineTo(640, hasPhoto ? 980 : 480);
    ctx.stroke();

    // Wish Text - Multiline
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '40px Plus Jakarta Sans';
    const maxWidth = 800;
    const lineHeight = 60;
    const yStart = hasPhoto ? 1080 : 600;
    wrapText(ctx, wishText, 540, yStart, maxWidth, lineHeight);

    // 5. Branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '30px Outfit';
    ctx.fillText('#RaishabHoli ✨ #ColorsOfJoy', 540, 1280);

    // Download Logic
    const link = document.createElement('a');
    link.download = `Raishab_Holi_Wish_${name.replace(/ /g, '_')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

function copyWishText() {
    const wishText = document.getElementById('wish-text').innerText;
    navigator.clipboard.writeText(wishText).then(() => {
        const copyBtn = document.getElementById('copy-wish-btn');
        const originalText = copyBtn.innerText;
        copyBtn.innerText = '✅ Copied!';
        copyBtn.classList.add('accent-btn');
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.classList.remove('accent-btn');
        }, 2000);
    });
}
