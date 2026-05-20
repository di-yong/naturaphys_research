let currentActiveId = null;
const elements = {
    brand: document.getElementById('brand-name'),
    archive: document.getElementById('archive-layer'),
    cursor: document.getElementById('custom-cursor'),
    clock: document.getElementById('live-clock'),
    list: document.querySelector('.specimen-list'),
    get clickSound() { return document.getElementById('click-sound'); }
};

const playClick = () => {
    if (!elements.clickSound) return;
    elements.clickSound.currentTime = 0;
    elements.clickSound.volume = 0.5;
    elements.clickSound.playbackRate = 0.85;
    elements.clickSound.play().catch(() => {});
};

// 1. 自动生成列表
function renderArchive() {
    if (!elements.list) return;
    elements.list.innerHTML = ARCHIVE_DATA.map(item => `

       <div class="specimen-folder" onclick="openReport('${item.id}')">
               <div class="folder-texture"></div>

               <div class="folder-header">
                   <div class="header-left">
                       <div class="status-indicator"></div>
                       <span class="folder-id">${item.id}</span>
                   </div>
                   <div class="header-right">
                       <span class="folder-tag">${item.category || 'DATA'}</span>
                       <span class="folder-index">// 0${ARCHIVE_DATA.indexOf(item) + 1}</span>
                   </div>
               </div>

               <div class="folder-body">
                   <div class="body-content">
                       <div class="preview-container">
                           <div class="mini-preview" data-src="${item.preview_img}"></div>
                           <div class="scan-overlay"></div>
                       </div>

                       <div class="mini-metadata">
                           <div class="meta-header">PROPERTY_DECRYPTION</div>
                           <div class="meta-row"><label>MATERIAL</label> <span>${item.report.material}</span></div>
                           <div class="meta-row"><label>STRESS_LVL</label> <span>${(80 + (parseInt(item.id.replace('SP_','')) * 7) % 20).toFixed(1)}%</span></div>
                           <div class="meta-row"><label>LATITUDE</label> <span>31.233°N</span></div>
                           <div class="meta-footer">CRC_CHECKSUM: OK // AUTH_LEVEL_4</div>
                       </div>
                   </div>
               </div>
           </div>       `).join('');
}



// 3. 初始加载逻辑
window.onload = () => {
    renderArchive();
    if (elements.brand) setTimeout(() => elements.brand.style.opacity = "1", 500);
    if (!window.clockTimer && elements.clock) {
        window.clockTimer = setInterval(() => {
            elements.clock.innerText = new Date().toLocaleTimeString();
        }, 1000);
    }
};

// 4. 鼠标与光标逻辑
document.addEventListener('mousemove', e => {
    if (elements.cursor) {
        elements.cursor.style.left = e.clientX + 'px';
        elements.cursor.style.top = e.clientY + 'px';
    }
});

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
		const wrapper = document.querySelector('.specimen-list-wrapper');
        // 如果点击的是已经打开的那个，就关闭它
        if (!container.classList.contains('active')) {
                if (currentActiveId === id) {
                    // 这里可以处理文件夹的收起动画逻辑，如果不写，点击就只是保持展开
                    return;
                }
            }

        const item = ARCHIVE_DATA.find(d => d.id === id);
        if (!item) return;

        // 记录状态
        currentActiveId = id;

        // 1. 填充数据（确保这部分没报错）
        //document.getElementById('rpt-id').innerText = item.id;
        document.getElementById('rpt-material').innerText = item.report.material;
        document.getElementById('rpt-process').innerText = item.report.process;
        document.getElementById('rpt-notes').innerText = item.report.notes;

        const imgContainer = document.getElementById('rpt-img');
        if (imgContainer) imgContainer.style.backgroundImage = `url('${item.preview_img}')`;
				if (wrapper) {
		        wrapper.style.transform = "";
		        wrapper.style.opacity = "";
		    }
        // 2. 视觉激活
        // 核心：无论当前是否 active，都重新强制加一次，并触发高亮
        container.classList.add('active');
        // 建议同时给 container 加上你的 15% 坍缩类名
        container.classList.add('is-collapsed-mode');

        updateListHighlight(id);
        playClick();

        console.log(`[SYSTEM]: Switch to Specimen ${id}`);
};

