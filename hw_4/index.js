import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
})

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

const userHistories = new Map();

bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(
    msg.chat.id,
    "Ужс"
  )
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (msg.text.startsWith("/"))
  {
    return;
  }
  try {
    await bot.sendChatAction(chatId, "typing");
    const history = userHistories.get(chatId) || [];
    history.push({
      role: "user",
      parts: [{ text: msg.text }],
    });
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: history,
      config: {
        systemInstruction: "Ты преподователь програмирования в университете. Отвечай короткими и понятными предложениями."
      }
    });
    
    history.push({
      role: "model",
      parts: [{ text: response.text }]
    });

    await bot.sendMessage(chatId, response.text);

    userHistories.set(chatId, history);
  }
  catch (error)
  {
    console.error("Помылка: ", error);
    await bot.sendMessage(
      chatId,
      "Ошибка"
    );
  }
});

console.log("Бот запущен");