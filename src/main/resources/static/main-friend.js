// src/main/resources/static/main-friend.js
// 提取渲染好友列表为独立函数
async function renderFriendList() {
    let grouped = {};
    try {
        const res = await fetch('/api/friend/pagelist');
        if (res.ok) {
            grouped = await res.json();
        }
    } catch {}
    const friendListDiv = document.querySelector('.friend-list-content');
    if (!friendListDiv) return;
    if (!grouped || Object.keys(grouped).length === 0) {
        friendListDiv.innerHTML = '<div class="empty-tip">暂无好友</div>';
        return;
    }
    friendListDiv.innerHTML = Object.entries(grouped).map(([group, friends]) => `
        <div class="friend-group-block">
            <div class="friend-group-title">${group}</div>
            <ul class="friend-items">
                ${friends.map(f => `
                    <li class="friend-item" data-id="${f.id}">
                        <img src="${f.avatar || 'avatar.png'}" alt="头像" class="friend-avatar"/>
                        <div class="friend-info">
                            <span class="friend-name">${f.username}</span>
                        </div>
                        <button class="group-friend-btn friend-action-btn" data-id="${f.id}">分组</button>
<button class="delete-friend-btn friend-action-btn" data-id="${f.id}">删除</button>
                    </li>
                `).join('')}
            </ul>
        </div>
    `).join('');
}

