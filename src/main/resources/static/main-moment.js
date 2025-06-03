// 朋友圈功能：发布朋友圈、展示自己和好友的朋友圈

async function fetchCurrentUser() {
    // 获取当前用户信息
    const res = await fetch('/api/user/current');
    if (!res.ok) return null;
    return await res.json();
}

async function fetchFriendMoments() {
    // 获取自己和好友的朋友圈
    const res = await fetch('/api/moment/list');
    if (!res.ok) return [];
    return await res.json();
}

async function postMoment(content) {
    // 发布朋友圈
    const res = await fetch('/api/moment/post', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `content=${encodeURIComponent(content)}`
    });
    return res.ok;
}

async function fetchUserInfo(userId) {
    // 获取用户信息（昵称、头像等）
    const res = await fetch(`/api/user/info?userId=${userId}`);
    if (!res.ok) return {};
    return await res.json();
}

async function renderMomentPage() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="moment-page">
            <h1>朋友圈</h1>
            <div class="moment-actions">
                <textarea class="moment-input" placeholder="分享新鲜事..." maxlength="500"></textarea>
                <button class="new-moment-btn">发布</button>
            </div>
            <div class="moment-list">
                <div class="moment-loading">正在加载朋友圈...</div>
            </div>
        </div>
        <style>
            .moment-page { padding: 40px 20px; }
            .moment-page h1 { font-size: 24px; color: #4CAF50; margin-bottom: 18px; }
            .moment-actions {
                display: flex;
                gap: 12px;
                margin-bottom: 24px;
                align-items: flex-start;
            }
            .moment-input {
                flex: 1;
                min-height: 48px;
                max-height: 120px;
                resize: vertical;
                border: 1.5px solid #c8e6c9;
                border-radius: 8px;
                padding: 10px 12px;
                font-size: 15px;
                outline: none;
                transition: border 0.2s;
            }
            .moment-input:focus { border-color: #4CAF50; }
            .new-moment-btn {
                padding: 10px 22px;
                border-radius: 8px;
                border: none;
                background: linear-gradient(90deg,#4CAF50 60%,#2196F3 100%);
                color: #fff;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(76,175,80,0.08);
                transition: background 0.2s;
            }
            .new-moment-btn:hover { background: #388E3C; }
            .moment-list { display: flex; flex-direction: column; gap: 22px; }
            .moment-item {
                display: flex;
                align-items: flex-start;
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 2px 12px rgba(76,175,80,0.08);
                padding: 18px 22px;
                gap: 18px;
                position: relative;
                transition: box-shadow 0.2s;
            }
            .moment-item:hover { box-shadow: 0 4px 18px rgba(76,175,80,0.16); }
            .moment-avatar {
                width: 54px;
                height: 54px;
                border-radius: 50%;
                border: 2px solid #eee;
                object-fit: cover;
                background: #f0f0f0;
            }
            .moment-content { flex: 1; }
            .moment-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 6px;
            }
            .moment-username { font-weight: bold; color: #2196F3; }
            .moment-time { color: #888; font-size: 13px; }
            .moment-text { font-size: 16px; color: #333; word-break: break-all; }
            .moment-loading {
                color: #aaa;
                text-align: center;
                padding: 30px 0;
                font-size: 16px;
            }
        </style>
    `;

    // 发布朋友圈
    mainContent.querySelector('.new-moment-btn').onclick = async () => {
        const input = mainContent.querySelector('.moment-input');
        const content = input.value.trim();
        if (!content) {
            alert('内容不能为空');
            return;
        }
        const ok = await postMoment(content);
        if (ok) {
            input.value = '';
            await renderMomentList(); // 刷新朋友圈
        } else {
            alert('发布失败，请重试');
        }
    };

    // 渲染朋友圈列表
    async function renderMomentList() {
        const list = mainContent.querySelector('.moment-list');
        list.innerHTML = `<div class="moment-loading">正在加载朋友圈...</div>`;
        const moments = await fetchFriendMoments();
        if (!moments || moments.length === 0) {
            list.innerHTML = `<div class="moment-loading">暂无朋友圈内容</div>`;
            return;
        }
        // 批量获取用户信息，减少请求
        const userIds = [...new Set(moments.map(m => m.userId))];
        const userInfoMap = {};
        // 批量请求用户信息（如有接口可优化，否则单独请求）
        for (const uid of userIds) {
            userInfoMap[uid] = await fetchUserInfo(uid);
        }
        list.innerHTML = moments.map(m => {
            const user = userInfoMap[m.userId] || {};
            const avatar = user.avatar ? user.avatar : 'logo.png';
            const username = user.username || '用户' + m.userId;
            const time = formatTime(m.createdAt);
            return `
                <div class="moment-item">
                    <img src="${avatar}" class="moment-avatar" alt="头像"/>
                    <div class="moment-content">
                        <div class="moment-header">
                            <span class="moment-username">${username}</span>
                            <span class="moment-time">${time}</span>
                        </div>
                        <div class="moment-text">${escapeHTML(m.content)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 时间格式化
    function formatTime(str) {
        const d = new Date(str);
        const now = new Date();
        const diff = (now - d) / 1000;
        if (diff < 60) return '刚刚';
        if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
        if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
        return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0') +
            ' ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    }

    // 防止XSS
    function escapeHTML(str) {
        return str.replace(/[<>&"]/g, c => ({
            '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'
        }[c]));
    }

    await renderMomentList();
}

// 监听侧边栏朋友圈按钮
document.addEventListener('DOMContentLoaded', () => {
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    const momentBtn = sidebarBtns[4]; // 假设朋友圈按钮是第4个

    momentBtn.addEventListener('click', () => {
        sidebarBtns.forEach(btn => btn.classList.remove('active'));
        momentBtn.classList.add('active');
        renderMomentPage();
    });
});
