import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

function getMangaAmountChapters(args) {
  const fakeData = {
    "Call Of The Night": 200,
  };

  return fakeData[args.title] || -1;
}

function getMangaGenres(args) {
  const fakeData = {
    "Call Of The Night": "Romantic comedy",
  };

  return fakeData[args.title] || "Unknown";
}

function getMangaMainCharacters(args) {
  const fakeData = {
    "Call Of The Night": ["Nazuna Nanakusa", "Ko Yamori"],
  };

  return fakeData[args.title] || ["Unknown"];
}

const toolDeclarations = [
  {
    name: "getMangaAmountChapters",
    description: "Get the amount of chapters for a given manga name.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The name of the manga.",
        },
      },
      required: ["title"],
    },
  },

  {
    name: "getMangaGenres",
    description: "Get the genres for a given manga name.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The name of the manga.",
        },
      },
      required: ["title"],
    },
  },

  {
    name: "getMangaMainCharacters",
    description: "Get the main characters for a given manga name.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The name of the manga.",
        },
      },
      required: ["title"],
    },
  },
];

const toolHandlers = {
  getMangaAmountChapters,
  getMangaGenres,
  getMangaMainCharacters,
};

const chat = ai.chats.create({
  model: "gemini-3.6-flash",

  config: {
    tools: [
      {
        functionDeclarations: toolDeclarations,
      },
    ],
  },
});

async function askAgent(userMessage) {
  let response = await chat.sendMessage({
    message: userMessage,
  });

  while (response.functionCalls?.length > 0) {
    for (const call of response.functionCalls) {
      console.log(
        `Function call: ${call.name}`,
        call.args
      );

      const handler = toolHandlers[call.name];

      const result = handler(call.args);

      console.log("Function result:", result);

      response = await chat.sendMessage({
        message: [
          {
            functionResponse: {
              name: call.name,
              response: {
                result: result,
              },
            },
          },
        ],
      });
    }
  }

  return response.text;
}

const answer = await askAgent(
  "Скажи сколько глав в тайтле Call Of The Night."
);

console.log("Final answer:", answer);