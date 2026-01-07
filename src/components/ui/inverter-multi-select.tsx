'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useInverters, Inverter } from '@/frontend/generation/hooks/useInverters'

export interface InverterMultiSelectProps {
    selectedIds: string[]
    onSelectionChange: (ids: string[]) => void
    placeholder?: string
    className?: string
}

export function InverterMultiSelect({
    selectedIds,
    onSelectionChange,
    placeholder = 'Selecionar inversores...',
    className,
}: InverterMultiSelectProps) {
    const { inverters, isLoading } = useInverters()
    const [open, setOpen] = useState(false)

    const selectedInverters = inverters.filter(inv => selectedIds.includes(inv.id))

    const toggleInverter = (inverterId: string) => {
        if (selectedIds.includes(inverterId)) {
            onSelectionChange(selectedIds.filter(id => id !== inverterId))
        } else {
            onSelectionChange([...selectedIds, inverterId])
        }
    }

    const clearSelection = () => {
        onSelectionChange([])
    }

    const selectAll = () => {
        onSelectionChange(inverters.map(inv => inv.id))
    }

    const getInverterLabel = (inverter: Inverter) => {
        return `${inverter.provider} - ${inverter.providerId}`
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('justify-between min-w-[200px]', className)}
                    disabled={isLoading}
                >
                    <div className="flex items-center gap-2 flex-1 overflow-hidden">
                        <Zap className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {selectedInverters.length === 0 ? (
                            <span className="text-muted-foreground truncate">
                                {isLoading ? 'Carregando...' : placeholder}
                            </span>
                        ) : selectedInverters.length === inverters.length ? (
                            <span className="truncate">Todos os inversores</span>
                        ) : (
                            <span className="truncate">
                                {selectedInverters.length} inversor{selectedInverters.length > 1 ? 'es' : ''} selecionado{selectedInverters.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar inversor..." />
                    <CommandList>
                        <CommandEmpty>Nenhum inversor encontrado.</CommandEmpty>
                        <CommandGroup>
                            {/* Quick actions */}
                            <div className="flex gap-2 p-2 border-b">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={selectAll}
                                    className="flex-1 text-xs"
                                >
                                    Selecionar todos
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSelection}
                                    className="flex-1 text-xs"
                                    disabled={selectedIds.length === 0}
                                >
                                    Limpar
                                </Button>
                            </div>
                            {inverters.map((inverter) => (
                                <CommandItem
                                    key={inverter.id}
                                    value={getInverterLabel(inverter)}
                                    onSelect={() => toggleInverter(inverter.id)}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            selectedIds.includes(inverter.id) ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{inverter.provider}</span>
                                        <span className="text-xs text-muted-foreground">
                                            ID: {inverter.providerId}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
