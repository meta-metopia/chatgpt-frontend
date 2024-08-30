import Link from 'next/link'
import * as React from 'react'

import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { IconNextChat, IconSeparator } from '@/components/ui/icons'
import { UserMenu } from '@/components/user-menu'
import { Session } from '@/lib/types'

import { headers } from 'next/headers'
import { ChatHistory } from './chat-history'
import HeaderModelSelector from './header-model-selector'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { getModelForChat } from '@/app/(chat)/actions'

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

export async function ModelSelector() {
  const urlString = headers().get('x-url')
  const url = new URL(urlString!)
  const id = url.pathname.split('/')[2]
  const currentModel = await getModelForChat(id)

  if ('error' in currentModel) {
    return (
      <div>
        <span className="text-sm/6 dark:text-white">Error loading model</span>
      </div>
    )
  }

  return <HeaderModelSelector currentModel={currentModel.name} chatId={id} />
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
            <a className="text-sm rounded-3xl dark:bg-gray-600 bg-gray-200 px-2 py-1">
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
