document.addEventListener('DOMContentLoaded', () => {
    // 1. Cover & Audio Logic
    const btnOpen = document.getElementById('btn-open-invitation');
    const coverOverlay = document.getElementById('cover-overlay');
    const bgAudio = document.getElementById('bg-audio');
    const musicControl = document.getElementById('music-control');
    const musicIcon = musicControl.querySelector('i');
    
    let isPlaying = false;

    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            // Hide Cover
            coverOverlay.classList.add('opened');
            document.body.style.overflow = 'auto'; // Re-enable scrolling

            // Play Audio
            if (bgAudio) {
                bgAudio.play().then(() => {
                    isPlaying = true;
                    musicControl.classList.remove('paused');
                    musicIcon.classList.replace('ph-play', 'ph-music-notes');
                }).catch(e => console.log('Autoplay blocked:', e));
            }
        });
    }

    if (musicControl) {
        musicControl.addEventListener('click', () => {
            if (isPlaying) {
                bgAudio.pause();
                musicControl.classList.add('paused');
                musicIcon.classList.replace('ph-music-notes', 'ph-play');
            } else {
                bgAudio.play();
                musicControl.classList.remove('paused');
                musicIcon.classList.replace('ph-play', 'ph-music-notes');
            }
            isPlaying = !isPlaying;
        });
    }

    // 2. Countdown Logic
    const countdownTarget = document.getElementById('countdown-target');
    if (countdownTarget) {
        const targetDate = new Date(countdownTarget.value).getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                document.getElementById('cd-days').innerText = "00";
                document.getElementById('cd-hours').innerText = "00";
                document.getElementById('cd-minutes').innerText = "00";
                document.getElementById('cd-seconds').innerText = "00";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('cd-days').innerText = String(days).padStart(2, '0');
            document.getElementById('cd-hours').innerText = String(hours).padStart(2, '0');
            document.getElementById('cd-minutes').innerText = String(minutes).padStart(2, '0');
            document.getElementById('cd-seconds').innerText = String(seconds).padStart(2, '0');
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // 3. Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;

        reveals.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load
});
