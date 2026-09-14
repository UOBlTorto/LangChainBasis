import { ChatOpenAI } from "@langchain/openai";
import { config } from "dotenv";
import { createAgent, summarizationMiddleware } from "langchain";
config();

const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEl,
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

// const response = await model.invoke("Hello world!")
// Multi-turn editing 不再用一个问答，假设进行了多轮问答
const messages = [
  {
    role: "user",
    content:
      "我叫远方，准备去上海旅游，预算是 5000 元，不喜欢赶行程，酒店最好在地铁站附近。",
  },
  {
    role: "assistant",
    content: "好的，我记住了你的旅行要求。",
  },
  {
    role: "user",
    content: "我准备玩三天。",
  },
  {
    role: "assistant",
    content: "好的，我会按照三天安排。",
  },
  {
    role: "user",
    content: "第一天想去外滩。",
  },
  {
    role: "assistant",
    content: "没问题，第一天可以安排外滩。",
  },
  {
    role: "user",
    content: "请根据我前面说的要求，帮我安排这次旅行。",
  },
];
const agent = createAgent({
  model: model,
  middleware: [
    summarizationMiddleware({
      // 使用哪个模型生成摘要，注意这里摘要部分，可以使用低级模型，前面讲过了
      model: model,
      // 消息达到 6 条以后生成摘要
      trigger: { messages: 6 },
      // 最近 2 条消息继续保留原文
      keep: { messages: 2 },
      // 告诉摘要模型需要保留哪些重要信息
      // {messages} 会被 LangChain 替换成需要摘要的历史消息
      summaryPrompt: `
        请用中文总结下面的旅游对话。
        重点保留用户的姓名、预算、目的地、旅行偏好和旅行天数。
        只输出摘要，不要添加对话中没有的信息。

        {messages}
      `,
      // 摘要的前缀
      summaryPrefix: "前面对话摘要：",
    }),
  ],
});

const response = await agent.invoke({messages})
console.log(response);
