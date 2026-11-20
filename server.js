const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Для создания папки uploads
const bcrypt = require('bcryptjs');
const multer = require('multer');
require('dotenv').config();

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// СОЗДАНИЕ ПАПКИ UPLOADS (ЕСЛИ ЕЁ НЕТ)
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('✅ Папка uploads создана');
}

// ==========================================
// НАСТРОЙКИ
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// --- НАСТРОЙКА ЗАГРУЗКИ ФАЙЛОВ (АУДИО + ОБЛОЖКА) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
const uploadFields = upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]);

// ==========================================
// 1. АУТЕНТИФИКАЦИЯ
// ==========================================
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Все поля обязательны' });

    try {
        db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, user) => {
            if (err) return res.status(500).json({ error: 'Ошибка базы данных' });
            if (user) return res.status(400).json({ error: 'Пользователь уже существует' });

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            db.run(
                'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                [username, email, passwordHash, 'user'],
                function (err) {
                    if (err) return res.status(500).json({ error: 'Ошибка при создании' });
                    res.status(201).json({ message: 'Пользователь создан!', userId: this.lastID });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Введите логин и пароль' });

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Ошибка базы данных' });
        if (!user) return res.status(400).json({ error: 'Неверный логин или пароль' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: 'Неверный логин или пароль' });

        res.json({ message: 'Вход выполнен!', user: { id: user.id, username: user.username, role: user.role } });
    });
});

// ==========================================
// 2. ТРЕКИ
// ==========================================

// ПОЛУЧЕНИЕ ОДНОГО ТРЕКА (должен идти перед общим GET)
app.get('/api/tracks/:id', (req, res) => {
    const trackId = req.params.id;
    const sql = `
        SELECT tracks.*, users.username as artist_name 
        FROM tracks 
        JOIN users ON tracks.artist_id = users.id 
        WHERE tracks.id = ?
    `;
    db.get(sql, [trackId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Ошибка БД' });
        if (!row) return res.status(404).json({ error: 'Трек не найден' });
        res.json(row);
    });
});

app.get('/api/tracks', (req, res) => {
    const sql = `
        SELECT tracks.*, users.username as artist_name 
        FROM tracks 
        JOIN users ON tracks.artist_id = users.id 
        ORDER BY tracks.created_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Ошибка при получении треков' });
        res.json(rows);
    });
});

app.post('/api/tracks', uploadFields, (req, res) => {
    const { title, genre, bpm, artist_id } = req.body;
    
    const audioFile = req.files['audio'] ? req.files['audio'][0] : null;
    const coverFile = req.files['cover'] ? req.files['cover'][0] : null;
    
    const file_url = audioFile ? `/uploads/${audioFile.filename}` : null;
    const cover_url = coverFile ? `/uploads/${coverFile.filename}` : null;

    if (!title || !file_url) {
        return res.status(400).json({ error: 'Название и аудиофайл обязательны' });
    }

    const finalArtistId = artist_id || 1; 

    db.run(
        'INSERT INTO tracks (title, artist_id, genre, bpm, file_url, cover_url) VALUES (?, ?, ?, ?, ?, ?)',
        [title, finalArtistId, genre, bpm, file_url, cover_url],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Ошибка при сохранении трека' });
            }
            res.status(201).json({ message: 'Трек загружен!', trackId: this.lastID });
        }
    );
});

// ==========================================
// 3. БИТЫ
// ==========================================
app.get('/api/beats/single/:id', (req, res) => {
    const beatId = req.params.id;
    db.get('SELECT * FROM beat_projects WHERE id = ?', [beatId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Ошибка БД' });
        if (!row) return res.status(404).json({ error: 'Бит не найден' });
        res.json(row);
    });
});

app.delete('/api/beats/:id', (req, res) => {
    const beatId = req.params.id;
    db.run('DELETE FROM beat_projects WHERE id = ?', [beatId], function(err) {
        if (err) {
            console.error('Ошибка при удалении:', err);
            return res.status(500).json({ error: 'Ошибка при удалении' });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Бит не найден' });
        res.json({ message: 'Бит удален' });
    });
});

app.put('/api/beats/:id', (req, res) => {
    const beatId = req.params.id;
    const { name, genre, bpm, instruments, pattern } = req.body;
    
    db.run(
        'UPDATE beat_projects SET name = ?, genre = ?, bpm = ?, instruments_json = ?, pattern_json = ? WHERE id = ?',
        [name, genre, bpm, JSON.stringify(instruments), JSON.stringify(pattern), beatId],
        function(err) {
            if (err) return res.status(500).json({ error: 'Ошибка при обновлении' });
            res.json({ message: 'Бит обновлен!' });
        }
    );
});

app.post('/api/beats', (req, res) => {
    const { name, genre, bpm, instruments, pattern, user_id } = req.body;

    if (!name || !genre || !bpm) {
        return res.status(400).json({ error: 'Заполните название, жанр и BPM' });
    }

    const finalUserId = user_id || 1; 

    // Проверяем, существует ли пользователь (чтобы не было FOREIGN KEY ошибки)
    db.get('SELECT id FROM users WHERE id = ?', [finalUserId], (err, user) => {
        if (err) return res.status(500).json({ error: 'Ошибка базы данных' });
        
        if (!user) {
            return res.status(400).json({ error: 'Пользователь не найден. Пожалуйста, перезайдите в аккаунт.' });
        }

        db.run(
            'INSERT INTO beat_projects (user_id, name, genre, bpm, instruments_json, pattern_json) VALUES (?, ?, ?, ?, ?, ?)',
            [finalUserId, name, genre, bpm, JSON.stringify(instruments), JSON.stringify(pattern)],
            function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Ошибка при сохранении бита' });
                }
                res.status(201).json({ message: 'Бит сохранен!', beatId: this.lastID });
            }
        );
    });
});

app.get('/api/beats/:userId', (req, res) => {
    const userId = req.params.userId;
    db.all('SELECT * FROM beat_projects WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Ошибка при получении битов' });
        res.json(rows);
    });
});

// ==========================================
// 4. ТЕСТОВЫЙ МАРШРУТ И ЗАПУСК
// ==========================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'BeatLab API работает!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
