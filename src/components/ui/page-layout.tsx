'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'

interface PageLayoutProps {
    children: ReactNode
    header?: ReactNode
    footer?: ReactNode
    className?: string
    tabs?: PageLayoutTab[]
}

interface PageLayoutTab {
    label: string
    href: string
}

// Variantes de animação para o container
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
            staggerChildren: 0.1,
        },
    },
}

// Variantes para o header
const headerVariants = {
    hidden: { opacity: 0, y: -20, x: 0 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
}



// Variantes para o conteúdo
const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
}

const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
}

export function PageLayout({ children, header, footer, tabs, className = '' }: PageLayoutProps) {
    const pathname = usePathname()

    const isActive = (href: string) => pathname === href

    return (
        <motion.div
            className={`flex flex-col h-full bg-background ${className} overflow-hidden`}
            variants={containerVariants as any}
            initial="hidden"
            animate="visible"
        >

            {header && (
                <motion.div
                    className="bg-background border-b border-border px-4 py-4 sticky top-0 z-10"
                    variants={headerVariants as any}
                >
                    {header}
                </motion.div>
            )}
            {
                tabs && (
                    <motion.div
                        className='flex flex-row bg-background border-b'
                        variants={headerVariants as any}
                    >
                        {
                            tabs.map((tab) => (
                                <Link
                                    key={`tab-${tab.href}`}
                                    href={tab.href}
                                    className={
                                        'px-3 py-2 -mb-px border-b-2 text-sm transition-all duration-300 ' +
                                        (isActive(tab.href)
                                            ? 'border-primary text-primary font-medium'
                                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border')
                                    }
                                >
                                    {tab.label}
                                </Link>
                            ))
                        }
                    </motion.div>
                )
            }


            <motion.div
                className="flex-1 overflow-auto h-full p-4"
                variants={contentVariants as any}
            >
                {children}
            </motion.div>
            {footer && (
                <motion.div
                    className="bg-background border-t border-border px-4 py-4 sticky bottom-0 z-10"
                    variants={footerVariants as any}
                >
                    {footer}
                </motion.div>
            )}
        </motion.div>
    )
}

interface PageHeaderProps {
    title: string
    subtitle?: string
    actions?: ReactNode
    extra?: ReactNode
}

// Variantes para o PageHeader
const pageHeaderVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    },
}

const titleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
}

const actionsVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
}

export function PageHeader({ title, subtitle, actions, extra }: PageHeaderProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={pageHeaderVariants as any}
        >
            <div className="flex items-center justify-between">
                <motion.div variants={titleVariants as any}>
                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </motion.div>
                {actions && (
                    <motion.div
                        className="flex items-center gap-2"
                        variants={actionsVariants as any}
                    >
                        {actions}
                    </motion.div>
                )}
                <ThemeToggle />
            </div>
            {extra && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    {extra}
                </motion.div>
            )}
        </motion.div>
    )
}



interface PageEmptyProps {
    icon?: ReactNode
    title: string
    description?: string
    action?: ReactNode
}

// Variantes para o PageEmpty
const emptyVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
            staggerChildren: 0.1,
        },
    },
}

const emptyIconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
        },
    },
}

const emptyTextVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
}

export function PageEmpty({ icon, title, description, action }: PageEmptyProps) {
    return (
        <motion.div
            className="flex flex-col items-center justify-center py-16 px-4 min-h-[400px]"
            variants={emptyVariants as any}
            initial="hidden"
            animate="visible"
        >
            {icon && (
                <motion.div
                    className="bg-muted rounded-full p-6 mb-4"
                    variants={emptyIconVariants as any}
                >
                    {icon}
                </motion.div>
            )}
            <motion.h3
                className="text-lg font-semibold text-foreground mb-2 text-center"
                variants={emptyTextVariants as any}
            >
                {title}
            </motion.h3>
            {description && (
                <motion.p
                    className="text-sm text-muted-foreground text-center max-w-sm mb-4"
                    variants={emptyTextVariants as any}
                >
                    {description}
                </motion.p>
            )}
            {action && (
                <motion.div
                    className="mt-2"
                    variants={emptyTextVariants as any}
                >
                    {action}
                </motion.div>
            )}
        </motion.div>
    )
}
