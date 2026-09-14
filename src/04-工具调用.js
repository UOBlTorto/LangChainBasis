import { ChatOpenAI } from "@langchain/openai";
import { config } from "dotenv";
import { tool } from "langchain/tools";
import { z } from "zod";
import {createAgent} from "langchain";

config();

const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEL,
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

// 做一个可以返回历史对话的工具
function getHistoryMessages(time) {
  return `时间是 ${time}，我和你有过以下对话：
用户：我叫远方，准备去上海旅游，预算是 5000 元，不喜欢赶行程，酒店最好在地铁站附近。
助手：好的，我记住了你的旅行要求。
用户：我准备玩三天。
助手：好的，我会按照三天安排。
用户：第一天想去外滩。
助手：没问题，第一天可以安排外滩。
用户：请根据我前面说的要求，帮我安排这次旅行。`;
}
const getHistoryMessagesTool = tool(async ({ time }) => getHistoryMessages(time), {
  name: 'getHistoryMessages',
  description: '获取指定时间的历史对话',
  schema: z.object({
    time: z.string().describe('时间'),
  }),
})

const agent = createAgent({
  model: model,
  tools: [getHistoryMessagesTool],
  systemPrompt:
      "你没有任何记忆。任何关于历史对话的问题，都必须先调用 getHistoryMessages 工具。"
});
// 你一问xx时间和你谈论过旅游什么吗？他就找找工具
const response = await agent.invoke({
  messages:[
    {
      role:'user',
      content:'我想查一下10分钟前的历史对话的问题'
    }
  ]
})
console.log(response)



