import { END, START, StateGraph, StateSchema } from '@langchain/langgraph'
import { z } from 'zod/v4'
import { writeFile } from 'node:fs/promises'

const State = new StateSchema({
    price: z.number(),
    approved: z.boolean(),
    result: z.string(),
})

// 检查购买条件，并把审批结果写入 State。
function reviewRequest(state) {
    return {
        // 500 块钱以内我可以给你买哦
        approved: state.price <= 500,
    }
}

// 条件 Edge 调用这个函数选择下一个 Node。
function chooseNext(state) {
    return state.approved ? 'place_order' : 'reject_request'
}

function placeOrder(state) {
    return {
        result: `申请通过，老婆给我买了这把 ${state.price} 元的新键盘。`,
    }
}

function rejectRequest() {
    return {
        result: '买个鸡毛键盘，还不如给我买个丝袜呢',
    }
}

const builder = new StateGraph(State)

// 添加节点
builder.addNode('review_request', reviewRequest)
builder.addNode('place_order', placeOrder)
builder.addNode('reject_request', rejectRequest)

// 添加边
// 先检查这次购买申请。
builder.addEdge(START, 'review_request')
// 根据 approved 选择其中一个分支
builder.addConditionalEdges('review_request', chooseNext, [
    'place_order',
    'reject_request',
])
builder.addEdge('place_order', END)
builder.addEdge('reject_request', END)

const graph = builder.compile()

const result = await graph.invoke({
    price: 3399,
})

console.log(result.result)
