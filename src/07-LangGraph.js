import {START, END, StateGraph, StateSchema, writer} from '@langchain/langgraph'
import {z} from "zod";
import { writeFile } from 'node:fs/promises'

const state = new StateSchema({
    input: z.number().default(0),
    value: z.number(),
    result: z.string()
})

function node1(state){
    return {
        value:state.input+1
    }
}
function node2(state){
    return {
        value:state.input*10
    }
}

const builder = new StateGraph(state)
    .addNode('node1',node1)
    .addNode('node2',node2)
    .addEdge(START,"node1")
    .addEdge("node1","node2")
    .addEdge("node2",END)
const graph = builder.compile()
const drawableGraph = await graph.getGraphAsync()

// 生成png
// const image = await drawableGraph.drawMermaidPng()
// const imageBuffer = new Uint8Array(await image.arrayBuffer())
// await writeFile('graph.png',imageBuffer)

// 执行这个图
const result = await graph.invoke({
    input: 3,
    value: 11
})
console.log(result)


