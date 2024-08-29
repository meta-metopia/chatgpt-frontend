import Link from 'next/link'
import * as React from 'react'

import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { IconNextChat, IconSeparator } from '@/components/ui/icons'
import { UserMenu } from '@/components/user-menu'
import { Session } from '@/lib/types'
import clsx from 'clsx'

import { ChatHistory } from './chat-history'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import {
  Listbox,
  ListboxOption,
  ListboxOptions,
  ListboxButton
} from '@headlessui/react'

async function UserOrLogin() {
  const session = (await auth()) as Session
  return (
    <>
      {session?.user ? (
        <>
          <SidebarMobile>
            <ChatHistory userId={session.user.id} />
          </SidebarMobile>
          <SidebarToggle />
        </>
      ) : (
        <Link href="/new" rel="nofollow">
          <IconNextChat className="size-6 mr-2 dark:hidden" inverted />
          <IconNextChat className="hidden size-6 mr-2 dark:block" />
        </Link>
      )}
      <div className="flex items-center">
        <IconSeparator className="size-6 text-muted-foreground/50" />
        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <Button variant="link" asChild className="-ml-2">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </>
  )
}

export function ModelSelector() {
  return (
    <Listbox value={'gpt-4o-mini'}>
      <ListboxButton
        className={clsx(
          'relative block w-full rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white',
          'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
        )}
      >
        <span className="text-sm text-gray-200">Gpt4o-mini</span>
      </ListboxButton>
      <ListboxOptions
        anchor="bottom"
        transition
        className={clsx(
          'w-52 rounded-xl border border-white/5 bg-background/20 backdrop-blur-md p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none',
          'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 z-50'
        )}
      >
        <ListboxOption
          value="gpt-4o-mini"
          className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
        >
          <span className="text-sm/6 text-white">Gpt4o-mini</span>
        </ListboxOption>
      </ListboxOptions>
    </Listbox>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>

        <Tooltip delayDuration={0}>
          <TooltipTrigger tabIndex={-1}>
            <a className="text-sm rounded-3xl bg-gray-600 px-2 py-1">
              {process.env.VERCEL_GIT_COMMIT_REF}
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{process.env.VERCEL_GIT_COMMIT_MESSAGE}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <ModelSelector />
      </div>
    </header>
  )
}
