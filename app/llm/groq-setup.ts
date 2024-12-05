import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";

// Initialize the chat model
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-70b-versatile",
  temperature: 0
});

// Create a prompt template
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant who remembers all details the user shares with you."],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"]
]);

// Create a chain
const chain = prompt.pipe(model);

// In-memory message history (for demo purposes)
const messageHistories: Record<string, InMemoryChatMessageHistory> = {};

// Create a runnable with message history
const withMessageHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: async (sessionId) => {
    if (messageHistories[sessionId] === undefined) {
      messageHistories[sessionId] = new InMemoryChatMessageHistory();
    }
    return messageHistories[sessionId];
  },
  inputMessagesKey: "input",
  historyMessagesKey: "chat_history",
});

export async function getAIResponse(input: string, sessionId: string) {
  const config = {
    configurable: {
      sessionId: sessionId,
    },
  };

  const response = await withMessageHistory.invoke(
    {
      input: input,
    },
    config
  );

  return response.content;
}

// Optional: Add a streaming function if needed
export async function streamAIResponse(input: string, sessionId: string) {
  const config = {
    configurable: {
      sessionId: sessionId,
    },
  };

  const stream = await withMessageHistory.stream(
    {
      input: input,
    },
    config
  );

  return stream;
}