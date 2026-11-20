document.addEventListener('DOMContentLoaded', () => {
    let footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) {
        footerPlaceholder = document.createElement('div');
        footerPlaceholder.id = 'footer-placeholder';
        document.body.appendChild(footerPlaceholder);
    }

    footerPlaceholder.innerHTML = `
        <footer style="background: #0a0a0a; border-top: 1px solid #222; padding: 50px; margin-top: 100px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 40px; max-width: 1200px; margin: 0 auto;">
                <div style="flex: 1; min-width: 250px;">
                    <div style="font-size: 24px; font-weight: 900; color: #fff; margin-bottom: 15px;">BEATLAB®</div>
                    <p style="color: #888; font-size: 14px; line-height: 1.6;">Платформа для создания музыки и битов. Слушай, создавай, делись.</p>
                </div>
                <div style="flex: 1; min-width: 200px;">
                    <h4 style="color: #fff; font-size: 14px; text-transform: uppercase; margin-bottom: 15px;">Навигация</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 10px;"><a href="/" style="color: #888; text-decoration: none; font-size: 14px;">Главная</a></li>
                        <li style="margin-bottom: 10px;"><a href="/library.html" style="color: #888; text-decoration: none; font-size: 14px;">Библиотека</a></li>
                        <li style="margin-bottom: 10px;"><a href="/studio.html" style="color: #888; text-decoration: none; font-size: 14px;">Студия</a></li>
                        <li style="margin-bottom: 10px;"><a href="/about.html" style="color: #888; text-decoration: none; font-size: 14px;">О проекте</a></li>
                        <li style="margin-bottom: 10px;"><a href="/contacts.html" style="color: #888; text-decoration: none; font-size: 14px;">Контакты</a></li>
                    </ul>
                </div>
                <div style="flex: 1; min-width: 200px;">
                    <h4 style="color: #fff; font-size: 14px; text-transform: uppercase; margin-bottom: 15px;">Мы в соцсетях</h4>
                    <div style="display: flex; gap: 15px;">
                        <a href="https://t.me/beatlab_channel" target="_blank" style="color: #888; font-size: 20px; text-decoration: none;">TG</a>
                        <a href="https://vk.ru/club243517877" target="_blank" style="color: #888; font-size: 20px; text-decoration: none;">VK</a>
                    </div>
                </div>
                <div style="flex: 1; min-width: 200px;">
                    <h4 style="color: #fff; font-size: 14px; text-transform: uppercase; margin-bottom: 15px;">Контакты</h4>
                    <p style="color: #888; font-size: 14px; margin-bottom: 10px;">Email: info@beatlab.com</p>
                    <p style="color: #888; font-size: 14px;">Телефон: +7 (900) 000-00-00</p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #222; color: #555; font-size: 12px;">© 2025 BEATLAB. Все права защищены.</div>
        </footer>
    `;
});