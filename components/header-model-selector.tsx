'use client'

import {
  getModelForChat,
  getModelName,
  updateModelForChat
} from '@/app/(chat)/actions'
import { Model, SupportedModels } from '@/lib/chat/models'
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption
} from '@headlessui/react'
import clsx from 'clsx'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'

interface Props {
  currentModel: string
  chatId: string
}

export default function HeaderModelSelector({
  chatId,
  currentModel: defaultModel
}: Props) {
  const [currentModel, setCurrentModel] = React.useState(defaultModel)
  const id = useParams().id

  React.useEffect(() => {
    async function loadModel() {
      const model = await getModelName(id as string)
      if (typeof model === 'string') setCurrentModel(model)
      if (typeof model === 'object') alert(model.error.message)
    }

    loadModel()
  }, [id])

  return (
    <Listbox
      value={currentModel}
      onChange={async value => {
        await updateModelForChat(id as string, value)
        setCurrentModel(value)
      }}
    >
      <ListboxButton
        className={clsx(
          'relative block w-full rounded-lg dark:bg-white/5 bg-black/5 py-1.5 pr-8 pl-3 text-left text-sm/6 dark:text-white text-black',
          'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
        )}
      >
        <span className="text-sm font-semibold">{currentModel}</span>
      </ListboxButton>
      <ListboxOptions
        anchor={{
          gap: 4,
          to: 'bottom end'
        }}
        transition
        className={clsx(
          'w-80 rounded-xl border dark:border-white/5 border-black/5 bg-background/20 backdrop-blur-md p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none',
          'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 z-50 right-20'
        )}
      >
        {Object.entries(SupportedModels).map(([provider, models]) => (
          <>
            <span className="text-sm/6 dark:text-white ml-2">{provider}</span>
            <hr className="border-t dark:border-white/10 my-1 border-black/10" />
            {models.map(model => (
              <ListboxOption
                key={model.name}
                value={model.name}
                className="group flex items-start gap-2 rounded-lg py-1.5 px-3 select-none flex-col justify-start cursor-pointer hover:dark:bg-white/5 hover:bg-black/5 my-2 data-[selected]:bg-secondary"
              >
                <span className="text-sm/6 dark:text-white">{model.name}</span>
                <span className="text-xs/6 dark:text-gray-200">
                  {model.description}
                </span>
              </ListboxOption>
            ))}
          </>
        ))}
      </ListboxOptions>
    </Listbox>
  )
}
