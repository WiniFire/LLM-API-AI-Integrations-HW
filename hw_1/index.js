import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY
});

const chat = ai.chats.create({
  model: "gemini-3.6-flash",
  config: {
    systemInstruction: "Говори на русском.",
  }
})

const rl = readline.createInterface({ input: stdin, output: stdout });
console.log("Чат начат! Введите 'exit' для выхода.");
while (true)
{
  const userInput = await rl.question("Вы: ");
  if (userInput.toLowerCase() === "exit") {
    break;
  }
  const response = await chat.sendMessage({
    message: userInput
  });
  console.log("AI:", response.text);
}

rl.close();