async function renderMyGroupList() {
    const groupBox = document.querySelector('.group-list-content');
    groupBox.innerHTML = '加载中...';
    try {
        const res = await fetch('/api/group/list');
        const list = res.ok ? await res.json() : [];
        if (!list.length) {
            groupBox.innerHTML = '<div class="empty-tip">暂无群聊</div>';
            return;
        }
        groupBox.innerHTML = list.map(group => `
            <div class="group-item">
                <img src="${group.avatar || 'default-group.png'}" class="group-avatar"/>
                <div class="group-name">${group.name}</div>
            </div>
        `).join('');
    } catch {
        groupBox.innerHTML = '<div class="empty-tip">加载失败</div>';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    const mainContent = document.querySelector('.main-content');
    const friendBtn = sidebarBtns[1];

    friendBtn.addEventListener('click', async () => {
        sidebarBtns.forEach(btn => btn.classList.remove('active'));
        friendBtn.classList.add('active');

        mainContent.innerHTML = `
            <div class="friend-container">
                <!-- 好友列表部分 -->
                <div class="friend-section">
                    <div class="section-header">
                        <h2 class="section-title">我的好友</h2>
                        <button class="add-friend-btn">
                            <i class="icon-plus"></i> 添加好友
                        </button>
                    </div>
                    <div class="friend-list">
                        <div class="friend-list-content"></div>
                    </div>
                </div>
                
                <!-- 新增：我加入的群 -->
        <div class="friend-section">
            <div class="section-header">
                <h2 class="section-title">我加入的群</h2>
                <button class="create-group-btn">
        <i class="icon-plus"></i> 创建群聊
    </button>
    <button class="join-group-btn"><i class="icon-plus"></i> 加入群聊</button>

            
            </div>
            <div class="group-list-content"></div>
        </div>



                <!-- 查找陌生人部分 -->
<div class="friend-section">
    <div class="section-header">
        <h2 class="section-title">查找用户</h2>
        <div class="search-box-inline">
            <input type="text" class="search-input" placeholder="输入用户名或邮箱"/>
            <button class="search-btn">
                <i class="icon-search"></i> 查找
            </button>
        </div>
    </div>
    <div class="search-result-title">搜索结果</div>
    <div class="stranger-result"></div>
</div>

                <!-- 好友申请部分 -->
                <div class="friend-section">
                    <div class="section-header">
                        <h2 class="section-title">好友及加群申请</h2>
                    </div>
                    <div id="friend-requests" class="requests-list"></div>
                </div>
            </div>

            <style>
                .friend-container {
    display: flex;
    flex-direction: column;
    gap: 28px;
    padding: 32px 24px;
    background: linear-gradient(120deg, #f0f7fa 0%, #f9e7ff 100%);
    min-height: 100vh;
}
.friend-section {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(33,150,243,0.10);
    padding: 28px 24px;
    transition: box-shadow 0.2s;
}
.friend-section:hover {
    box-shadow: 0 8px 32px rgba(33,150,243,0.16);
}
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1.5px solid #f0f0f0;
}
.section-title {
    font-size: 20px;
    font-weight: 700;
    color: #2196F3;
    margin: 0;
    letter-spacing: 1px;
}
.add-friend-btn, .create-group-btn, .join-group-btn, .search-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 20px;
    background: linear-gradient(90deg, #4CAF50 60%, #2196F3 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(33,150,243,0.08);
    transition: background 0.2s, transform 0.2s;
}
.add-friend-btn:hover, .create-group-btn:hover, .join-group-btn:hover, .search-btn:hover {
    background: linear-gradient(90deg, #388E3C 60%, #1976D2 100%);
    transform: translateY(-2px) scale(1.03);
}
.friend-avatar, .group-avatar, .stranger-avatar, .request-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 14px;
    border: 2.5px solid #e3f2fd;
    box-shadow: 0 2px 8px rgba(33,150,243,0.10);
}
.friend-item, .group-item {
    display: flex;
    align-items: center;
    padding: 14px;
    border-radius: 10px;
    transition: background 0.2s, transform 0.2s;
    cursor: pointer;
}
.friend-item:hover, .group-item:hover {
    background: #f0f7ff;
    transform: translateX(3px) scale(1.01);
}
.search-input, .group-search-input {
    flex: 1;
    padding: 12px 16px;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    font-size: 15px;
    box-shadow: 0 1px 4px rgba(33,150,243,0.04) inset;
    transition: border 0.2s, box-shadow 0.2s;
}
.search-input:focus, .group-search-input:focus {
    border-color: #2196F3;
    outline: none;
    box-shadow: 0 0 0 2px rgba(33,150,243,0.10);
}
.empty-tip, .error-tip {
    color: #bdbdbd;
    text-align: center;
    padding: 24px 0;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 1px;
}
.error-tip { color: #f44336; }
.accept-btn, .reject-btn, .apply-join-btn {
    padding: 7px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    margin-left: 10px;
    transition: background 0.2s;
}
.accept-btn, .apply-join-btn { background: #4CAF50; color: #fff; }
.accept-btn:hover, .apply-join-btn:hover { background: #388E3C; }
.reject-btn { background: #f44336; color: #fff; }
.reject-btn:hover { background: #d32f2f; }

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.section-header .search-box-inline {
    margin-left: auto;
    justify-content: flex-end;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 420px; /* 可选，限制输入框宽度 */
}
.friend-group-block { margin-bottom: 18px; }
.friend-group-title {
    font-size: 16px;
    font-weight: bold;
    color: #4CAF50;
    margin-bottom: 8px;
    margin-top: 12px;
}
.friend-action-btn {
    margin-left: 10px;
    padding: 7px 16px;
    border: none;
    border-radius: 6px;
    background: linear-gradient(90deg, #2196F3 60%, #4CAF50 100%);
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(33,150,243,0.08);
    transition: background 0.2s, transform 0.2s;
}
.friend-action-btn:hover {
    background: linear-gradient(90deg, #1976D2 60%, #388E3C 100%);
    transform: translateY(-2px) scale(1.04);
}
.delete-friend-btn {
    background: linear-gradient(90deg, #f44336 60%, #ff9800 100%);
}
.delete-friend-btn:hover {
    background: linear-gradient(90deg, #d32f2f 60%, #ff5722 100%);
}
            </style>
        `;

        // 渲染好友列表
        renderFriendList();
        // 渲染我加入的群
        renderMyGroupList();
        // 加载好友申请
        loadFriendRequests();
    });
});

