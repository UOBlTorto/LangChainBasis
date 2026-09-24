import {input} from "@inquirer/prompts";
import {ChatOpenAI} from "@langchain/openai";
import { config } from 'dotenv'
config()

// console.log(process.env.OPENAI_API_KEY)
// console.log(`Hello ${process.env.OPENAI_API_KEY}`)
const model = new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    apiKey: process.env.OPENAI_API_KEY,
    baseURL:process.env.OPENAI_BASE_URL
});

console.log('model==>',model)
const question = await input({ message: 'Enter your question' });

// const response = await model.invoke(new HumanMessage("Hello world!"));
const response = await model.invoke(question)

console.log(response)