'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { toast } from 'sonner';
import { Loader2, Upload, FileText, CheckCircle2 } from 'lucide-react';

interface ImportConsumptionDialogProps {
    clientId: string;
    onSuccess: () => void;
}

export function ImportConsumptionDialog({ clientId, onSuccess }: ImportConsumptionDialogProps) {
    const [open, setOpen] = useState(false);
    const api = useAuthenticatedApi();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf') {
                setSelectedFile(file);
            } else {
                toast.error('Por favor, selecione um arquivo PDF válido.');
                e.target.value = ''; // reset
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Wait a little bit for realistic UI feedback
            const startTime = Date.now();
            
            const response = await api.post(`/admin/clients/${clientId}/consumption/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // optional timeout if extraction is slow
                timeout: 30000, 
            });

            const duration = Date.now() - startTime;
            if (duration < 1500) await new Promise(r => setTimeout(r, 1500 - duration));

            if (response.data.success) {
                toast.success('Fatura processada e importada com sucesso!');
                setOpen(false);
                setSelectedFile(null);
                onSuccess();
            } else {
                toast.error(response.data.message || 'Erro ao processar a fatura.');
            }
        } catch (error: any) {
            console.error('OCR Upload Error:', error);
            const msg = error.response?.data?.message || 'Falha na comunicação com a IA ou formato ilegível.';
            toast.error(msg);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!isUploading) {
                setOpen(val);
                if (!val) setSelectedFile(null);
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Importar Fatura (PDF)
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Importar Fatura com IA</DialogTitle>
                    <DialogDescription>
                        Faça upload da fatura em PDF da Enel. Nossa Inteligência Artificial (Gemini) extrairá automaticamente os dados de consumo.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/20">
                    {!selectedFile ? (
                        <>
                            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                            <p className="text-sm text-center text-muted-foreground mb-4">
                                Arraste o arquivo ou clique no botão abaixo.
                            </p>
                            <div className="relative">
                                <Button variant="outline">Escolher Arquivo</Button>
                                <input 
                                    type="file" 
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center w-full">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                            <p className="font-medium text-center truncate max-w-full px-4 mb-1">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">
                                {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                            
                            {isUploading ? (
                                <div className="flex flex-col items-center w-full gap-2">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground animate-pulse text-center">
                                        Analisando documento com Inteligência Artificial...<br/>Isso pode levar alguns segundos.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                                        Trocar
                                    </Button>
                                    <Button size="sm" onClick={handleUpload}>
                                        Processar Arquivo
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
