'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { apiErrorMessage, useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi'

type NotificationItem = {
    id: string
    title: string
    body: string
    link: string | null
    readAt: string | null
    createdAt: string
}

const QUERY_KEY = ['notifications']

function timeAgo(iso: string): string {
    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
    if (minutes < 1) return 'agora'
    if (minutes < 60) return `há ${minutes} min`
    const hours = Math.round(minutes / 60)
    if (hours < 24) return `há ${hours} h`
    return new Date(iso).toLocaleDateString('pt-BR')
}

export function NotificationBell() {
    const api = useAuthenticatedApi()
    const router = useRouter()
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: QUERY_KEY,
        queryFn: async () =>
            (await api.get<{ data: { items: NotificationItem[]; unread: number } }>('/notifications')).data.data,
        enabled: api.isAuthenticated,
        refetchInterval: 2 * 60 * 1000,
    })

    const markRead = useMutation({
        mutationFn: (id?: string) => api.patch('/notifications/read', id ? { id } : {}),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
        onError: (error) => toast.error(apiErrorMessage(error, 'Não foi possível marcar como lida.')),
    })

    const items = query.data?.items ?? []
    const unread = query.data?.unread ?? 0

    const open = (item: NotificationItem) => {
        if (!item.readAt) markRead.mutate(item.id)
        if (item.link) router.push(item.link)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                    aria-label={unread ? `Notificações (${unread} não lidas)` : 'Notificações'}
                    title="Notificações"
                >
                    <Bell className="h-4 w-4" />
                    {unread > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" collisionPadding={8} className="w-[min(20rem,calc(100vw-1rem))] p-0">
                <div className="flex items-center justify-between px-3 py-2">
                    <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>
                    {unread > 0 && (
                        <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                            onClick={() => markRead.mutate(undefined)}
                        >
                            Marcar todas como lidas
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator className="m-0" />
                <div className="max-h-96 overflow-y-auto">
                    {query.isLoading ? (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">Carregando…</p>
                    ) : items.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhuma notificação por enquanto.</p>
                    ) : (
                        items.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                onSelect={() => open(item)}
                                className="flex cursor-pointer flex-col items-start gap-1 rounded-none border-b px-3 py-2 last:border-b-0"
                            >
                                <div className="flex w-full items-start gap-2">
                                    {!item.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Não lida" />}
                                    <span className={`flex-1 text-sm ${item.readAt ? 'text-muted-foreground' : 'font-medium'}`}>{item.title}</span>
                                    <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(item.createdAt)}</span>
                                </div>
                                <p className="line-clamp-3 whitespace-pre-line text-xs text-muted-foreground">{item.body}</p>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
