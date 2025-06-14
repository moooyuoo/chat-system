// 全局变量存储当前用户信息
let currentUser = null;

// 新增全局变量
let chatPollingTimer = null;
let currentChatFriendId = null;

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
    if (!currentUser) {
        alert('请先登录');
        return;
    }

    const chatArea = document.getElementById('private-chat-area');
    chatArea.innerHTML = `
        <div class="wx-chat-container">
            <div class="wx-chat-header">
    <div class="wx-chat-header-content">
        <img src="${friend.avatar || 'avatar.png'}" class="wx-chat-avatar"/>
        <span class="wx-chat-title">${friend.username}</span>
        <button class="wx-search-msg-btn" title="查找聊天记录">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="2"/>
                <line x1="14.2" y1="14.2" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="btn-text">查找聊天记录</span>
        </button>
    </div>
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
                max-width: 80%;
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
 .wx-chat-header {
        background: #f7f7f7;
        border-bottom: 1px solid #e0e0e0;
        height: 60px;
        display: flex;
        align-items: center;
        padding: 0 16px;
    }
    
    .wx-chat-header-content {
        display: flex;
        align-items: center;
        width: 100%;
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
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }
    
    .wx-search-msg-btn {
        margin-left: auto;
        background: transparent;
        color: #2196F3;
        border: 1px solid rgba(33, 150, 243, 0.3);
        border-radius: 18px;
        padding: 6px 12px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
        height: 32px;
    }
    
    .wx-search-msg-btn:hover {
        background: rgba(33, 150, 243, 0.08);
        border-color: rgba(33, 150, 243, 0.5);
    }
    
    .wx-search-msg-btn svg {
        width: 16px;
        height: 16px;
    }
    
    .btn-text {
        margin-top: 1px; /* 微调文字对齐 */
    }
    
    @media (max-width: 480px) {
        .btn-text {
            display: none; /* 小屏幕隐藏文字 */
        }
        .wx-search-msg-btn {
            padding: 6px;
            border-radius: 50%;
        }
    }
        </style>
    `;

    // 记录当前聊天对象
    currentChatFriendId = friend.id;

    // 定义加载消息的函数（可复用）
    async function loadMessages() {
        try {
            const res = await fetch(`/api/message/list?friendId=${friend.id}`);
            if (!res.ok) throw new Error('获取消息失败');
            const list = await res.json();
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
    <img src="${(currentUser.avatar || 'avatar.png') + '?t=' + (window.avatarUpdateTime || '')}" class="wx-msg-avatar"/>
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
        } catch (error) {
            console.error('加载消息失败:', error);
        }
    }

    // 首次加载消息
    await loadMessages();

    // 清除上一个定时器
    if (chatPollingTimer) {
        clearInterval(chatPollingTimer);
        chatPollingTimer = null;
    }

    // 启动定时轮询，每3秒拉取一次
    chatPollingTimer = setInterval(() => {
        // 只在当前聊天窗口才轮询
        if (currentChatFriendId === friend.id) {
            loadMessages();
        }
    }, 3000);

    // 在 renderChatPanel(friend) 内部添加
    chatArea.querySelector('.wx-search-msg-btn').onclick = function () {
        // 弹窗结构
        const modal = document.createElement('div');
        modal.className = 'chat-search-modal';
        modal.innerHTML = `
        <div class="chat-search-dialog">
            <div class="chat-search-header">查找聊天记录</div>
            <div class="chat-search-body">
                <input type="date" class="search-date" />
                <input type="text" class="search-keyword" placeholder="输入内容关键词" />
                <button class="do-search-btn">查找</button>
                <button class="download-btn" disabled>下载聊天记录</button>
                <div class="search-result-list"></div>
            </div>
            <button class="close-modal-btn">×</button>
        </div>
        <style>
            .chat-search-modal {
                position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
                background: rgba(0,0,0,0.18); z-index: 9999; display: flex; align-items: center; justify-content: center;
            }
            .chat-search-dialog {
                background: #fff; border-radius: 8px; padding: 24px 28px 18px 28px; min-width: 340px; position: relative;
                box-shadow: 0 4px 24px rgba(0,0,0,0.12);
            }
            .chat-search-header { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
            .chat-search-body input { margin-right: 8px; margin-bottom: 8px; }
            .do-search-btn, .download-btn { margin-right: 8px; }
            .search-result-list { margin-top: 12px; max-height: 260px; overflow-y: auto; font-size: 14px; }
            .close-modal-btn {
                position: absolute; right: 10px; top: 10px; border: none; background: none; font-size: 22px; color: #888; cursor: pointer;
            }
        </style>
    `;
        document.body.appendChild(modal);

        // 关闭弹窗
        modal.querySelector('.close-modal-btn').onclick = () => modal.remove();

        // 查找按钮事件
        const resultList = modal.querySelector('.search-result-list');
        let lastResult = [];
        modal.querySelector('.do-search-btn').onclick = async function () {
            const date = modal.querySelector('.search-date').value;
            const keyword = modal.querySelector('.search-keyword').value.trim();
            let url = `/api/message/search?friendId=${friend.id}`;
            if (date) url += `&date=${date}`;
            if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
            resultList.innerHTML = '查找中...';
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error('查找失败');
                const list = await res.json();
                lastResult = list;
                modal.querySelector('.download-btn').disabled = list.length === 0;
                if (list.length === 0) {
                    resultList.innerHTML = '<div style="color:#aaa;">无匹配记录</div>';
                    return;
                }
                resultList.innerHTML = list.map(msg => {
                    const date = new Date(msg.timestamp);
                    date.setHours(date.getHours() + 8);
                    const timeStr = date.toLocaleString('zh-CN', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                    const sender = msg.sender_id === currentUser.id ? '我' : friend.username;
                    return `<div style="margin-bottom:8px;"><b>${sender}</b> <span style="color:#888;">[${timeStr}]</span><br/>${msg.content}</div>`;
                }).join('');
            } catch (e) {
                resultList.innerHTML = `<span style="color:red;">${e.message}</span>`;
                modal.querySelector('.download-btn').disabled = true;
            }
        };

        // 下载按钮事件
        modal.querySelector('.download-btn').onclick = function () {
            if (!lastResult.length) return;
            const lines = lastResult.map(msg => {
                const date = new Date(msg.timestamp);
                date.setHours(date.getHours() + 8);
                const timeStr = date.toLocaleString('zh-CN', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                const sender = msg.sender_id === currentUser.id ? '我' : friend.username;
                return `[${timeStr}] ${sender}: ${msg.content}`;
            });
            const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `聊天记录_${friend.username}.txt`;
            a.click();
            URL.revokeObjectURL(a.href);
        };
    };

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
    <img src="${(currentUser.avatar || 'avatar.png') + '?t=' + (window.avatarUpdateTime || '')}" class="wx-msg-avatar"/>
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
    <img src="${(currentUser.avatar || 'avatar.png') + '?t=' + (window.avatarUpdateTime || '')}" class="wx-msg-avatar"/>
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
