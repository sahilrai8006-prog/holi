// Particle Background System
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 60;
let clickParticles = [];
let currentTheme = 'classic';
let isMusicPlaying = false;
const playlist = [
    '/static/audio/libertybeats-colors-of-joy-holi-festival-india-344926.mp3'
];
let currentTrackIndex = 0;
const audio = new Audio(playlist[currentTrackIndex]);
audio.loop = false; // Disable loop to handle playlist transition

audio.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    audio.src = playlist[currentTrackIndex];
    if (isMusicPlaying) audio.play();
});

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
    const colors = [
        [255, 20, 147], [0, 191, 255], [255, 215, 0], [50, 205, 50], [255, 165, 0]
    ];
    for (let i = 0; i < 20; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        clickParticles.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            size: Math.random() * 8 + 4,
            alpha: 1,
            r: color[0], g: color[1], b: color[2]
        });
    }
});

window.addEventListener('resize', initParticles);
initParticles();
animateParticles();

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
        `May your life be as bright and colorful as the Holi powder, ${name}! ✨`,
        `Sending you a digital splash of love and vibrant colors this Holi, ${name}! ❤️`,
        `${name}, let the colors of Holi dance in your heart today! 🎭`
    ];

    const randomWish = wishes[Math.floor(Math.random() * wishes.length)];

    textEl.innerText = randomWish;
    output.classList.remove('hidden');
    output.scrollIntoView({ behavior: 'smooth' });
}
