"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyPixButton({
    code,
    label = "Copiar PIX",
    className,
}: {
    code: string
    label?: string
    className?: string
}) {
    const [copied, setCopied] = useState(false)

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard can be unavailable in insecure contexts.
        }
    }

    return (
        <Button
            type="button"
            variant={copied ? "secondary" : "default"}
            onClick={handleCopy}
            aria-label={label}
            className={cn(className)}
        >
            {copied ? (
                <>
                    <Check className="size-4" /> Copiado
                </>
            ) : (
                <>
                    <Copy className="size-4" /> {label}
                </>
            )}
        </Button>
    )
}