// 事件委托：添加好友按钮和查找按钮
document.querySelector('.main-content').addEventListener('click', async (e) => {
    if (e.target.classList.contains('add-friend-btn') ||
        (e.target.closest('.add-friend-btn') && !e.target.classList.contains('search-btn'))) {
        const name = prompt('请输入对方用户名或邮箱:');
        if (!name) return;
        fetch('/api/friend/add', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'target=' + encodeURIComponent(name)
        }).then(res => res.text()).then(msg => {
            alert(msg);
            renderFriendList(); // 刷新好友列表
        });
    }

    if (e.target.classList.contains('search-btn') ||
        (e.target.closest('.search-btn') && !e.target.classList.contains('add-friend-btn'))) {
        const input = document.querySelector('.search-input').value.trim();
        const resultBox = document.querySelector('.stranger-result');
        if (!input) {
            resultBox.innerHTML = '<div class="empty-tip">请输入用户名或邮箱</div>';
            return;
        }
        fetch('/api/user/search?keyword=' + encodeURIComponent(input))
            .then(async r => {
                if (!r.ok) {
                    let msg = '查找失败';
                    if (r.status === 401) msg = '请先登录';
                    else if (r.status === 404) msg = '用户不存在';
                    resultBox.innerHTML = `<div class="error-tip">${msg}</div>`;
                    return null;
                }
                return r.json();
            })
            .then(user => {
                if (!user) return;
                resultBox.innerHTML = `
                    <div class="stranger-item">
                        <img src="${user.avatar || 'avatar.png'}" class="stranger-avatar"/>
                        <div class="stranger-info">
                            <div class="stranger-name">${user.username}</div>
                            <div class="stranger-email">${user.email}</div>
                        </div>
                        <button class="add-friend-btn" data-name="${user.username}">
                            <i class="icon-plus"></i> 添加
                        </button>
                    </div>
                `;
            });
    }

    // 处理同意/拒绝
    if (e.target.classList.contains('accept-btn') || e.target.classList.contains('reject-btn')) {
        const id = e.target.getAttribute('data-id');
        const action = e.target.classList.contains('accept-btn') ? 'accepted' : 'rejected';
        fetch('/api/friend/handle', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `requesterId=${id}&action=${action}`
        }).then(r => r.text()).then(msg => {
            alert(msg);
            loadFriendRequests();
            renderFriendList(); // 刷新好友列表
        });
    }
    if (e.target.classList.contains('create-group-btn') ||
        (e.target.closest('.create-group-btn') && !e.target.classList.contains('add-friend-btn'))) {
        const name = prompt('请输入群聊名称:');
        if (!name) return;
        fetch('/api/group/create', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'name=' + encodeURIComponent(name)
        }).then(res => res.json()).then(result => {
            if (result.groupId) {
                alert('创建成功');
                renderMyGroupList(); // 刷新群列表
            } else {
                alert(result.error || '创建失败');
            }
        });
    }
    if (e.target.classList.contains('join-group-btn') ||
        (e.target.closest('.join-group-btn') && !e.target.classList.contains('create-group-btn'))) {
        const modal = document.createElement('div');
        modal.className = 'join-group-modal';
        modal.innerHTML = `
        <div class="join-group-dialog">
            <div class="join-group-header">加入群聊</div>
            <div class="join-group-body">
                <input type="text" class="group-search-input" placeholder="输入群聊名称"/>
                <button class="group-search-btn">搜索</button>
                <div class="group-search-result"></div>
            </div>
            <button class="close-modal-btn">×</button>
        </div>
        <style>
            .join-group-modal {
                position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
                background: rgba(0,0,0,0.18); z-index: 9999; display: flex; align-items: center; justify-content: center;
            }
            .join-group-dialog {
                background: #fff; border-radius: 8px; padding: 24px 28px 18px 28px; min-width: 340px; position: relative;
                box-shadow: 0 4px 24px rgba(0,0,0,0.12);
            }
            .join-group-header { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
            .group-search-input { width: 70%; margin-right: 8px; }
            .group-search-btn { padding: 6px 16px; }
            .group-search-result { margin-top: 16px; }
            .close-modal-btn {
                position: absolute; right: 10px; top: 10px; border: none; background: none; font-size: 22px; color: #888; cursor: pointer;
            }
            .search-group-item {
                display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #f3f3f3;
            }
            .search-group-avatar { width: 36px; height: 36px; border-radius: 50%; margin-right: 12px; }
            .search-group-name { font-size: 15px; color: #333; flex: 1; }
            .apply-join-btn { padding: 4px 12px; background: #2196F3; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
            .apply-join-btn[disabled] { background: #aaa; cursor: not-allowed; }
            
            .search-box-inline {
    display: flex;
    align-items: center;
    gap: 8px;
}
.section-header .search-box-inline {
    margin-left: auto;
}
        </style>
    `;
        document.body.appendChild(modal);

        modal.querySelector('.close-modal-btn').onclick = () => modal.remove();

        modal.querySelector('.group-search-btn').onclick = async function() {
            const keyword = modal.querySelector('.group-search-input').value.trim();
            const resultBox = modal.querySelector('.group-search-result');
            if (!keyword) {
                resultBox.innerHTML = '<div class="empty-tip">请输入群聊名称</div>';
                return;
            }
            resultBox.innerHTML = '搜索中...';
            try {
                const res = await fetch('/api/group/search?keyword=' + encodeURIComponent(keyword));
                const list = res.ok ? await res.json() : [];
                if (!list.length) {
                    resultBox.innerHTML = '<div class="empty-tip">未找到相关群聊</div>';
                    return;
                }
                resultBox.innerHTML = list.map(g => `
                <div class="search-group-item" data-group-id="${g.id}">
                    <img src="${g.avatar || 'default-group.png'}" class="search-group-avatar"/>
                    <div class="search-group-name">${g.name}</div>
                    <button class="apply-join-btn" data-group-id="${g.id}">申请加入群聊</button>
                </div>
            `).join('');
            } catch {
                resultBox.innerHTML = '<div class="empty-tip">搜索失败</div>';
            }
        };

        // 事件委托：申请加入群聊
        modal.querySelector('.group-search-result').onclick = function(ev) {
            const btn = ev.target.closest('.apply-join-btn');
            if (!btn) return;
            const groupId = btn.getAttribute('data-group-id');
            btn.disabled = true;
            btn.textContent = '申请中...';
            fetch('/api/friend/add', { // 这里假设你用好友申请接口，需后端区分类型
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `groupId=${encodeURIComponent(groupId)}&type=group`
            }).then(r => r.text()).then(msg => {
                btn.textContent = '已申请';
                btn.disabled = true;
                alert(msg);
            }).catch(() => {
                btn.textContent = '申请加入群聊';
                btn.disabled = false;
                alert('申请失败');
            });
        };
    }

    // 删除好友
    if (e.target.classList.contains('delete-friend-btn')) {
        const friendId = e.target.getAttribute('data-id');
        if (!confirm('确定要删除该好友吗？')) return;
        const res = await fetch('/api/friend/delete', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `friendId=${encodeURIComponent(friendId)}`
        });
        const msg = await res.text();
        alert(msg);
        renderFriendList();
    }
    // 好友分组
    if (e.target.classList.contains('group-friend-btn')) {
        const friendId = e.target.getAttribute('data-id');
        // 获取分组列表
        const res = await fetch('/api/friend/group/list');
        const groups = res.ok ? await res.json() : [];
        let groupName = prompt('请输入分组名（已有分组：' + groups.map(g => g.name).join('，') + '）：');
        if (!groupName) return;
        // 可选：如果分组不存在，先创建
        await fetch('/api/friend/group/add', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `name=${encodeURIComponent(groupName)}`
        });
        // 设置好友分组
        await fetch('/api/friend/group/set', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `friendId=${encodeURIComponent(friendId)}&groupName=${encodeURIComponent(groupName)}`
        });
        alert('分组设置成功');
        renderFriendList();
    }
});

