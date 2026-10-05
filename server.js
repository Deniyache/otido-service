require("dotenv").config();

const axios = require("axios");
const rateLimit = require("express-rate-limit");
const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Ограничение количества заявок
const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: "Слишком много заявок. Попробуйте через 15 минут."
    }
});

// Проверка данных формы
function validateRequest(name, phone, comment) {
    if (!name || name.trim().length < 2) {
        return "Введите имя.";
    }

    const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;

    if (!phoneRegex.test(phone)) {
        return "Введите корректный номер телефона.";
    }

    if (comment && comment.length > 500) {
        return "Комментарий слишком длинный.";
    }

    return null;
}

// Отправка сообщения в Telegram
async function sendTelegramMessage(text) {
    const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

    await axios.post(url, {
        chat_id: process.env.CHAT_ID,
        text
    });
}

// Главная страница
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Заявка на консультацию
app.post("/consultation", formLimiter, async (req, res) => {
    const { name, phone, comment } = req.body;

    // Honeypot-защита от ботов
    if (req.body.website) {
        return res.status(400).json({
            success: false,
            message: "Спам обнаружен."
        });
    }

    const validationError = validateRequest(name, phone, comment);

    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        });
    }

    const text =
        `🚗 Новая заявка!\n\n` +
        `👤 Имя: ${name.trim()}\n\n` +
        `📞 Телефон: ${phone}\n\n` +
        `💬 Комментарий:\n${comment?.trim() || "Нет"}`;

    try {
        await sendTelegramMessage(text);

        return res.json({
            success: true,
            message: "Спасибо! Мы скоро свяжемся с вами."
        });
    } catch (error) {
        console.error(
            "Ошибка отправки в Telegram:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Ошибка отправки."
        });
    }
});

// Запись на обслуживание
app.post("/service", formLimiter, async (req, res) => {
    const { name, phone, comment } = req.body;

    // Honeypot-защита от ботов
    if (req.body.website) {
        return res.status(400).json({
            success: false,
            message: "Спам обнаружен."
        });
    }

    const validationError = validateRequest(name, phone, comment);

    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        });
    }

    const text =
        `🔧 Новая запись в сервис\n\n` +
        `👤 Имя: ${name.trim()}\n` +
        `📞 Телефон: ${phone}\n` +
        `💬 Комментарий: ${comment?.trim() || "Нет"}`;

    try {
        await sendTelegramMessage(text);

        return res.json({
            success: true,
            message: "Вы успешно записались!"
        });
    } catch (error) {
        console.error(
            "Ошибка отправки в Telegram:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Ошибка отправки."
        });
    }
});

// Запуск сервера
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
