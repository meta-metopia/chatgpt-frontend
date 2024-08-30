import 'server-only'

import {
  createAI,
  createStreamableValue,
  getAIState,
  getMutableAIState,
  streamUI
} from 'ai/rsc'

import { BotCard, BotMessage, Purchase, Stock } from '@/components/stocks'

import { getModelForChat, updateModelForChat } from '@/app/(chat)/actions'
import { saveChat } from '@/app/actions'
import { auth } from '@/auth'
import { Events } from '@/components/stocks/events'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Stocks } from '@/components/stocks/stocks'
import { Chat, Message } from '@/lib/types'
import { nanoid } from '@/lib/utils'
import { createAzure } from '@ai-sdk/azure'
import { Model } from './models'

async function submitUserMessage(content: string) {
  'use server'
  // get user session
  const session = await auth()

  if (!session?.user) {
    return {
      id: nanoid(),
      display: (
        <UserMessage>
          Sorry, you need to be logged in to chat with me.
        </UserMessage>
      )
    }
  }

  const aiState = getMutableAIState<typeof AI>()
  // if there is no previous chat, get a new model from global state
  const model = await getModelForChat(
    aiState.get().messages.length === 0 ? undefined : aiState.get().chatId
  )
  let isFirstMessage = false
  if (aiState.get().messages.length === 0) {
    isFirstMessage = true
  }

  if ('error' in model) {
    return {
      id: nanoid(),
      display: <BotMessage content={model.error.message} />
    }
  }

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const azure = createAzure({
    resourceName: model.resourceName,
    apiKey: model.apiKey
  })
  const result = await streamUI({
    model: azure(model.deploymentId),
    initial: <SpinnerMessage />,
    system: `\
    You are a helpful assistant`,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    }
  })

  if (isFirstMessage) {
    console.log('update model for chat', aiState.get().chatId, model.name)
    await updateModelForChat(aiState.get().chatId, model.name)
  }
  return {
    id: nanoid(),
    display: result.value
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            return tool.toolName === 'listStocks' ? (
              <BotCard>
                {/* TODO: Infer types based on the tool result*/}
                {/* @ts-expect-error */}
                <Stocks props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showStockPrice' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Stock props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showStockPurchase' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Purchase props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'getEvents' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Events props={tool.result} />
              </BotCard>
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}
