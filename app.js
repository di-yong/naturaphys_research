const elements = {
    brand:  document.getElementById('brand-name'),
    cursor: document.getElementById('custom-cursor'),
    list:   document.getElementById('object-list'),
    card:   document.getElementById('object-card'),
    cardImg:    document.getElementById('card-img'),
    cardFields: document.getElementById('card-fields'),
    get clickSound() { return document.getElementById('click-sound'); }
};

let currentCode = null;

const playClick = () => {
    if (!elements.clickSound) return;
    elements.clickSound.currentTime = 0;
    elements.clickSound.volume = 0.5;
    elements.clickSound.playbackRate = 0.85;
    elements.clickSound.play().catch(() => {});
};

function renderList() {
    if (!elements.list) return;

    const groups = {};
    ARCHIVE_DATA.forEach(item => {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
    });

    elements.list.innerHTML = Object.entries(groups).map(([cat, items], i) => `
        <div class="list-group${i > 0 ? ' has-gap' : ''}">
            <div class="list-category">${cat}</div>
            ${items.map(item => `
                <div class="list-item${item.state === 'SOLD' ? ' is-sold-item' : ''}" data-code="${item.code}">
                    <span class="item-code">${item.code}</span>
                    <span class="item-state ${item.state !== 'SOLD' ? 'is-available' : 'is-sold'}"></span>
                </div>
            `).join('')}
        </div>
    `).join('');
}

function openCard(code) {
    const item = ARCHIVE_DATA.find(d => d.code === code);
    if (!item) return;
    currentCode = code;
    document.title = 'NATPHX — ' + code;

    if (elements.cardImg) {
        if (item.img) {
            elements.cardImg.style.backgroundImage = `url('${item.img}')`;
            elements.cardImg.classList.remove('no-img');
            elements.cardImg.removeAttribute('data-code');
        } else {
            elements.cardImg.style.backgroundImage = 'none';
            elements.cardImg.classList.add('no-img');
            elements.cardImg.setAttribute('data-code', item.code);
        }
    }
    if (elements.cardFields) {
        const stateClass = item.state !== 'SOLD' ? 'is-available' : 'is-sold';
        const rows = [
            ['CODE',       item.code],
            ['OBJECT',     item.object],
            ['MATERIAL',   item.material],
            ['PROCESS',    item.process],
            ['DIMENSIONS', item.dimensions],
            ['THICKNESS',  item.thickness],
            ['WEIGHT',     item.weight],
            ['SEQ NO',     item.seq],
        ];
        const notesHtml = item.notes
            ? `<div class="card-notes">${item.notes}</div>`
            : '';
        elements.cardFields.innerHTML =
            rows.map(([label, val]) => `
                <div class="card-row">
                    <label>${label}</label><span>${val}</span>
                </div>
            `).join('') +
            `<div class="card-row">
                <label>STATE</label>
                <span><i class="card-state-dot ${stateClass}"></i>${item.state}</span>
            </div>` +
            notesHtml;
    }

    preloadAdjacent(code);
    if (elements.card) elements.card.classList.add('is-open');
    playClick();
}

function preloadAdjacent(code) {
    const idx = ARCHIVE_DATA.findIndex(d => d.code === code);
    [-1, 1, -2, 2].forEach(offset => {
        const t = ARCHIVE_DATA[(idx + offset + ARCHIVE_DATA.length) % ARCHIVE_DATA.length];
        if (t && t.img) { const img = new Image(); img.src = t.img; }
    });
}

function closeCard() {
    if (elements.card) elements.card.classList.remove('is-open');
    currentCode = null;
    document.title = 'NATPHX';
    playClick();
}

function navigateCard(dir) {
    if (!currentCode) return;
    const idx = ARCHIVE_DATA.findIndex(d => d.code === currentCode);
    const next = (idx + dir + ARCHIVE_DATA.length) % ARCHIVE_DATA.length;
    openCard(ARCHIVE_DATA[next].code);
}

function openImgFullscreen() {
    const item = ARCHIVE_DATA.find(d => d.code === currentCode);
    if (!item || !item.img) return;
    const fs = document.getElementById('img-fullscreen');
    const fi = document.getElementById('img-fs-inner');
    if (!fs || !fi) return;
    fi.style.backgroundImage = `url('${item.img}')`;
    fs.classList.add('is-open');
}

function closeImgFullscreen() {
    const fs = document.getElementById('img-fullscreen');
    if (fs) fs.classList.remove('is-open');
}

function preloadAllImages() {
    const images = ARCHIVE_DATA.filter(d => d.img).map(d => d.img);
    let i = 0;
    function next() {
        if (i >= images.length) return;
        const img = new Image();
        img.onload = img.onerror = () => { i++; next(); };
        img.src = images[i];
    }
    // Start preloading 2 at a time to be network-friendly
    next(); next();
}

window.onload = () => {
    renderList();
    if (elements.brand) setTimeout(() => elements.brand.style.opacity = '1', 500);
    // After page is rendered, start background preload of all images
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => preloadAllImages(), { timeout: 3000 });
    } else {
        setTimeout(preloadAllImages, 1500);
    }
};

// Cursor
let rafPending = false, mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
            if (elements.cursor) {
                elements.cursor.style.left = mouseX + 'px';
                elements.cursor.style.top  = mouseY + 'px';
            }
            rafPending = false;
        });
    }
});

const HOVER_SELECTORS = '.list-item, #card-close, #card-prev, #card-next, #contact-email, #card-img';
document.addEventListener('mouseover', e => {
    if (elements.cursor && e.target.closest(HOVER_SELECTORS)) {
        elements.cursor.classList.add('cursor-hover');
    }
});
document.addEventListener('mouseout', e => {
    if (elements.cursor && e.target.closest(HOVER_SELECTORS)) {
        elements.cursor.classList.remove('cursor-hover');
    }
});

// Click handling
document.addEventListener('click', e => {
    const item = e.target.closest('.list-item');
    if (item) { openCard(item.dataset.code); return; }
    if (e.target.closest('#card-close'))  { closeCard(); return; }
    if (e.target.closest('#card-prev'))   { navigateCard(-1); return; }
    if (e.target.closest('#card-next'))   { navigateCard(1); return; }
    if (e.target.closest('#card-img') && currentCode) { openImgFullscreen(); return; }
    if (e.target.closest('#img-fullscreen')) { closeImgFullscreen(); return; }
});

document.addEventListener('keydown', e => {
    const fs = document.getElementById('img-fullscreen');
    if (e.key === 'Escape') {
        if (fs && fs.classList.contains('is-open')) { closeImgFullscreen(); return; }
        closeCard(); return;
    }
    if (e.key === 'ArrowLeft')  navigateCard(-1);
    if (e.key === 'ArrowRight') navigateCard(1);
});
