// 全局变量存储当前用户信息
let currentUser = null;

// 获取当前用户信息
async function fetchCurrentUser() {
    try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
            currentUser = await res.json();
            return currentUser;
        } else {
            window.location.href = 'login.html';
            return null;
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        return null;
    }
}

// 渲染私聊主界面
async function renderPrivateMain() {
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
    await loadPrivateFriendList();
}

// 加载好友列表
async function loadPrivateFriendList() {
    // 确保已获取当前用户信息
    if (!currentUser) {
        await fetchCurrentUser();
    }

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
async function renderChatPanel(friend) {
    // 确保已获取当前用户信息
    if (!currentUser) {
        await fetchCurrentUser();
    }

    const chatArea = document.getElementById('private-chat-area');
    chatArea.innerHTML = `
        <div class="wx-chat-container">
            <div class="wx-chat-header">
                <img src="${friend.avatar || 'avatar.png'}" class="wx-chat-avatar"/>
                <span class="wx-chat-title">${friend.username}</span>
            </div>
            <div class="wx-chat-messages" id="chat-messages"></div>
            <div class="wx-chat-input-area">
                <textarea class="wx-chat-input" placeholder="请输入消息..."></textarea>
                <button class="wx-send-btn">发送</button>
            </div>
        </div>
        <style>
            .wx-chat-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: #ededed;
            }
            .wx-chat-header {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 60px;
                background: #f7f7f7;
                border-bottom: 1px solid #e0e0e0;
                position: relative;
            }
            .wx-chat-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                margin-right: 12px;
            }
            .wx-chat-title {
                font-size: 18px;
                font-weight: 600;
                color: #222;
            }
            .wx-chat-messages {
                flex: 1;
                padding: 20px 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 14px;
                background: #ededed;
            }
            .wx-msg-row {
                display: flex;
                align-items: flex-end;
                gap: 8px;
            }
            .wx-msg-row-self {
                justify-content: flex-end;
            }
            .wx-msg-row-friend {
                justify-content: flex-start;
            }
            .wx-msg-avatar {
                width: 32px;
                height: 32px;
                border-radius: 4px;
            }
            .wx-msg-bubble {
                max-width: 60%;
                padding: 10px 16px;
                border-radius: 6px;
                font-size: 15px;
                line-height: 1.6;
                background: #fff;
                color: #222;
                box-shadow: 0 1px 2px rgba(0,0,0,0.04);
                word-break: break-all;
            }
            .wx-msg-row-self .wx-msg-bubble {
                background: #95ec69;
                color: #222;
                border-bottom-right-radius: 2px;
            }
            .wx-msg-row-friend .wx-msg-bubble {
                background: #fff;
                color: #222;
                border-bottom-left-radius: 2px;
            }
            .wx-chat-input-area {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                background: #f7f7f7;
                border-top: 1px solid #e0e0e0;
            }
            .wx-chat-input {
                flex: 1;
                resize: none;
                border: 1px solid #e0e0e0;
                border-radius: 18px;
                padding: 10px 16px;
                font-size: 15px;
                margin-right: 10px;
                min-height: 36px;
                max-height: 80px;
                background: #fff;
            }
            .wx-send-btn {
                background: #07c160;
                color: #fff;
                border: none;
                border-radius: 18px;
                padding: 8px 22px;
                font-size: 15px;
                cursor: pointer;
                transition: background 0.2s;
            }
            .wx-send-btn:hover {
                background: #059948;
            }
            .wx-msg-time {
    font-size: 12px;
    color: #b0b0b0;
    margin-top: 4px;
    text-align: right;
    padding-right: 2px;
}
.wx-msg-row-friend .wx-msg-time {
    text-align: left;
    padding-left: 2px;
    padding-right: 0;
}
        </style>
    `;

    // 加载历史消息
    fetch(`/api/message/list?friendId=${friend.id}`)
        .then(r => {
            if (!r.ok) throw new Error('获取消息失败');
            return r.json();
        })
        .then(list => {
            const msgBox = document.getElementById('chat-messages');
            msgBox.innerHTML = '';
            list.forEach(msg => {
                const isSelf = msg.sender_id === currentUser.id;
                const date = new Date(msg.timestamp);
                date.setHours(date.getHours() + 8);
                const timeStr = date.toLocaleString('zh-CN', {
                    hour12: false,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                msgBox.innerHTML += `
                <div class="wx-msg-row ${isSelf ? 'wx-msg-row-self' : 'wx-msg-row-friend'}">
            ${isSelf ? `
                <div>
                    <div class="wx-msg-bubble">${msg.content}</div>
                    <div class="wx-msg-time"> ${timeStr} </div>
                </div>
                <img src="${currentUser.avatar || 'avatar.png'}" class="wx-msg-avatar"/>
            ` : `
                <img src="${friend.avatar || 'avatar.png'}" class="wx-msg-avatar"/>
                <div>
                    <div class="wx-msg-bubble">${msg.content}</div>
                    <div class="wx-msg-time"> ${timeStr} </div>
                </div>
            `}
        </div>
            `;
            });
            msgBox.scrollTop = msgBox.scrollHeight;
        })
        .catch(error => {
            console.error('加载消息失败:', error);
            alert('加载消息失败: ' + error.message);
        });

    // 发送消息
    const sendBtn = chatArea.querySelector('.wx-send-btn');
    const input = chatArea.querySelector('.wx-chat-input');

    sendBtn.onclick = sendMessage;
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBtn.click();
        }
    });

    function sendMessage() {
        const content = input.value.trim();
        if (!content) return;

        const formData = new FormData();
        formData.append('receiverId', friend.id);
        formData.append('content', content);

        fetch('/api/message/send', {
            method: 'POST',
            body: formData
        })
            .then(async r => {
                if (!r.ok) {
                    const error = await r.text();
                    throw new Error(error || '发送失败');
                }
                return r.json();
            })
            .then(msg => {
                if (!msg || !msg.content) {
                    throw new Error('无效的响应格式');
                }
                // 追加新消息
                const msgBox = document.getElementById('chat-messages');
                msgBox.innerHTML += `
    <div class="wx-msg-row wx-msg-row-self">
        <div class="wx-msg-bubble">${msg.content}</div>
        <img src="${currentUser.avatar || 'avatar.png'}" class="wx-msg-avatar"/>
    </div>
`;
                input.value = '';
                msgBox.scrollTop = msgBox.scrollHeight;
            })
            .catch(error => {
                console.error('发送消息失败:', error);
                alert('发送消息失败: ' + error.message);
            });
    }
}

// 监听侧边栏"私聊"按钮
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化时获取当前用户信息
    await fetchCurrentUser();

    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    const mainContent = document.querySelector('.main-content');
    const privateBtn = sidebarBtns[2];

    privateBtn.addEventListener('click', async () => {
        sidebarBtns.forEach(btn => btn.classList.remove('active'));
        privateBtn.classList.add('active');
        await renderPrivateMain();
    });
});
