require("dotenv").config();

const axios = require("axios");
const rateLimit = require("express-rate-limit");
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// папка со статикой
app.use(express.static(__dirname));

// главная страница
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/consultation", formLimiter, async (req, res) => {
    const { name, phone, comment } = req.body;

    if (req.body.website) {
        return res.status(400).json({
            success: false,
            message: "Спам обнаружен."
        });
    }

    if (!name || name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Введите имя."
        });
    }

    const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;

    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            success: false,
            message: "Введите корректный номер телефона."
        });
    }

    if (comment && comment.length > 500) {
        return res.status(400).json({
            success: false,
            message: "Комментарий слишком длинный."
        });
    }

    const text =
        `🚗 Новая заявка!

👤 Имя: ${name}

📞 Телефон: ${phone}

💬 Комментарий:
${comment || "Нет"}`;

    try {

        await axios.post(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
            {
                chat_id: process.env.CHAT_ID,
                text
            }
        );

        res.json({
            success: true,
            message: "Спасибо! Мы скоро свяжемся с вами."
        });

    } catch (err) {

        console.log(err.response?.data || err.message);

        res.status(500).json({
            success: false,
            message: "Ошибка отправки."
        });

    }

});

app.post("/service", formLimiter, async (req, res) => {

    const { name, phone, comment } = req.body;

    if (req.body.website) {
        return res.status(400).json({
            success: false,
            message: "Спам обнаружен."
        });
    }

    if (!name || name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Введите имя."
        });
    }

    const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;

    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            success: false,
            message: "Введите корректный номер телефона."
        });
    }

    if (comment && comment.length > 500) {
        return res.status(400).json({
            success: false,
            message: "Комментарий слишком длинный."
        });
    }

    const text = `
🔧 Новая запись в сервис

👤 Имя: ${name}
📞 Телефон: ${phone}
💬 Комментарий: ${comment || "Нет"}
`;

    try {

        await axios.post(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
            {
                chat_id: process.env.CHAT_ID,
                text
            }
        );

        res.json({
            success: true,
            message: "Вы успешно записались!"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Ошибка отправки."
        });

    }

});

// запуск сервера
app.listen(PORT, "0.0.0.0",() => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});

