let currentActiveId = null;
const elements = {
    brand: document.getElementById('brand-name'),
    manifesto: document.getElementById("manifesto-text"),
    trigger: document.getElementById('access-trigger'),
    overlay: document.getElementById('auth-overlay'),
    keyInput: document.getElementById('key-input'),
    archive: document.getElementById('archive-layer'),
    void: document.getElementById('void-container'),
    cursor: document.getElementById('custom-cursor'),
    preview: document.getElementById('image-preview'),
    clock: document.getElementById('live-clock'),
    list: document.querySelector('.specimen-list'),
    reportOverlay: document.getElementById('report-overlay'),
    get clickSound() { return document.getElementById('click-sound'); }
};

const playClick = () => {
    if (!elements.clickSound) return;
    elements.clickSound.currentTime = 0;
    elements.clickSound.volume = 0.5;
    elements.clickSound.playbackRate = 0.85;
    elements.clickSound.play().catch(() => {});
};

const text = "WE DO NOT PRODUCE FASHION; WE DOCUMENT MATERIAL EVOLUTION.\nTHE FIBER IS THE WITNESS. THE SOIL IS THE ARCHIVE.";
let index = 0;

// 1. 自动生成列表
function renderArchive() {
    if (!elements.list) return;
    elements.list.innerHTML = ARCHIVE_DATA.map(item => `
        <div class="specimen-item"
             onmouseover="showPreview('${item.preview_img}')"
             onmouseleave="hidePreview()"
             onclick="openReport('${item.id}')">
            <div class="specimen-tag">${item.category || 'DATA'}</div>
            <span class="id">${item.id}</span>
            <span class="name">${item.name}</span>
            <span class="status">${item.status}</span>
        </div>
    `).join('');
}

// 2. 打字机
function typeWriter() {
    if (index < text.length && elements.manifesto) {
        const char = text.charAt(index);
        const span = document.createElement('span');
        span.innerHTML = char === '\n' ? '<br>' : char;
        elements.manifesto.appendChild(span);
        setTimeout(() => {
            span.style.opacity = "1";
            setTimeout(() => span.classList.add('faded'), 1000);
        }, 10);
        index++;
        setTimeout(typeWriter, (char === '.' || char === ',') ? 500 : Math.random() * 80 + 40);
    } else if (elements.trigger) {
        setTimeout(() => elements.trigger.style.opacity = "1", 1000);
    }
}

// 3. 初始加载逻辑
window.onload = () => {
    renderArchive();
    if (elements.brand) setTimeout(() => elements.brand.style.opacity = "1", 500);
    setTimeout(typeWriter, 3000);
};

// 4. 鼠标与光标逻辑（已加防崩溃护盾）
document.addEventListener('mousemove', e => {
    if (elements.cursor) {
        elements.cursor.style.left = e.clientX + 'px';
        elements.cursor.style.top = e.clientY + 'px';
    }
    if (elements.preview && elements.preview.style.display === 'block') {
        elements.preview.style.left = (e.clientX + 20) + 'px';
        elements.preview.style.top = (e.clientY + 20) + 'px';
    }
});

// 5. 授权逻辑
if (elements.trigger) {
    elements.trigger.onclick = () => {
        playClick();
        if (elements.overlay) {
            elements.overlay.style.display = 'flex';
            setTimeout(() => {
                elements.overlay.style.opacity = '1';
                if (elements.keyInput) elements.keyInput.focus();
            }, 10);
        }
    };
}

if (elements.keyInput) {
    elements.keyInput.addEventListener('input', (e) => {
        if (e.target.value.length > 0) playClick();
        if (e.target.value.length === 3) setTimeout(validateAccess, 100);
    });
}

