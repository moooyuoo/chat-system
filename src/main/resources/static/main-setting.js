// 渲染设置页
async function renderSettingsPage() {
    const mainContent = document.querySelector('.main-content');
    // 获取当前用户信息
    let user = {};
    try {
        const res = await fetch('/api/user/me');
        if (res.ok) user = await res.json();
    } catch {}

    mainContent.innerHTML = `
        <div class="settings-page">
            <h1>设置</h1>
            <div class="user-info-block">
                <img src="${user.avatar || 'avatar.png'}" class="user-avatar"/>
                <div class="user-info">
                    <div><b>用户名：</b><span class="user-username">${user.username || ''}</span></div>
                    <div><b>邮箱：</b><span class="user-email">${user.email || ''}</span></div>
                </div>
            </div>
            <div class="settings-actions">
                <button class="edit-nickname-btn">修改昵称</button>
                <!--<button class="edit-avatar-btn">更换头像</button>-->
                <button class="edit-password-btn">修改密码</button>
            </div>
            <p style="color:#888;margin-top:18px;">更多功能敬请期待。</p>
        </div>
        <style>
            .settings-page { padding: 48px 32px; }
            .settings-page h1 { font-size: 24px; color: #4CAF50; margin-bottom: 18px; }
            .user-info-block { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
            .user-avatar { width: 72px; height: 72px; border-radius: 50%; border: 2px solid #eee; }
            .user-info { font-size: 16px; color: #333; }
            .settings-actions { display: flex; gap: 16px; margin-bottom: 12px; }
            .settings-actions button { padding: 8px 18px; border-radius: 6px; border: none; background: #2196F3; color: #fff; cursor: pointer; }
            .settings-actions button:hover { background: #1976D2; }
        </style>
    `;

    // 修改昵称
    mainContent.querySelector('.edit-nickname-btn').onclick = async () => {
        const nickname = prompt('请输入新的昵称：', user.username || '');
        if (!nickname || nickname === user.username) return;
        const res = await fetch('/api/user/update', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `username=${encodeURIComponent(nickname)}`
        });
        alert(await res.text());
        renderSettingsPage();
    };

    // 更换头像
    mainContent.querySelector('.edit-avatar-btn').onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            if (!input.files.length) return;
            const formData = new FormData();
            formData.append('avatar', input.files[0]);
            const res = await fetch('/api/user/avatar', {
                method: 'POST',
                body: formData
            });
            alert(await res.text());

            // 头像上传成功后，刷新所有头像
            document.querySelectorAll('.user-avatar').forEach(img => {
                img.src = (img.src.split('?')[0]) + '?t=' + Date.now();
            });

            if (avatarImg) {
                // 加时间戳防止缓存
                avatarImg.src = (avatarImg.src.split('?')[0]) + '?t=' + Date.now();
            }
        };
        input.click();
    };

    // 修改密码
    mainContent.querySelector('.edit-password-btn').onclick = async () => {
        const pwd = prompt('请输入新密码：');
        if (!pwd) return;
        const res = await fetch('/api/user/password', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `password=${encodeURIComponent(pwd)}`
        });
        alert(await res.text());
    };
}


// 监听侧边栏设置按钮
document.addEventListener('DOMContentLoaded', async () => {
    await fetchCurrentUser();

    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    const settingsBtn = sidebarBtns[5]; // 假设设置按钮是第5个

    settingsBtn.addEventListener('click', () => {
        sidebarBtns.forEach(btn => btn.classList.remove('active'));
        settingsBtn.classList.add('active');
        renderSettingsPage();
    });
});
