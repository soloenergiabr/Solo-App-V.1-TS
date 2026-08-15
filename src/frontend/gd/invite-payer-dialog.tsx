'use client'

import { useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useInvitePayer } from './hooks/use-gd'

export function InvitePayerDialog({
    consumerUnitId,
    consumerUnitName,
    defaultName,
    defaultEmail,
    clientId,
    trigger,
}: {
    consumerUnitId: string
    consumerUnitName: string
    defaultName?: string | null
    defaultEmail?: string | null
    clientId?: string
    trigger: ReactNode
}) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(defaultName ?? '')
    const [email, setEmail] = useState(defaultEmail ?? '')
    const [error, setError] = useState<string | null>(null)
    const [sentTo, setSentTo] = useState<string | null>(null)

    const invite = useInvitePayer(clientId)

    async function handleSubmit() {
        setError(null)
        try {
            const created = await invite.mutateAsync({ consumerUnitId, name, email })
            setSentTo(created.email)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao enviar o convite')
        }
    }

    function handleOpenChange(next: boolean) {
        setOpen(next)
        if (!next) {
            setSentTo(null)
            setError(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Convidar responsavel</DialogTitle>
                    <DialogDescription>
                        O responsavel por {consumerUnitName} recebe um e-mail para criar o proprio
                        acesso e acompanhar so esta unidade.
                    </DialogDescription>
                </DialogHeader>

                {sentTo ? (
                    <Alert>
                        <AlertDescription>
                            Convite enviado para <strong>{sentTo}</strong>. O link vale por 7 dias.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="payer-name">Nome do responsavel</Label>
                            <Input
                                id="payer-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Maria Souza"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payer-email">E-mail</Label>
                            <Input
                                id="payer-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="maria@email.com"
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {sentTo ? (
                        <Button onClick={() => handleOpenChange(false)}>Fechar</Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => handleOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit} disabled={invite.isPending}>
                                {invite.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                                Enviar convite
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