const validateAccess = () => {
    if (elements.keyInput.value === "123") {
        if (elements.overlay) elements.overlay.style.opacity = '0';
        if (elements.void) {
            elements.void.style.transform = "translate(-50%, -150%) blur(20px)";
            elements.void.style.opacity = "0";
        }
        if (elements.trigger) elements.trigger.style.opacity = "0";

        setTimeout(() => {
            if (elements.overlay) elements.overlay.style.display = 'none';
            if (elements.archive) {
                elements.archive.style.display = 'flex';
                void elements.archive.offsetWidth; // 触发重绘
                renderArchive(); // 重新渲染确保 DOM 最新
                elements.archive.style.opacity = '1';
            }
            if (!window.clockTimer && elements.clock) {
                window.clockTimer = setInterval(() => {
                    elements.clock.innerText = new Date().toLocaleTimeString();
                }, 1000);
            }
        }, 800);
    } else {
        if (elements.keyInput) elements.keyInput.value = "";
    }
};

window.closeAuth = () => {
    playClick();
    if (elements.keyInput) {
        elements.keyInput.blur();
        elements.keyInput.value = "";
    }
    if (elements.overlay) {
        elements.overlay.style.opacity = '0';
        setTimeout(() => elements.overlay.style.display = 'none', 600);
    }
};

if (elements.overlay) {
    elements.overlay.onclick = (e) => {
        if (e.target === elements.overlay) closeAuth();
    };
}

// 6. 档案系统交互核心 (防崩溃版)
window.showPreview = (url) => {
    if (elements.preview) {
        elements.preview.style.backgroundImage = `url(${url})`;
        elements.preview.style.display = 'block';
    }
};

window.hidePreview = () => {
    if (elements.preview) elements.preview.style.display = 'none';
};

window.openReport = (id) => {
    const container = document.querySelector('.split-container');

    // 🚨 核心逻辑修复：如果点击的是当前已激活的 ID，并且分屏正开着，执行关闭！
    if (currentActiveId === id && container.classList.contains('active')) {
        window.closeInspection();
        return;
    }

    const item = ARCHIVE_DATA.find(d => d.id === id);
    if (!item) return;

    // 记录新的激活状态
    currentActiveId = id;

    // 填充数据
    document.getElementById('rpt-id').innerText = item.id;
    document.getElementById('rpt-material').innerText = item.report.material;
    document.getElementById('rpt-process').innerText = item.report.process;
    document.getElementById('rpt-notes').innerText = item.report.notes;

    const imgContainer = document.getElementById('rpt-img');
    if (imgContainer) imgContainer.style.backgroundImage = `url('${item.preview_img}')`;

    // 触发视觉高亮
    updateListHighlight(id);

    if (container) {
        container.classList.add('active');
        playClick();
    }
};

// 7. 终极关闭逻辑：唯一且强制挂载全局
window.closeInspection = function() {
    console.log("System: Executing Collapse...");
    const container = document.querySelector('.split-container');
    if (container && container.classList.contains('active')) {
        container.classList.remove('active');
        currentActiveId = null; // 🚨 清除记录
        updateListHighlight(null); // 🚨 清除视觉高亮
        playClick();
    }
};

// 8. 全局事件代理 (取代之前混乱的各种 onclick 绑定)
document.addEventListener('click', (e) => {
    // 处理点击 [ COLLAPSE_X ]
    if (e.target.classList.contains('inspection-close') || e.target.closest('.inspection-close')) {
        window.closeInspection();
        return;
    }

    // 处理点击左侧空白处
    const container = document.querySelector('.split-container');
    if (container && container.classList.contains('active')) {
        if (e.target.classList.contains('specimen-list-wrapper') || e.target.classList.contains('specimen-list')) {
            window.closeInspection();
        }
    }
});

// 🚨 新增辅助函数：同步左侧列表的视觉状态
function updateListHighlight(activeId) {
    const items = document.querySelectorAll('.specimen-item');
    items.forEach(item => {
        const idSpan = item.querySelector('.id');
        if (idSpan && idSpan.innerText === activeId) {
            item.classList.add('is-active');
        } else {
            item.classList.remove('is-active');
        }
    });
}

// 9. 全局键盘逃生
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeInspection();
        if (elements.overlay && elements.overlay.style.display === 'flex') closeAuth();
    }
});