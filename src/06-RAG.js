import { Document } from '@langchain/classic/document'
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory'
import {ChatOpenAI, OpenAIEmbeddings} from "@langchain/openai";
import { config } from "dotenv";
import { createAgent } from 'langchain';
config()
const model = new OpenAIEmbeddings({
    model: process.env.OPENAI_EMBEDDING_MODEL,
    baseURL: process.env.OPEENAI_BASEURL,
    apiKey: process.env.OPENAI_API_KEY
})

// const vector = await model.embedQuery('我会被转成向量')
// console.log('vector===>',vector)
// 从上面看来 一个向量模型，能调用embedQuery把任何东西，不一定是问题，转换成向量



const docs = [
    new Document({
        pageContent:
            '我老婆喜欢清淡口味，不太能吃辣，不吃香菜，比较喜欢番茄、鸡蛋和虾。',
        metadata: {
            title: '老婆的口味',
        },
    }),
    new Document({
        pageContent:
            '我个人比较喜欢吃辣的，比较喜欢青椒肉丝，辣椒炒肉，我口味比较重',
        metadata: {
            title: '我自己的口味',
        },
    }),
    new Document({
        pageContent:
            '未使用七天内可以退货，已使用七天内出现质量问题可以退货，十五天内可以换货，如果因为用户个人原因损坏，不予退换货',
        metadata: {
            title: '退货/换货流程',
        },
    }),
]
// 把 docs 中的每一条文档交给 embeddings 转成向量，这个内部自己会实现
// 然后存进 MemoryVectorStore，后面就可以做相似度检索
const vectorStore = await MemoryVectorStore.fromDocuments(docs, model)

// 问题
const question = '我从淘宝买的手机摔了一下，不能用了'
// 调用 similaritySearch 方法检索，第一个参数是问题，第二个参数是你要几条，如果传2，则检索到最相近的两条
const matchedDocs = await vectorStore.similaritySearch(question, 2)

// 调用 similaritySearchWithScore 方法检索，参数一致，只不过会返回二维数组，第一个是检索到的文档，第二个是相似度
// const matchedDocs = await vectorStore.similaritySearchWithScore(question, 2)
const context = matchedDocs.map(docItem=>docItem.pageContent).join('\n')


const chatmodel = new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASEURL
})
const agent = createAgent({
    model:chatmodel,
})
const response = await agent.invoke({
    messages: [
        { role: 'user', content: question },
        { role: 'system', content: context }
    ]
})
console.log(response.messages.at(-1).content)