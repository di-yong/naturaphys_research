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
    reportOverlay: document.getElementById('report-overlay')
};

const text = "WE DO NOT PRODUCE FASHION; WE DOCUMENT MATERIAL EVOLUTION.\nTHE FIBER IS THE WITNESS. THE SOIL IS THE ARCHIVE.";
let index = 0;

// 1. 自动生成列表
function renderArchive() {
    elements.list.innerHTML = ARCHIVE_DATA.map(item => `
        <div class="specimen-item"
             onmouseover="showPreview('${item.preview_img}')"
             onmouseleave="hidePreview()"
             onclick="openReport('${item.id}')">
            <span class="id">${item.id}</span>
            <span class="name">${item.name}</span>
            <span class="status">${item.status}</span>
        </div>
    `).join('');
}

// 2. 打字机
function typeWriter() {
    if (index < text.length) {
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
    } else {
        setTimeout(() => elements.trigger.style.opacity = "1", 1000);
    }
}

// 3. 交互逻辑
window.onload = () => {
    renderArchive(); // 先准备好列表内容
    setTimeout(() => elements.brand.style.opacity = "1", 500);
    setTimeout(typeWriter, 3000);
};

document.addEventListener('mousemove', e => {
    elements.cursor.style.left = e.clientX + 'px';
    elements.cursor.style.top = e.clientY + 'px';
    if (elements.preview.style.display === 'block') {
        elements.preview.style.left = (e.clientX + 20) + 'px';
        elements.preview.style.top = (e.clientY + 20) + 'px';
    }
});

elements.trigger.onclick = () => {
    elements.overlay.style.display = 'flex';
    setTimeout(() => { elements.overlay.style.opacity = '1'; elements.keyInput.focus(); }, 10);
};

elements.keyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (elements.keyInput.value === "123") {
            elements.overlay.style.opacity = '0';
            elements.void.style.transform = "translate(-50%, -150%) blur(20px)";
            elements.void.style.opacity = "0";
            elements.trigger.style.opacity = "0";
            setTimeout(() => {
                elements.overlay.style.display = 'none';
                elements.archive.style.display = 'flex';
                void elements.archive.offsetWidth;
                elements.archive.style.opacity = '1';
                setInterval(() => { elements.clock.innerText = new Date().toLocaleTimeString(); }, 1000);
            }, 800);
        } else {
            elements.keyInput.value = "";
        }
    }
});

window.showPreview = (url) => { elements.preview.style.backgroundImage = `url(${url})`; elements.preview.style.display = 'block'; };
window.hidePreview = () => { elements.preview.style.display = 'none'; };

window.openReport = (id) => {
		console.log("1. 点击触发成功，ID:", id);

        const item = ARCHIVE_DATA.find(d => d.id === id);
        if (!item) {
            console.error("2. 没找到数据，请检查 data.js 里的 ID 是否匹配");
            return;
        }

        // 暴力直接抓取 DOM
        const overlay = document.getElementById('report-overlay');

        // 填充内容
        document.getElementById('rpt-id').innerText = item.id;
        document.getElementById('rpt-material').innerText = item.report.material;
        document.getElementById('rpt-process').innerText = item.report.process;
        document.getElementById('rpt-notes').innerText = item.report.notes;

        // 唤醒盒子
        console.log("3. 准备显示盒子");
        overlay.style.display = 'flex';

        // 延迟 50 毫秒触发透明度，确保 display:flex 已经生效
        setTimeout(() => {
            overlay.style.opacity = '1';
            console.log("4. 盒子应该已经可见了");
        }, 50);
};

window.closeReport = () => {
    const reportOverlay = document.getElementById('report-overlay');
    reportOverlay.style.opacity = '0';
    setTimeout(() => { reportOverlay.style.display = 'none'; }, 800);
};

// 额外的“一键复制”功能
window.copyInquiry = () => {
    const id = document.getElementById('rpt-id').innerText;
    const material = document.getElementById('rpt-material').innerText;
    const textToCopy = `NATURAPHYS_INQUIRY: ${id} | ${material}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const btn = document.querySelector('.copy-trigger');
        btn.innerText = "[ DATA_COPIED ]";
        setTimeout(() => { btn.innerText = "[ COPY_SPECIMEN_DATA ]"; }, 2000);
    });
};

elements.reportOverlay.onclick = (e) => {
    if (e.target === elements.reportOverlay) {
        window.closeReport();
    }
};