// 7. 终极关闭逻辑：唯一且强制挂载全局
window.closeInspection = function() {
    console.log("System: Executing Collapse and Resetting List...");
    const container = document.querySelector('.split-container');
		const wrapper = document.querySelector('.specimen-list-wrapper');    if (container && container.classList.contains('active')) {
        // 1. 核心修复：移除所有干扰样式的类名
        container.classList.remove('active');
        container.classList.remove('is-collapsed-mode');

        if (wrapper) {
	          wrapper.style.transform = "";
	          wrapper.style.opacity = "";
	          wrapper.style.filter = "";
	      }

        currentActiveId = null;
        updateListHighlight(null);
        playClick();
        console.log("[SYSTEM]: Archive view restored to default.");
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
    const items = document.querySelectorAll('.specimen-folder');
    items.forEach(item => {
        const idSpan = item.querySelector('.folder-id');
        if (idSpan && idSpan.innerText === activeId) {
            item.classList.add('is-active');
        } else {
            item.classList.remove('is-active');
        }
    });
}

// 9. 全局键盘逃生
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeInspection();
});

const collectionsBtn = document.getElementById('btn-collections');

// 点击 Collection 后的联动 → 平滑滚动到产品档案
collectionsBtn.onclick = () => {
    playClick();
    const archive = document.getElementById('archive-layer');
    if (archive) archive.scrollIntoView({ behavior: 'smooth' });
};


const returnToVoid = () => {
    playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 显微镜追踪引擎 (Microscopic Tracking Engine)
const mainImg = document.querySelector('.report-main-img');

if (mainImg) {
    mainImg.addEventListener('mousemove', function(e) {
        if (!this.classList.contains('zoom-active')) return;
        const rect = this.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        this.style.backgroundPosition = `${x}% ${y}%`;
    });

    mainImg.addEventListener('mouseenter', function() {
        this.classList.add('zoom-active');
    });

    mainImg.addEventListener('mouseleave', function() {
        this.classList.remove('zoom-active');
        setTimeout(() => {
            if (!this.classList.contains('zoom-active')) {
                this.style.backgroundPosition = 'center';
            }
        }, 500);
    });
}

// 统一的文件夹点击代理（分屏激活状态下切换 specimen）
document.addEventListener('click', (e) => {
    const folder = e.target.closest('.specimen-folder');
    if (!folder) return;
    const container = document.querySelector('.split-container');
    if (container && container.classList.contains('active')) {
        const id = folder.querySelector('.folder-id').innerText;
        if (currentActiveId !== id) {
            window.openReport(id);
        }
        e.preventDefault();
        e.stopPropagation();
    }
});

// 统一的 mouseover 事件委托：懒加载图片 + 展开文件夹 + 滚动对焦（三合一，不再重复绑定）
let hoverTimer;

document.body.addEventListener('mouseover', (e) => {
    const folder = e.target.closest('.specimen-folder');
    if (!folder) return;

    // 懒加载图片
    const img = folder.querySelector('.mini-preview');
    if (img && img.dataset.src) {
        img.style.backgroundImage = `url('${img.dataset.src}')`;
        delete img.dataset.src;
    }

    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
        // 关闭其他已展开的文件夹
        document.querySelectorAll('.specimen-folder.is-open').forEach(f => {
            if (f !== folder) f.classList.remove('is-open');
        });

        // 展开当前文件夹
        folder.classList.add('is-open');

        // 滚动对焦：超出视口则自动滚动
        const wrapper = document.querySelector('.specimen-list-wrapper');
        if (wrapper) {
            const rect = folder.getBoundingClientRect();
            const threshold = window.innerHeight - 150;
            if (rect.bottom > threshold) {
                wrapper.scrollBy({ top: rect.bottom - threshold + 100, behavior: 'smooth' });
            }
        }
    }, 150);
});

document.body.addEventListener('mouseout', (e) => {
    const folder = e.target.closest('.specimen-folder');
    if (!folder) return;
    if (folder.contains(e.relatedTarget)) return;
    clearTimeout(hoverTimer);
});

// 鼠标离开整个列表区域时，重置滚动位置
document.querySelector('.specimen-list').addEventListener('mouseleave', () => {
    document.querySelector('.specimen-list-wrapper').scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});