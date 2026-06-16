import { cn } from "@/lib/utils"

export function BrandLogo({
    height = 28,
    className,
}: {
    height?: number
    className?: string
}) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            data-slot="brand-logo"
            src="/brand/wordmark-light.png"
            alt="Solo Energia"
            height={height}
            style={{ height }}
            className={cn("w-auto object-contain", className)}
        />
    )
}
