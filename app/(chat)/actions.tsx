'use server'
import { auth } from '@/auth'
import { getModelByName, Model } from '@/lib/chat/models'
import { Chat } from '@/lib/types'
import { addGlobalState, getChat, getGlobalState, saveChat } from '../actions'

export async function updateModelForChat(
  chatId: string | undefined,
  model: string
) {
  const session = await auth()
  const userId = session?.user?.id
  console.log('updateModelForChat', chatId, model)

  if (!chatId) {
    // use global
    await addGlobalState('model', model)
    return
  }

  const chat = await getChat(chatId, userId!)
  if (chat?.error) {
    return {
      error: chat.error
    }
  }

  if (!chat) {
    throw new Error('Chat not found')
  }

  ;(chat! as Chat).model = model
  await saveChat(chat! as Chat)
}

export async function getModelForChat(
  chatId?: string
): Promise<Model | { error: Error }> {
  const session = await auth()
  const userId = session?.user?.id

  if (!chatId) {
    // use global
    const globalModel = await getGlobalState('model')

    return getModelByName(globalModel as string)[1]
  }

  const chat = await getChat(chatId, userId!)
  if (chat?.error) {
    return {
      error: chat.error
    }
  }

  return getModelByName((chat as Chat)?.model)[1]
}

/**
 * Safely get current model by chatID without exposing secrets to client
 * @param chatId Chat ID
 * @returns Model without secrets
 */
export async function getModelName(
  chatId?: string
): Promise<string | { error: Error }> {
  const session = await auth()
  const userId = session?.user?.id

  if (!chatId) {
    // use global
    const globalModel = await getGlobalState('model')

    return getModelByName(globalModel as string)[1].name
  }

  const chat = await getChat(chatId, userId!)
  if (chat?.error) {
    return {
      error: chat.error
    }
  }

  return getModelByName((chat as Chat)?.model)[1].name
}
