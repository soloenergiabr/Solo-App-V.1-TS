'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from './button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-4 w-4" />
            </Button>
        )
    }

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 transition-colors"
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
            {theme === 'dark' ? (
                <Sun className="h-4 w-4 transition-transform hover:rotate-12" />
            ) : (
                <Moon className="h-4 w-4 transition-transform hover:-rotate-12" />
            )}
        </Button>
    )
}
