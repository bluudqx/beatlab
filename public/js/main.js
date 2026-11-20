document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ЛОГИКА ДЛЯ ФОРМЫ РЕГИСТРАЦИИ ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Регистрация успешна! Теперь вы можете войти.');
                    window.location.href = '/login.html';
                } else {
                    alert('Ошибка: ' + data.error);
                }
            } catch (error) {
                alert('Не удалось связаться с сервером.');
            }
        });
    }

    // --- 2. ЛОГИКА ДЛЯ ФОРМЫ ВХОДА ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (response.ok) {
                    alert(`Добро пожаловать, ${data.user.username}!`);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    window.location.href = '/'; // Перекидываем на главную
                } else {
                    alert('Ошибка: ' + data.error);
                }
            } catch (error) {
                alert('Не удалось связаться с сервером.');
            }
        });
    }

    // --- 3. ОБНОВЛЕНИЕ ШАПКИ (ЕСЛИ ПОЛЬЗОВАТЕЛЬ ВОШЕЛ) ---
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navAuth = document.querySelector('.nav-auth');

    // Проверяем, что пользователь вошел И что блок навигации существует на странице
    if (currentUser && navAuth) {
        navAuth.innerHTML = `
            <a href="/dashboard.html" style="color: var(--text-white); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; text-decoration: none; margin-right: 20px;">Мои биты</a>
            <span style="color: var(--text-gray); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Привет, ${currentUser.username}!</span>
            <a href="#" id="logoutBtn" class="btn-dark" style="margin-left: 20px;">Выйти</a>
        `;

        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
    }
});