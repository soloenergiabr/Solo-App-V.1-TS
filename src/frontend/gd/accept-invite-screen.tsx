'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

interface InviteInfo {
    valid: boolean
    reason: string | null
    name: string
    email: string
    titularName: string
    consumerUnitName: string
}

/**
 * Tela publica de aceite do convite. Quem chega aqui ainda nao tem login — o
 * token da URL e a unica credencial.
 */
export function AcceptInviteScreen({ token }: { token: string }) {
    const router = useRouter()
    const [invite, setInvite] = useState<InviteInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [done, setDone] = useState(false)

    useEffect(() => {
        let active = true

        axios
            .get(`/api/gd/invites/accept?token=${encodeURIComponent(token)}`)
            .then((res) => {
                if (!active) return
                setInvite(res.data.data as InviteInfo)
            })
            .catch((err) => {
                if (!active) return
                setLoadError(
                    axios.isAxiosError(err) && err.response?.data?.message
                        ? err.response.data.message
                        : 'Convite nao encontrado.',
                )
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [token])

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setSubmitError(null)

        if (password !== confirmPassword) {
            setSubmitError('As senhas nao conferem.')
            return
        }

        setSubmitting(true)
        try {
            await axios.post('/api/gd/invites/accept', { token, password })
            setDone(true)
            setTimeout(() => router.push('/login'), 2500)
        } catch (err) {
            setSubmitError(
                axios.isAxiosError(err) && err.response?.data?.message
                    ? err.response.data.message
                    : 'Nao foi possivel criar seu acesso.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-24 w-full" />
            </div>
        )
    }

    if (loadError || !invite) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Convite indisponivel</AlertTitle>
                <AlertDescription>{loadError ?? 'Convite nao encontrado.'}</AlertDescription>
            </Alert>
        )
    }

    if (!invite.valid) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Convite indisponivel</AlertTitle>
                <AlertDescription>{invite.reason}</AlertDescription>
            </Alert>
        )
    }

    if (done) {
        return (
            <Alert>
                <AlertTitle className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success" />
                    Acesso criado!
                </AlertTitle>
                <AlertDescription>
                    Redirecionando para o login. Use <strong>{invite.email}</strong> e a senha que
                    voce acabou de criar.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold">Ola, {invite.name}!</h2>
                <p className="text-sm text-muted-foreground">
                    <strong>{invite.titularName}</strong> convidou voce para acompanhar a conta de
                    energia da unidade <strong>{invite.consumerUnitName}</strong>. Crie sua senha
                    para entrar.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="invite-email">E-mail</Label>
                <Input id="invite-email" value={invite.email} disabled readOnly />
            </div>

            <div className="space-y-2">
                <Label htmlFor="invite-password">Crie uma senha</Label>
                <Input
                    id="invite-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">
                    Minimo 8 caracteres, com maiuscula, minuscula e numero.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="invite-confirm">Confirme a senha</Label>
                <Input
                    id="invite-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                />
            </div>

            {submitError && (
                <Alert variant="destructive">
                    <AlertDescription>{submitError}</AlertDescription>
                </Alert>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Criar meu acesso
            </Button>
        </form>
    )
}
