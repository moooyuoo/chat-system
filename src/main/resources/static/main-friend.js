// src/main/resources/static/main-friend.js
// 提取渲染好友列表为独立函数
async function renderFriendList() {
    let friends = [];
    try {
        const res = await fetch('/api/friend/list');
        if (res.ok) {
            friends = await res.json();
        }
    } catch {}
    const friendListDiv = document.querySelector('.friend-list-content');
    if (!friendListDiv) return;
    friendListDiv.innerHTML = friends.length === 0
        ? '<div class="empty-tip">暂无好友</div>'
        : `<ul class="friend-items">
            ${friends.map(f => `
                <li class="friend-item">
                    <img src="${f.avatar || 'avatar.png'}" alt="头像" class="friend-avatar"/>
                    <div class="friend-info">
                        <span class="friend-name">${f.username}</span>
                        <span class="friend-status ${f.online ? 'online' : 'offline'}">
                            ${f.online ? '在线' : '离线'}
                        </span>
                    </div>
                </li>
            `).join('')}
        </ul>`;

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
                    </div>
                    <div class="search-section">
                        <div class="search-box">
                            <input type="text" class="search-input" placeholder="输入用户名或邮箱"/>
                            <button class="search-btn">
                                <i class="icon-search"></i> 查找
                            </button>
                        </div>
                        <div class="search-result-title">搜索结果</div>
                        <div class="stranger-result"></div>
                    </div>
                </div>

                <!-- 好友申请部分 -->
                <div class="friend-section">
                    <div class="section-header">
                        <h2 class="section-title">好友申请</h2>
                    </div>
                    <div id="friend-requests" class="requests-list"></div>
                </div>
            </div>

            <style>
                .friend-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    padding: 20px;
                }
                
                .friend-section {
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    padding: 20px;
                }
                
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .section-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                    margin: 0;
                }
                
                .add-friend-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: #4CAF50;
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                
                .add-friend-btn:hover {
                    background: #388E3C;
                    transform: translateY(-1px);
                }
                
                .friend-list {
                    min-height: 120px;
                }
                
                .friend-items {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .friend-item {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                
                .friend-item:hover {
                    background: #f9f9f9;
                    transform: translateX(2px);
                }
                
                .friend-avatar {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    object-fit: cover;
                    margin-right: 12px;
                    border: 2px solid #f0f0f0;
                }
                
                .friend-info {
                    display: flex;
                    flex-direction: column;
                }
                
                .friend-name {
                    font-size: 15px;
                    font-weight: 500;
                    color: #333;
                }
                
                .friend-status {
                    font-size: 12px;
                    margin-top: 2px;
                }
                
                .friend-status.online {
                    color: #4CAF50;
                }
                
                .friend-status.offline {
                    color: #999;
                }
                
                .empty-tip {
                    color: #aaa;
                    text-align: center;
                    padding: 20px 0;
                    font-size: 14px;
                }
                
                .search-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .search-box {
                    display: flex;
                    gap: 10px;
                }
                
                .search-input {
                    flex: 1;
                    padding: 10px 14px;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                
                .search-input:focus {
                    border-color: #4CAF50;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
                }
                
                .search-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0 16px;
                    background: #2196F3;
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                
                .search-btn:hover {
                    background: #1976D2;
                }
                
                .search-result-title {
                    font-size: 15px;
                    font-weight: 500;
                    color: #555;
                    margin-top: 8px;
                }
                
                .stranger-result {
                    min-height: 60px;
                    background: #fafafa;
                    border-radius: 8px;
                    padding: 16px;
                    margin-top: 8px;
                }
                
                .stranger-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .stranger-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                
                .stranger-name {
                    flex: 1;
                    font-size: 14px;
                    color: #333;
                }
                
                .requests-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .friend-request-item {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    background: #fff;
                    border-radius: 8px;
                    border: 1px solid #f0f0f0;
                }
                
                .request-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                    margin-right: 12px;
                }
                
                .request-name {
                    flex: 1;
                    font-size: 14px;
                    color: #333;
                }
                
                .accept-btn, .reject-btn {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                    margin-left: 8px;
                }
                
                .accept-btn {
                    background: #4CAF50;
                    color: #fff;
                }
                
                .accept-btn:hover {
                    background: #388E3C;
                }
                
                .reject-btn {
                    background: #f44336;
                    color: #fff;
                }
                
                .reject-btn:hover {
                    background: #d32f2f;
                }
                
                .icon-plus, .icon-search {
                    font-size: 12px;
                }
                
                .group-list-content {
            min-height: 80px;
        }
        .group-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f3f3f3;
            cursor: pointer;
            transition: background 0.2s;
        }
        .group-item:hover { background: #f0f7ff; }
        .group-avatar {
            width: 36px; height: 36px; border-radius: 50%; margin-right: 12px;
        }
        .group-name { font-size: 15px; color: #333; }
    
    
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