// 加载好友申请
function loadFriendRequests() {
    const box = document.getElementById('friend-requests');
    if (!box) return;
    fetch('/api/friend/requests').then(r => r.json()).then(list => {
        box.innerHTML = '';
        if (list.length === 0) {
            box.innerHTML = '<div class="empty-tip">暂无好友/群聊申请</div>';
            return;
        }
        list.forEach(u => {
            const div = document.createElement('div');
            div.className = 'friend-request-item';
            if (u.type === 'group') {
                // 群聊申请
                div.innerHTML = `
                    <img src="${u.avatar || 'avatar.png'}" alt="头像" class="request-avatar"/>
                    <div class="request-info">
                        <div class="request-name">${u.username} 申请加入群聊 (ID:${u.groupId})</div>
                        <div class="request-email">${u.email}</div>
                    </div>
                    <button class="accept-btn" data-id="${u.id}" data-type="group" data-group-id="${u.groupId}">同意</button>
                    <button class="reject-btn" data-id="${u.id}" data-type="group" data-group-id="${u.groupId}">拒绝</button>
                `;
            } else {
                // 好友申请
                div.innerHTML = `
                    <img src="${u.avatar || 'avatar.png'}" alt="头像" class="request-avatar"/>
                    <div class="request-info">
                        <div class="request-name">${u.username}</div>
                        <div class="request-email">${u.email}</div>
                    </div>
                    <button class="accept-btn" data-id="${u.id}">同意</button>
                    <button class="reject-btn" data-id="${u.id}">拒绝</button>
                `;
            }
            box.appendChild(div);
        });
    });
}

// 处理同意/拒绝时，需带上 type 和 groupId
document.querySelector('.main-content').addEventListener('click', (e) => {
    if (e.target.classList.contains('accept-btn') || e.target.classList.contains('reject-btn')) {
        const id = e.target.getAttribute('data-id');
        const type = e.target.getAttribute('data-type');
        const groupId = e.target.getAttribute('data-group-id');
        const action = e.target.classList.contains('accept-btn') ? 'accepted' : 'rejected';
        let body = `requesterId=${id}&action=${action}`;
        if (type === 'group') {
            body += `&type=group&groupId=${groupId}`;
        }
        fetch('/api/friend/handle', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body
        }).then(r => r.text()).then(msg => {
            alert(msg);
            loadFriendRequests();
            renderFriendList();
            renderMyGroupList && renderMyGroupList();
        });
    }
});
