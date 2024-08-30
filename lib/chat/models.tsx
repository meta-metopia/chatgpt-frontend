export enum Provider {
  ChatGPT = 'ChatGPT'
}

export interface Model {
  name: string
  description: string
  deploymentId: string
  resourceName: string
  apiKey: string
}

export type SupportedModel = {
  [key in Provider]: Model[]
}

export const SupportedModels: SupportedModel = {
  [Provider.ChatGPT]: [
    {
      name: 'gpt-4o-mini',
      description:
        "A small model trained on the OpenAI ChatGPT dataset. It's a good starting point for experimenting with chatbots.",
      deploymentId: process.env.AZURE_OPENAI_GPT4O_MINI_API_DEPLOYMENT_ID!,
      resourceName: process.env.AZURE_OPENAI_GPT4O_MINI_API_RESOURCE_NAME!,
      apiKey: process.env.AZURE_OPENAI_GPT4O_MINI_API_KEY!
    },
    {
      name: 'gpt-4o',
      description:
        "The most advanced model trained on the OpenAI ChatGPT dataset. It's a good starting point for experimenting with chatbots.",
      deploymentId: process.env.AZURE_OPENAI_GPT4O_API_DEPLOYMENT_ID!,
      resourceName: process.env.AZURE_OPENAI_GPT4O_API_RESOURCE_NAME!,
      apiKey: process.env.AZURE_OPENAI_GPT4O_API_KEY!
    }
  ]
}

/**
 * Get model by name
 * @param name Model name
 * @returns Provider and Model
 */
export function getModelByName(name?: string): [Provider, Model] {
  for (const provider of Object.keys(SupportedModels) as Provider[]) {
    const model = SupportedModels[provider].find(model => model.name === name)
    if (model) {
      return [provider, model]
    }
  }

  return [Provider.ChatGPT, SupportedModels[Provider.ChatGPT][0]]
}
