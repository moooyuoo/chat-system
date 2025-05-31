// 渲染私聊主界面（好友列表+聊天区）
function renderPrivateMain() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="private-main">
            <div class="private-friend-list" id="private-friend-list"></div>
            <div class="private-chat-area" id="private-chat-area">
                <div class="empty-chat-tip">选择好友聊天吧</div>
            </div>
        </div>
        <style>
            .private-main { display: flex; height: 100%; }
            .private-friend-list {
                width: 240px;
                border-right: 1px solid #eee;
                background: #fafbfc;
                overflow-y: auto;
            }
            .private-chat-area {
                flex: 1;
                background: #fff;
                position: relative;
            }
            .empty-chat-tip {
                color: #aaa;
                font-size: 18px;
                text-align: center;
                margin-top: 120px;
            }
            .friend-item {
                display: flex;
                align-items: center;
                padding: 14px 18px;
                cursor: pointer;
                border-bottom: 1px solid #f3f3f3;
                transition: background 0.2s;
            }
            .friend-item:hover { background: #f0f7ff; }
            .friend-avatar {
                width: 38px; height: 38px; border-radius: 50%; margin-right: 12px;
            }
            .friend-name { font-size: 16px; color: #333; }
        </style>
    `;
    loadPrivateFriendList();
}

// 加载好友列表
function loadPrivateFriendList() {
    fetch('/api/friend/list').then(r => r.json()).then(list => {
        const box = document.getElementById('private-friend-list');
        box.innerHTML = '';
        if (!list || list.length === 0) {
            box.innerHTML = '<div class="empty-tip">暂无好友</div>';
            return;
        }
        list.forEach(friend => {
            const div = document.createElement('div');
            div.className = 'friend-item';
            div.innerHTML = `
                <img src="${friend.avatar || 'avatar.png'}" class="friend-avatar"/>
                <div class="friend-name">${friend.username}</div>
            `;
            div.onclick = () => renderChatPanel(friend);
            box.appendChild(div);
        });
    });
}

// 渲染聊天界面
function renderChatPanel(friend) {
    const chatArea = document.getElementById('private-chat-area');
    chatArea.innerHTML = `
        <div class="chat-container">
            <div class="chat-header">
                <img src="${friend.avatar || 'avatar.png'}" class="chat-avatar"/>
                <div class="chat-info">
                    <div class="chat-name">${friend.username}</div>
                </div>
            </div>
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-area">
                <textarea class="chat-input" placeholder="输入消息..."></textarea>
                <button class="send-btn">发送</button>
            </div>
        </div>
    `;
    // 后续可在此处加载消息
}

// 可在入口js调用 renderPrivateMain()，如：renderPrivateMain();
