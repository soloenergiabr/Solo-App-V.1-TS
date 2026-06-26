'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'

interface UnitOption {
    id: string
    name: string | null
    clientNumber: string | null
}

interface AnalyzeBillDialogProps {
    onSuccess?: () => void
}

export function AnalyzeBillDialog({ onSuccess }: AnalyzeBillDialogProps) {
    const router = useRouter()
    const api = useAuthenticatedApi()
    const [open, setOpen] = useState(false)
    const [units, setUnits] = useState<UnitOption[]>([])
    const [loadingUnits, setLoadingUnits] = useState(false)
    const [selectedUnitId, setSelectedUnitId] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const canSubmit = selectedUnitId.length > 0 && selectedFile !== null && !isProcessing

    const handleOpenChange = (nextOpen: boolean) => {
        if (isProcessing) return // don't close while processing
        setOpen(nextOpen)
        if (!nextOpen) {
            // Reset state on close
            setSelectedUnitId('')
            setSelectedFile(null)
            setError(null)
        }
    }

    const handleOpen = () => {
        setOpen(true)
        setError(null)
        setSelectedUnitId('')
        setSelectedFile(null)
        setIsProcessing(false)

        // Fetch consumer units
        if (!api.isAuthenticated) return
        setLoadingUnits(true)
        api.get('/client/consumer-units')
            .then((res) => {
                if (res.data.success) {
                    setUnits(
                        res.data.data.map((u: any) => ({
                            id: u.id,
                            name: u.name,
                            clientNumber: u.clientNumber,
                        })),
                    )
                }
            })
            .catch(() => toast.error('Erro ao carregar unidades consumidoras'))
            .finally(() => setLoadingUnits(false))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setSelectedFile(file)
        setError(null)
    }

    const handleSubmit = async () => {
        if (!canSubmit) return

        setIsProcessing(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile!)
            formData.append('consumerUnitId', selectedUnitId)

            const response = await api.axiosInstance.post(
                '/client/energy-bills/upload',
                formData,
            )

            const body = response.data
            if (body.success && body.data?.id) {
                toast.success('Análise concluída!')
                setOpen(false)
                onSuccess?.()
                router.push('/economia/' + body.data.id)
            } else {
                setError(body.message || 'Erro ao processar a conta. Tente novamente.')
            }
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                err.message ||
                'Erro ao enviar a conta. Verifique o arquivo e tente novamente.'
            setError(message)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm" onClick={handleOpen}>
                    <Upload className="mr-2 h-4 w-4" />
                    Analisar conta (PDF)
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Analisar conta de energia</DialogTitle>
                    <DialogDescription>
                        Envie o PDF ou a foto da sua conta de luz. Nossa IA extrai os dados e gera a
                        análise completa.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* UC Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Unidade consumidora
                        </label>
                        <Select
                            value={selectedUnitId}
                            onValueChange={(v) => {
                                setSelectedUnitId(v)
                                setError(null)
                            }}
                            disabled={loadingUnits || isProcessing}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        loadingUnits
                                            ? 'Carregando...'
                                            : 'Selecione a unidade'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.name || u.clientNumber || u.id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* File input */}
                    <div className="space-y-2">
                        <label htmlFor="bill-file" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Arquivo da conta (PDF ou imagem)
                        </label>
                        <input
                            id="bill-file"
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf,image/*"
                            onChange={handleFileChange}
                            disabled={isProcessing}
                            className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {selectedFile && (
                            <p className="text-xs text-muted-foreground">
                                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                            </p>
                        )}
                    </div>

                    {/* Processing state */}
                    {isProcessing && (
                        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <div>
                                <p className="text-sm font-medium">
                                    Analisando sua conta com IA…
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    isso pode levar alguns segundos.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error state */}
                    {error && !isProcessing && (
                        <Alert variant="destructive">
                            <AlertTitle>Erro na análise</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isProcessing}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analisando…
                            </>
                        ) : (
                            'Analisar conta'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
