import {ChatOpenAI} from "@langchain/openai";
import {AIMessage, HumanMessage, ToolMessage} from "@langchain/core/messages";
import {tool} from 'langchain/tools'
import {z} from 'zod'
import { config} from "dotenv";
config()

const model = new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    apiKey: process.env.OPENAI_API_KEY,
    configuration: {
        baseURL: process.env.OPENAI_BASE_URL
    }
})

// region
// 定义工具
// 推荐用 z.object，而不是 z.string()
const stockTool = tool(
    ({ nation }) => {
        // 真实场景：这里调行情 API
        return `今天${nation}的美股股票行情很好`;
    },
    {
        name: "stock_market_info",
        description: "用来查询指定地区/国家的美股行情",
        schema: z.object({
            nation: z.string().describe("地区或国家名称，例如：美国、极阴岛"),
        }),
    }
);
// 把工具绑到模型上
const modelWithTools = model.bindTools([stockTool])
// end

// 用户问题
const message = []
message.push(new HumanMessage('今天的极阴岛的美股股票行情怎么样？'))

// 第一步：让模型决定是否调工具
const aiMessage = await modelWithTools.invoke(message)
// 把模型的回复（可能带 tool_calls）存进历史
message.push(aiMessage)

// 如果模型要求调工具
if(aiMessage.tool_calls&&aiMessage.tool_calls.length>0){
    for(const toolCall of aiMessage.tool_calls){
        // 执行工具（推荐传 args）
        const toolOutput = await stockTool.invoke(toolCall.args);
        // ⚠️ tool_call_id 必须和模型返回的 id 对应
        message.push(
            new ToolMessage({
                content: toolOutput,
                tool_call_id: toolCall.id,
                name: toolCall.name,
            })
        )
    }
}

// 第二步：把「用户问题 + 模型调工具 + 工具结果」一起发给模型
const finalResponse = await modelWithTools.invoke(message);
console.log(finalResponse)