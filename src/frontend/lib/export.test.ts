import { describe, it, expect } from 'vitest'
import { buildCsv } from './export'

describe('buildCsv', () => {
    it('gera CSV pt-BR com BOM, ponto e vírgula e vírgula decimal', () => {
        const csv = buildCsv(['Data', 'Energia (kWh)'], [['10/11/2026', 12.5], ['11/11/2026', 1234.56789]])
        expect(csv.startsWith('﻿')).toBe(true)
        expect(csv.slice(1).split('\r\n')).toEqual([
            'Data;Energia (kWh)',
            '10/11/2026;12,5',
            '11/11/2026;1234,5679',
        ])
    })

    it('escapa aspas, separadores e neutraliza fórmulas', () => {
        const csv = buildCsv(['Nome'], [['Silva; "Zé"'], ['=HYPERLINK("x")'], [null], [Number.NaN]])
        expect(csv.slice(1).split('\r\n')).toEqual([
            'Nome',
            '"Silva; ""Zé"""',
            `"'=HYPERLINK(""x"")"`,
            '',
            '',
        ])
    })
})
