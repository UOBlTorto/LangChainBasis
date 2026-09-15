import {Document} from '@langchain/classic/document'
import {ChatOpenAI, OpenAIEmbeddings} from "@langchain/openai";
import { config } from 'dotenv'
import { readFile } from 'node:fs/promises'
import {createAgent} from 'langchain'

import {RecursiveCharacterTextSplitter} from '@langchain/textsplitters'
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory'

config()

const model = new OpenAIEmbeddings({
    model:process.env.OPENAI_EMBEDDING_MODEL,
    apiKey:process.env.OPENAI_API_KEY,
    baseURL:process.env.OPENAI_BASEURL
})
const markdownfile = await readFile('./document/service-rule.docx','utf-8')
// const doc = [
//     new Document({
//         pageContent:markdownfile,
//     })
// ]
// 上面的代码和上一节的意义一样，都是创建文档对象，上一节是手写，现在是读取文档而已



// 文档清洗
function normalizePlainText(text) {
  return (
    text
      .replace(/\r\n?/g, '\n')
      // 压缩同一行里的连续空格和 tab。
      .replace(/[ \t]+/g, ' ')
      // 三个及以上换行压缩成一个空行。
      .replace(/\n{3,}/g, '\n\n')
      // 删除整段文本首尾的空白字符。
      .trim()
  )
}
const doc = [
    new Document({
        pageContent:normalizePlainText(markdownfile),
    })
]
// 使用 md 预设拆分器  文档切片
const splitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
  // 每一片多长
  chunkSize: 5000,
})

const chunks = await splitter.splitDocuments(doc)

// 入库
const vectorStore = await MemoryVectorStore.fromDocuments(chunks, model)

// 查找 匹配的 相关资料
const question = '我要买iPhone18，流程是什么'
const matchedDocs = await vectorStore.similaritySearch(question, 2)
const content = matchedDocs.map(item=>item.pageContent).join('\n')

// 尽情地调用AI模型
const chatmodel = new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASEURL
})
// const response = await chatmodel.invoke([
//     {role:'user',content:`资料：${content}`},
//     {role:'user',content:question}
// ])
const agent = createAgent({
    model:chatmodel,
})
const response = await agent.invoke({
    messages:[
        {role:'user',content:content},
        {role:'user',content:question}
    ]
})
console.log(response.messages.at(-1).content)