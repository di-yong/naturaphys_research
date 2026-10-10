const cursor = document.getElementById('custom-cursor');
const clickSound = document.getElementById('click-sound');

function playClick() {
    if (!clickSound) return;
    clickSound.currentTime = 0;
    clickSound.volume = 0.5;
    clickSound.playbackRate = 0.85;
    clickSound.play().catch(() => {});
}

function unlockArchive() {
    document.body.classList.add('archive-unlocked');
}

function openImgFullscreen() {
    const source = document.querySelector('#card-img img');
    const fs = document.getElementById('img-fullscreen');
    const photo = document.getElementById('img-fs-photo');
    if (!source || !fs || !photo) return;
    photo.src = source.currentSrc || source.src;
    fs.classList.add('is-open');
    fs.setAttribute('aria-hidden', 'false');
    playClick();
}

function closeImgFullscreen() {
    const fs = document.getElementById('img-fullscreen');
    if (!fs || !fs.classList.contains('is-open')) return;
    fs.classList.remove('is-open');
    fs.setAttribute('aria-hidden', 'true');
    playClick();
}

function goTo(id) {
    const link = document.getElementById(id);
    if (link && link.href) window.location.href = link.href;
}

window.onload = () => {
    document.body.classList.add('is-ready');
    if (window.location.hash === '#screen-list') unlockArchive();
};

document.addEventListener('click', e => {
    const cue = e.target.closest('#brand-cue');
    if (cue && cue.getAttribute('href') === '#screen-list') {
        e.preventDefault();
        unlockArchive();
        const target = document.getElementById('screen-list');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    if (e.target.closest('#card-img')) {
        openImgFullscreen();
        return;
    }
    if (e.target.closest('#img-fullscreen')) {
        closeImgFullscreen();
    }
});

let rafPending = false;
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
            if (cursor) {
                cursor.style.left = mouseX + 'px';
                cursor.style.top = mouseY + 'px';
            }
            rafPending = false;
        });
    }
});

const HOVER_SELECTORS = '.list-item, #card-close, #card-prev, #card-next, #contact-email, #card-img';
document.addEventListener('mouseover', e => {
    if (cursor && e.target.closest(HOVER_SELECTORS)) cursor.classList.add('cursor-hover');
});
document.addEventListener('mouseout', e => {
    if (cursor && e.target.closest(HOVER_SELECTORS)) cursor.classList.remove('cursor-hover');
});

document.addEventListener('keydown', e => {
    const fs = document.getElementById('img-fullscreen');
    const fullscreenOpen = fs && fs.classList.contains('is-open');
    if (e.key === 'Escape' && fullscreenOpen) {
        closeImgFullscreen();
        return;
    }
    if (fullscreenOpen) return;
    if (e.key === 'ArrowLeft') goTo('card-prev');
    if (e.key === 'ArrowRight') goTo('card-next');
});
