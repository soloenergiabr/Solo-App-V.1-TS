'use client'

import { Download, FileSpreadsheet, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type CsvCell = string | number | null | undefined

const NUMBER = new Intl.NumberFormat('pt-BR', { useGrouping: false, maximumFractionDigits: 4 })

function csvCell(value: CsvCell): string {
    if (value == null) return ''
    if (typeof value === 'number') return Number.isFinite(value) ? NUMBER.format(value) : ''
    // Neutraliza fórmulas (=, +, -, @) para o Excel não executar conteúdo vindo de cadastro.
    const text = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
    return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** CSV para Excel pt-BR: BOM UTF-8, separador `;` e vírgula decimal. */
export function buildCsv(columns: string[], rows: CsvCell[][]): string {
    return '﻿' + [columns, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')
}

export function downloadCsv(filename: string, columns: string[], rows: CsvCell[][]) {
    const blob = new Blob([buildCsv(columns, rows)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}

/** Botão "Exportar" com CSV e PDF (impressão do navegador com o CSS de `@media print`). */
export function ExportMenu({ onCsv, disabled }: { onCsv: () => void; disabled?: boolean }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled} className="print:hidden">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onCsv}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Planilha (CSV)
                </DropdownMenuItem>
                {/* Espera o menu fechar para ele não sair na impressão. */}
                <DropdownMenuItem onSelect={() => setTimeout(() => window.print(), 100)}>
                    <Printer className="mr-2 h-4 w-4" />
                    PDF (imprimir)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
