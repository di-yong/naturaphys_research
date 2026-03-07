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

//const text = "WE DO NOT PRODUCE FASHION; WE DOCUMENT MATERIAL EVOLUTION.\nTHE FIBER IS THE WITNESS. THE SOIL IS THE ARCHIVE.";
let index = 0;

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
                           <div class="meta-row"><label>STRESS_LVL</label> <span>${(Math.random()*20 + 80).toFixed(1)}%</span></div>
                           <div class="meta-row"><label>LATITUDE</label> <span>31.233°N</span></div>
                           <div class="meta-footer">CRC_CHECKSUM: OK // AUTH_LEVEL_4</div>
                       </div>
                   </div>
               </div>
           </div>
       `).join('');

       const folders = elements.list.querySelectorAll('.specimen-folder');
           folders.forEach(folder => {
               folder.addEventListener('mouseenter', () => {
                   const img = folder.querySelector('.mini-preview');
                   if (img && img.dataset.src) {
                       img.style.backgroundImage = `url('${img.dataset.src}')`;
                       img.style.opacity = "1"; // 确保可见
                       delete img.dataset.src;
                   }
               });
           });
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

                if (elements.keyInput) elements.keyInput;
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
		const wrapper = document.querySelector('.specimen-list-wrapper');

    if (container && container.classList.contains('active')) {
        // 1. 核心修复：移除所有干扰样式的类名
        container.classList.remove('active');
        container.classList.remove('is-collapsed-mode');
				const wrapper = document.querySelector('.specimen-list-wrapper');

        const listWrapper = document.querySelector('.specimen-list-wrapper');
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
            //document.getElementById('key-input').focus();
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
           // document.getElementById('key-input').focus();
        }, 50);
    }
};

// 显微镜追踪引擎 (Microscopic Tracking Engine)
const mainImg = document.querySelector('.report-main-img');

if (mainImg) {
    // 鼠标移动时：计算相对坐标，移动背景
    mainImg.addEventListener('mousemove', function(e) {
        // 如果没有放大，不执行
        if (!this.classList.contains('zoom-active')) return;

        const rect = this.getBoundingClientRect();
        // 计算鼠标在图片内的百分比位置
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // 实时改变背景的聚焦点
        this.style.backgroundPosition = `${x}% ${y}%`;
    });

    // 鼠标进入时：激活放大模式
    mainImg.addEventListener('mouseenter', function() {
        this.classList.add('zoom-active');
        // 可选：如果你之前屏蔽了自定义光标，可以在这里让十字准星更明显
    });

    // 鼠标离开时：恢复原状和居中
    mainImg.addEventListener('mouseleave', function() {
        this.classList.remove('zoom-active');
        // 延迟恢复居中，配合 CSS 的 transition 会有极强的镜头回缩感
        setTimeout(() => {
            if (!this.classList.contains('zoom-active')) {
                this.style.backgroundPosition = 'center';
            }
        }, 500);
    });
}

document.addEventListener('click', (e) => {
    const folder = e.target.closest('.specimen-folder');
    if (!folder) return;

    const container = document.querySelector('.split-container');

    // 只有当分屏已经打开（15%模式）时，我们才接管点击逻辑
    if (container.classList.contains('active')) {
        const id = folder.querySelector('.folder-id').innerText;

        // 如果点的是新 ID，才切换；点的是当前 ID，不做任何事（防止闪烁关闭）
        if (currentActiveId !== id) {
            window.openReport(id);
        }

        e.preventDefault();
        e.stopPropagation(); // 阻止触发 HTML 原生的 onclick，防止二次执行
    }
});
// 在 specimen-folder 的事件监听中
const folders = document.querySelectorAll('.specimen-folder');

folders.forEach(folder => {
    folder.addEventListener('mouseenter', () => {
        const img = folder.querySelector('.mini-preview.lazy-load');
        if (img && img.dataset.src) {
            // 执行加载
            img.style.backgroundImage = `url('${img.dataset.src}')`;
            img.classList.remove('lazy-load');
            delete img.dataset.src;

            // 顾问建议：加一个淡入动画
            img.style.animation = "dataReveal 0.8s ease forwards";
        }
    });
});
document.querySelectorAll('.specimen-folder').forEach(folder => {
    folder.addEventListener('mouseenter', (e) => {
        const folderElement = e.currentTarget;
        const wrapper = document.querySelector('.specimen-list-wrapper');

        // 给 CSS 展开预留一点点解析时间
        setTimeout(() => {
            const rect = folderElement.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            const expandHeight = 520;

            // 判断底部是否溢出
            if (rect.top + expandHeight > viewHeight) {
                // 计算需要滚动的增量：让文件夹的顶部滚动到屏幕上方 10% 的位置，确保全显
                const scrollAmount = wrapper.scrollTop + (rect.top - 100);

                wrapper.scrollTo({
                    top: scrollAmount,
                    behavior: 'smooth'
                });
            }
        }, 100); // 100ms 延迟，等 CSS 高度展开动画开始
    });
});

// 当鼠标离开整个列表区域时，重置滚动位置（可选，看你审美）
document.querySelector('.specimen-list').addEventListener('mouseleave', () => {
    document.querySelector('.specimen-list-wrapper').scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

document.querySelectorAll('.specimen-folder').forEach(folder => {
    folder.addEventListener('mouseenter', (e) => {
        const folderEl = e.currentTarget;
        const wrapper = document.querySelector('.specimen-list-wrapper');

        // 稍微延迟，等待 CSS 的 520px 展开动画开始
        setTimeout(() => {
            const rect = folderEl.getBoundingClientRect();
            const threshold = window.innerHeight - 150; // 设置一个触发滚动的阈值线

            // 如果展开后的底部（或中心）超过了阈值
            if (rect.bottom > threshold) {
                // 计算差值，平滑滚动
                const offset = rect.bottom - threshold + 100; // 多滚 100px 留出呼吸感
                wrapper.scrollBy({
                    top: offset,
                    behavior: 'smooth'
                });
            }
        }, 300); // 300ms 配合你的 CSS transition 时间
    });
});

let hoverTimer;

// 使用事件委托：将监听器挂在 body 上，监听所有鼠标滑动
document.body.addEventListener('mouseover', (e) => {
    // 寻找鼠标当前所处位置最近的 .specimen-folder
    const folder = e.target.closest('.specimen-folder');
    if (!folder) return; // 如果没碰到文件夹，直接退出

    clearTimeout(hoverTimer);

    hoverTimer = setTimeout(() => {
        // 1. 关掉其他所有已展开的文件夹
        document.querySelectorAll('.specimen-folder.is-open').forEach(f => {
            if (f !== folder) f.classList.remove('is-open');
        });

        // 2. 展开当前文件夹
        folder.classList.add('is-open');

        // 3. 对焦滚动
        const wrapper = document.querySelector('.specimen-list-wrapper');
        if (wrapper) {
            const rect = folder.getBoundingClientRect();
            if (rect.bottom > window.innerHeight - 100) {
                wrapper.scrollBy({ top: rect.height / 2, behavior: 'smooth' });
            }
        }
    }, 150);
});

// 处理鼠标离开防抖
document.body.addEventListener('mouseout', (e) => {
    const folder = e.target.closest('.specimen-folder');
    if (!folder) return;

    // 核心逻辑：防止鼠标在文件夹内部移动时误触发离开事件
    if (folder.contains(e.relatedTarget)) return;

    clearTimeout(hoverTimer);
});