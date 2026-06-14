import { cn } from "@/lib/utils"

export function LiveBadge({
    label = "ao vivo",
    className,
}: {
    label?: string
    className?: string
}) {
    return (
        <span
            data-slot="live-badge"
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary",
                className,
            )}
        >
            <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            {label}
        </span>
    )
}
