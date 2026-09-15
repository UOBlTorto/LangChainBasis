import { SqliteSaver } from '@langchain/langgraph-checkpoint-sqlite'
import {createAgent} from "langchain";
import { MemorySaver } from "@langchain/langgraph";

import {ChatOpenAI} from "@langchain/openai";
import { config } from "dotenv";
config();

const checkpoint = SqliteSaver.fromConnString('data/memory.sqlite')

const model = new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASEURL
})

const agent = createAgent({
    model:model,
    // 内存记忆
    // checkpointer: new MemorySaver(),
    checkpointer:checkpoint
})
const response = await agent.invoke(
    {
            messages:[{role:'user',content:'我叫远方,喜欢吃腰子'}],
        },
    {
        configurable:{thread_id:'myid'}
    }
    )
const response_Round_Tow = await agent.invoke(
    {
            messages:[{role:'user',content:'我叫什么，喜欢吃什么，擅长什么编程语言'}],
        },
    {
        configurable:{thread_id:'myid'}
    }

    )
console.log(response_Round_Tow.messages.at(-1).content)


