import { cn } from "@/lib/utils"

type BrandMarkVariant = "gradient" | "orange" | "light"

const SRC: Record<BrandMarkVariant, string> = {
    gradient: "/brand/mark-gradient.png",
    orange: "/brand/mark-orange.png",
    light: "/brand/mark-light.png",
}

export function BrandMark({
    variant = "gradient",
    size = 32,
    className,
}: {
    variant?: BrandMarkVariant
    size?: number
    className?: string
}) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            data-slot="brand-mark"
            src={SRC[variant]}
            alt="Solo"
            width={size}
            height={size}
            className={cn("object-contain", className)}
        />
    )
}
