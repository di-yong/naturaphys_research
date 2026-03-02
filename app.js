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

        // 隐藏触发器
        elements.trigger.style.opacity = "0";
        elements.trigger.style.pointerEvents = "none";

        const terminal = document.getElementById('sync-terminal');
        if (terminal) {
            terminal.style.display = 'flex'; // 开启 Flex 力场

            setTimeout(() => {
                // 唯一的动画就是淡入。不准有 transform！
                terminal.style.transition = "opacity 1.5s ease";
                terminal.style.opacity = "1";

                if (elements.keyInput) elements.keyInput.focus();
            }, 50);
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

				const navSystem = document.getElementById('nav-system');
				const collectionBtn = document.getElementById('btn-collections');

        if (navSystem) {
            navSystem.classList.add('in-archive');
            navSystem.classList.remove('active'); // 强制收起展开的菜单
        }

        if (collectionBtn) {
            collectionBtn.innerText = "00_RETURN"; // 修改文字
            collectionBtn.onclick = (e) => {
                e.stopPropagation(); // 防止触发父级点击
                returnToVoid();    // 执行返回主页的逻辑
            };
        }

        // 2. 隐藏主页内容
        if (elements.void) {
            elements.void.style.opacity = "0";
            elements.void.style.pointerEvents = "none";
        }
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

const navSystem = document.getElementById('nav-system');
const menuTrigger = document.getElementById('menu-trigger');
const collectionsBtn = document.getElementById('btn-collections');

// 切换菜单
menuTrigger.onclick = () => {
    playClick();
    navSystem.classList.toggle('active');
};

// 点击 Collection 后的联动
collectionsBtn.onclick = () => {
    playClick();

    // 1. 关闭菜单
    navSystem.classList.remove('active');

    // 2. 唤醒密码输入框 (sync-terminal)
    const terminal = document.getElementById('sync-terminal');
    if (terminal) {
        terminal.style.display = 'flex';
        // 稍微延迟淡入，给菜单收起留出视觉空间
        setTimeout(() => {
            terminal.style.transition = "opacity 1.5s ease";
            terminal.style.opacity = "1";
            document.getElementById('key-input').focus();
        }, 400);
    }
};

// 点击页面其他地方自动收起菜单
document.addEventListener('click', (e) => {
    if (!navSystem.contains(e.target) && navSystem.classList.contains('active')) {
        navSystem.classList.remove('active');
    }
});

const returnToVoid = () => {
    playClick();

		const terminal = document.getElementById('sync-terminal');
    const navSystem = document.getElementById('nav-system');
    const collectionBtn = document.getElementById('btn-collections');
    if (terminal) {
        terminal.style.opacity = "0"; // 先淡出
        setTimeout(() => {
            terminal.style.display = 'none'; // 彻底从物理层面移除
            if (elements.keyInput) elements.keyInput.value = ""; // 清空已输入的密码
        }, 500);
    }

    if (navSystem) {
        // 强制收起，并暂时取消过渡动画，直接“关灯”
        navSystem.style.transform = "translate(20px, 20px) scale(0.8)";
                 navSystem.style.opacity = "0";
                 navSystem.classList.remove('active');
    }

    if (collectionBtn) {
        //collectionBtn.innerText = "01_COLLECTION";
        // 恢复原本的点击逻辑：再次点击又会弹出密码框
        collectionBtn.onclick = originalCollectionLogic;
    }

		setTimeout(() => {
        // 恢复文字和逻辑
        if (collectionBtn) {
            collectionBtn.innerText = "01_COLLECTION";
            collectionBtn.onclick = originalCollectionLogic;
        }

        // 恢复导航的基础状态类（移除档案层皮肤）
        if (navSystem) {
            navSystem.classList.remove('in-archive');
            // 稍后再恢复不透明度，确保用户回主页后能看到它
            //navSystem.style.transition = "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)";
            navSystem.style.transform = "translate(0, 0) scale(1)";
        }
				const terminal = document.getElementById('sync-terminal');
        if (terminal) {
            terminal.style.display = 'none';

            if (elements.keyInput) elements.keyInput.value = "";
        }
    }, 600);
    // 2. 视觉反转
    if (elements.archive) {
        elements.archive.style.opacity = "0";
        setTimeout(() => elements.archive.style.display = 'none', 800);
    }

    if (elements.void) {
        elements.void.style.display = 'block';
        // 关键：在显示之前，先把 void 放在它飞走的那个位置 (-150%)
        // 这样它才能有一个从上方降落回来的动画
        elements.void.style.transform = "translate(-50%, -150%) blur(20px)";

        void elements.void.offsetWidth; // 触发重绘

        setTimeout(() => {
            // 优雅降落并对焦
            elements.void.style.transform = "translate(-50%, -50%) blur(0px)";
            elements.void.style.opacity = "1";
            elements.void.style.pointerEvents = "auto";

            // 主页完全就位后，导航栏才亮起
            if (navSystem) navSystem.style.opacity = "1";
        }, 500);
    }

    // 3. 重新显示 Request Access 触发器（如果需要）
    if (elements.trigger) {
        elements.trigger.style.opacity = "1";
        elements.trigger.style.pointerEvents = "auto";
    }


};

// 提取原本的 Collection 点击逻辑，方便重复调用
const originalCollectionLogic = () => {
    playClick();
    document.getElementById('nav-system').classList.remove('active');
    const terminal = document.getElementById('sync-terminal');
    if (terminal) {
        terminal.style.display = 'flex';
        setTimeout(() => {
            terminal.style.opacity = "1";
            document.getElementById('key-input').focus();
        }, 50);
    }
};