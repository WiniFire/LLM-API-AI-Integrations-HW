import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

function getImageInlineData(imagePath)
{
  return {
    inlineData: {
      mimeType: "image/jpg",
      data: fs.readFileSync(imagePath, {encoding: "base64"}),
    }
  }
}

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY
});

const objectSchema = {
  type: "object",
  properties: {
    mainObjects: {
      type: "array",
      items: {type: "string"}
    },
    typeOfClothing: {type: "string"},
    clothingColor: {type: "string"},
    forWhatKindOfWeather: {type: "string"},
  },
  required: ["typeOfClothing", "clothingColor", "forWhatKindOfWeather"],
};

const response = await ai.models.generateContent({
  model: "gemini-3.6-flash",
  contents: [
    getImageInlineData('images.jpg'),
    { text: "Describe human clothing on photo"}
  ],
  config: {
    responseMimeType: "application/json",
    responseSchema: objectSchema,
  },
});

const analysis = JSON.parse(response.text);

for (let key in analysis)
{
  console.log(key + ": " + analysis[key])
}