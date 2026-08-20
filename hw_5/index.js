import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

const userHistories = new Map();

bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id, "Ужс");
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (!msg.text) return;
  if (msg.text.startsWith("/")) return;

  try
  {
    await bot.sendChatAction(chatId, "typing");
    const history = userHistories.get(chatId);
    history.push({
      role: "user",
      parts: [{ text: msg.text }]
    });
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: history,
      config: {
        systemInstruction: `Ты дружелюбный ии помощник.`
      }
    });
    history.push({
      role: "model",
      parts: [{ text: response.text }]
    });

    usersHistories.set(chatId, history);

    await bot.sendMessage(chatId, 
      response.text
    )
  }
  catch (error)
  {
    console.log(error);
    await bot.sendMessage(chatId, "Ошибка");
  }
});

bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;
  try
  {
    await bot.sendChatAction(chatId, "typing");
    const photo = msg.photo[msg.photo.length - 1];
    const fileId = photo.file_id;
    const fileLink = await bot.getFileLink(fileId);
    const response = await fetch(fileLink);
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64image = buffer.toString("base64");

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64image,
          }
        },
        {
          text: "Опиши одежду людей на фото"
        }
      ]
    });
    await bot.sendMessage(chatId, aiResponse.text);
  }
  catch (error)
  {
    console.log(error);
    await bot.sendMessage(chatId, "Ошибка");
  }
});