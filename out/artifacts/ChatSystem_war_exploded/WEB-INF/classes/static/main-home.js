// 渲染主页（美观+活泼+加好友提示）
function renderHomePage() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="home-page">
            <div class="home-card">
                <h1>👋 欢迎来到在线聊天乐园！</h1>
                <p class="desc">在这里，结识新朋友，畅聊每一天！</p>
                <ul>
                    <li>✨ 创建/加入群聊，发现更多有趣灵魂</li>
                    <li>💬 群聊消息秒送，历史消息随时查</li>
                    <li>👥 群成员管理，申请轻松搞定</li>
                    <li>🤝 好友申请与管理，随时扩列</li>
                </ul>
                <div class="add-friend-tip">📢 想加我好友？<b>搜索 test1</b> 就能找到我啦！</div>
                <p class="footer">本项目仅供学习交流使用。<br>&copy; 2025.5 赵宇博 ❥(^_-)</p>
            </div>
        </div>
        <style>
            .home-page {
                min-height: 100vh;
                background: linear-gradient(135deg, #e3f0ff 0%, #f9e7ff 100%);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .home-card {
                background: #fff;
                border-radius: 18px;
                box-shadow: 0 8px 32px rgba(33,150,243,0.08);
                padding: 48px 40px 32px 40px;
                max-width: 420px;
                width: 100%;
                text-align: center;
            }
            .home-card h1 {
                font-size: 28px;
                color: #2196F3;
                margin-bottom: 10px;
                font-weight: 800;
                letter-spacing: 1px;
            }
            .desc {
                color: #7b1fa2;
                font-size: 16px;
                margin-bottom: 18px;
            }
            .home-card ul {
                text-align: left;
                margin: 18px 0 0 0;
                padding: 0 0 0 18px;
            }
            .home-card li {
                font-size: 15px;
                margin-bottom: 8px;
                color: #333;
                line-height: 1.7;
            }
            .add-friend-tip {
                margin: 22px 0 10px 0;
                background: #e3f2fd;
                color: #1976d2;
                border-radius: 8px;
                padding: 10px 0;
                font-size: 15px;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            .footer {
                color: #aaa;
                font-size: 13px;
                margin-top: 18px;
            }
        </style>
    `;
}

// 监听侧边栏主页按钮
document.addEventListener('DOMContentLoaded', async () => { await fetchCurrentUser();


const sidebarBtns = document.querySelectorAll('.sidebar-btn');
const mainContent = document.querySelector('.main-content');
const homeBtn = sidebarBtns[0]; // 假设主页按钮是第1个

homeBtn.addEventListener('click', () => {
    sidebarBtns.forEach(btn => btn.classList.remove('active'));
    homeBtn.classList.add('active');
    renderHomePage();
});

// 默认进入主页
renderHomePage();
});
