import { ChatOpenAI } from "@langchain/openai";
import { config } from "dotenv";
import {z} from 'zod'
config();

const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEL,
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

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

// 结构化模型
const outputSchema = z.object({
  time:z.string().describe('旅游几天?'),
  city:z.string().describe('旅游的城市'),
  who:z.string().describe('谁去路由')
})
const structuredModel = model.withStructuredOutput(outputSchema)
const response = await structuredModel.invoke([
  {
    role:'system',
    content:JSON.stringify(messages)
  },{
    role:'user',
    content:'从上下文提取信息，返回结果'
  }
])
console.log(response)
