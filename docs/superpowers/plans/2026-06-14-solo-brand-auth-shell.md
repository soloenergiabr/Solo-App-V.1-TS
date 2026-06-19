# Solo Brand Identity, Auth & App Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dress the entire app in the real Solo Energia brand — official
logo/symbol, Neue Montreal display font, the dark brand-orange palette,
glow/energy design tokens — and rebuild the four auth pages plus the shared
shell so every page looks like "Solo: você no controle da sua energia" instead
of the current stock Unsplash glassmorphism.

**Architecture:** This is **Plan 2** of the Sprint 2 "Controle" series. Plan 1
(`2026-06-14-controle-foundation.md`) already shipped the dark token base, the
`DM Sans + Outfit` fonts, and the `telemetry-kit`. This plan replaces the
placeholder display font with the brand's licensed **Neue Montreal**, imports
the brand assets into the repo, extends `globals.css` with the remaining mockup
tokens (glow shadows, energy green, brand gradients), adds a small
`src/frontend/brand/` module (`BrandMark`, `BrandLogo`) used everywhere, gives
`(auth)` a branded layout and rebuilds its four pages on semantic tokens, and
finishes with a brand pass that tokenizes the remaining `@user`/`@master` pages.
The three bespoke screen redesigns (Geração / Controle / Economia, spec §§5–7)
are **separate later plans** and are out of scope here.

**Tech Stack:** Next.js 15 (App Router) + React 19, Tailwind CSS v4
(CSS-variable tokens), shadcn/ui (new-york), `next/font/local` +
`next/font/google`, framer-motion, Vitest 3 + jsdom + Testing Library (enabled
in Plan 1).

**Brand source of truth:**

- Design system reference (Replit export):
  `Mockup_Examples/solopro_desigh_system.txt` (lives in the user's OneDrive
  copy; tokens already distilled below).
- Brand assets:
  `C:/Users/mateus/Documents/Claude/Projects/Solo Energia/Assets/2.2. Identidade Visual/Identidade Visual/`
  - `005. Símbolo/PNG/003.png` = solid orange "O" mark (`#FF481E`)
  - `005. Símbolo/PNG/004.png` = orange→gold gradient "O" mark
  - `005. Símbolo/PNG/001.png` = light-grey "O" mark
  - `006. Logomarca 001/PNG/001.png` = grey SOLO wordmark + tagline (reads on
    dark)
  - `003. Tipografia/TIPOGRAFIA - Da Marca/NeueMontreal-{Regular,Medium,Bold}.otf`
- Palette (`004. Paleta de Cores`): `FF481E` orange · `F2CE1F` gold · `F5A623`
  amber (gradient stop) · `9E2A19` rust · `642522` brown · `141414` near-black ·
  `E3E2DD` warm white · `4ADE80` energy green (from mockup).

**Conventions:** interactive components start with `"use client"`; import `cn`
from `@/lib/utils`; root element gets `data-slot="<name>"`. Component test files
start with `// @vitest-environment jsdom`. Brand image components render a plain
`<img>` (not `next/image`) so they are trivially testable under jsdom; add
`{/* eslint-disable-next-line @next/next/no-img-element */}` above each `<img>`.

---

## File Structure

- Create: `public/brand/mark-orange.png`, `public/brand/mark-gradient.png`,
  `public/brand/mark-light.png` — copied symbol marks.
- Create: `public/brand/wordmark-light.png` — copied grey SOLO wordmark (for
  dark bg).
- Create: `src/app/icon.png`, `src/app/apple-icon.png` — favicon/app icon from
  the orange mark (Next.js metadata file convention).
- Create: `src/app/fonts/NeueMontreal-Regular.otf`, `…-Medium.otf`, `…-Bold.otf`
  — self-hosted display font.
- Modify: `src/app/layout.tsx` — swap Outfit → local Neue Montreal; brand
  `metadata`.
- Modify: `src/app/globals.css` — add energy/card-border/glow/gradient tokens +
  glow utilities.
- Create: `src/frontend/brand/brand-mark.tsx` (+ `.test.tsx`) — the "O" symbol
  image.
- Create: `src/frontend/brand/brand-logo.tsx` (+ `.test.tsx`) — the SOLO
  wordmark image.
- Create: `src/frontend/brand/index.ts` — barrel.
- Create: `src/app/(auth)/layout.tsx` — branded split-screen auth shell.
- Modify: `src/frontend/auth/pages/login.page.tsx`, `register.page.tsx`,
  `forgot-password.page.tsx`, `reset-password.page.tsx` — rebuild on brand
  tokens.
- Modify: `src/frontend/app-sidebar.tsx` — use brand wordmark + tidy IA labels.
- Modify: `src/components/ui/page-layout.tsx` — display-font headings.
- Modify (brand pass, Task 12):
  `src/app/(private)/@user/{profile,club,solo-coins,vouchers,support}/page.tsx`,
  `src/app/(private)/@user/economy-dashboard/page.tsx`,
  `src/app/(private)/@master/{dashboard,clients,offers,faqs}/page.tsx` —
  tokenize hardcoded colors, consistent headers/empty states.

---

## Task 1: Import brand assets (logo, marks, fonts, favicon)

**Files:**

- Create: `public/brand/*.png`, `src/app/icon.png`, `src/app/apple-icon.png`,
  `src/app/fonts/*.otf`

- [ ] **Step 1: Create target folders**

Run (Git Bash):

```bash
mkdir -p public/brand src/app/fonts
```

- [ ] **Step 2: Copy the symbol marks and wordmark into `public/brand/`**

Run (quote the accented, space-containing source paths exactly):

```bash
SRC="C:/Users/mateus/Documents/Claude/Projects/Solo Energia/Assets/2.2. Identidade Visual/Identidade Visual"
cp "$SRC/005. Símbolo/PNG/003.png" public/brand/mark-orange.png
cp "$SRC/005. Símbolo/PNG/004.png" public/brand/mark-gradient.png
cp "$SRC/005. Símbolo/PNG/001.png" public/brand/mark-light.png
cp "$SRC/006. Logomarca 001/PNG/001.png" public/brand/wordmark-light.png
```

Expected: four files present. Verify: `ls public/brand/` lists
`mark-orange.png mark-gradient.png mark-light.png wordmark-light.png`.

- [ ] **Step 3: Create the favicon / app icon from the orange mark**

Next.js uses `src/app/icon.png` and `src/app/apple-icon.png` automatically. Run:

```bash
cp public/brand/mark-orange.png src/app/icon.png
cp public/brand/mark-orange.png src/app/apple-icon.png
```

Expected: both files exist. (No code change needed — Next.js picks them up by
filename convention. Remove the stale `public/icon.png.bak` if desired.)

- [ ] **Step 4: Copy the Neue Montreal font files**

Run:

```bash
SRC="C:/Users/mateus/Documents/Claude/Projects/Solo Energia/Assets/2.2. Identidade Visual/Identidade Visual/003. Tipografia/TIPOGRAFIA - Da Marca"
cp "$SRC/NeueMontreal-Regular.otf" src/app/fonts/NeueMontreal-Regular.otf
cp "$SRC/NeueMontreal-Medium.otf"  src/app/fonts/NeueMontreal-Medium.otf
cp "$SRC/NeueMontreal-Bold.otf"    src/app/fonts/NeueMontreal-Bold.otf
```

Expected: `ls src/app/fonts/` lists the three `.otf` files.

- [ ] **Step 5: Commit**

```bash
git add public/brand src/app/icon.png src/app/apple-icon.png src/app/fonts
git commit -m "chore: import Solo brand assets (logo, marks, Neue Montreal, favicon)"
```

---

## Task 2: Self-host Neue Montreal as the display font

**Files:**

- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace the Outfit import with a local Neue Montreal font**

In `src/app/layout.tsx`, replace the import line:

```tsx
import { DM_Sans, Outfit } from "next/font/google";
```

with:

```tsx
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
```

- [ ] **Step 2: Replace the `outfit` declaration with a local font declaration**

Replace this block:

```tsx
const outfit = Outfit({
    variable: "--font-display",
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});
```

with:

```tsx
const neueMontreal = localFont({
    variable: "--font-display",
    src: [
        {
            path: "./fonts/NeueMontreal-Regular.otf",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/NeueMontreal-Medium.otf",
            weight: "500",
            style: "normal",
        },
        {
            path: "./fonts/NeueMontreal-Bold.otf",
            weight: "700",
            style: "normal",
        },
    ],
    display: "swap",
});
```

- [ ] **Step 3: Update the body className**

Change:

```tsx
className={`${dmSans.variable} ${outfit.variable} font-sans antialiased`}
```

to:

```tsx
className={`${dmSans.variable} ${neueMontreal.variable} font-sans antialiased`}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx.cmd next build --no-lint 2>&1 | tail -20` Expected: build compiles
with no font-resolution error. (If `--no-lint` is unsupported on this Next
version, run `npx.cmd tsc --noEmit` and expect no new error from `layout.tsx`.)

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: self-host Neue Montreal as the brand display font"
```

---

## Task 3: Extend design tokens (energy, card-border, glow, gradients)

**Files:**

- Modify: `src/app/globals.css`

These tokens exist in the mockup (`solopro_desigh_system.txt` lines ~5659–5712)
but were not ported in Plan 1.

- [ ] **Step 1: Register the new color tokens in the `@theme inline` block**

In `src/app/globals.css`, inside `@theme inline { … }`, just after the line
`--color-warning: var(--warning);`, add:

```css
--color-energy: var(--energy);
```

- [ ] **Step 2: Add the token values to the `:root, .dark` block**

In the `:root, .dark { … }` block, just after the `--warning: hsl(38 100% 54%);`
line, add:

```css
--energy: #4ade80;
--card-border: hsl(0 0% 15%);

--brand-gradient-90: linear-gradient(90deg, #ff481e 0%, #f5a623 100%);
--glow-primary: 0 0 30px rgba(255, 72, 30, 0.25);
--glow-primary-sm: 0 0 14px rgba(255, 72, 30, 0.35);
--glow-energy: 0 0 24px rgba(74, 222, 128, 0.3);
```

- [ ] **Step 3: Add glow + energy-gradient utilities**

In the existing `@layer utilities { … }` block in `src/app/globals.css`, after
the `.text-brand-gradient { … }` rule, add:

```css
.bg-brand-gradient-90 {
    background-image: var(--brand-gradient-90);
}
.shadow-glow {
    box-shadow: var(--glow-primary);
}
.shadow-glow-sm {
    box-shadow: var(--glow-primary-sm);
}
.shadow-glow-energy {
    box-shadow: var(--glow-energy);
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx.cmd next build --no-lint 2>&1 | tail -20` Expected: compiles without
CSS errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add energy, glow and horizontal-gradient design tokens"
```

---

## Task 4: BrandMark component (the "O" symbol)

**Files:**

- Create: `src/frontend/brand/brand-mark.tsx`
- Test: `src/frontend/brand/brand-mark.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/frontend/brand/brand-mark.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrandMark } from "./brand-mark";

describe("BrandMark", () => {
    it("renders the gradient mark by default with an accessible name", () => {
        render(<BrandMark />);
        const img = screen.getByAltText("Solo");
        expect(img).toBeInTheDocument();
        expect(img.getAttribute("src")).toContain("mark-gradient");
    });
    it("renders the requested variant", () => {
        render(<BrandMark variant="orange" />);
        expect(screen.getByAltText("Solo").getAttribute("src")).toContain(
            "mark-orange",
        );
    });
    it("applies the size to width and height", () => {
        render(<BrandMark size={48} />);
        const img = screen.getByAltText("Solo");
        expect(img).toHaveAttribute("width", "48");
        expect(img).toHaveAttribute("height", "48");
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx.cmd vitest run src/frontend/brand/brand-mark.test.tsx` Expected: FAIL
with "Failed to resolve import './brand-mark'".

- [ ] **Step 3: Write minimal implementation**

Create `src/frontend/brand/brand-mark.tsx`:

```tsx
import { cn } from "@/lib/utils";

type BrandMarkVariant = "gradient" | "orange" | "light";

const SRC: Record<BrandMarkVariant, string> = {
    gradient: "/brand/mark-gradient.png",
    orange: "/brand/mark-orange.png",
    light: "/brand/mark-light.png",
};

export function BrandMark({
    variant = "gradient",
    size = 32,
    className,
}: {
    variant?: BrandMarkVariant;
    size?: number;
    className?: string;
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
    );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx.cmd vitest run src/frontend/brand/brand-mark.test.tsx` Expected: PASS
(3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/frontend/brand/brand-mark.tsx src/frontend/brand/brand-mark.test.tsx
git commit -m "feat: add BrandMark symbol component"
```

---

## Task 5: BrandLogo component (the SOLO wordmark)

**Files:**

- Create: `src/frontend/brand/brand-logo.tsx`
- Test: `src/frontend/brand/brand-logo.test.tsx`
- Create: `src/frontend/brand/index.ts`

- [ ] **Step 1: Write the failing test**

Create `src/frontend/brand/brand-logo.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrandLogo } from "./brand-logo";

describe("BrandLogo", () => {
    it("renders the wordmark with an accessible name", () => {
        render(<BrandLogo />);
        const img = screen.getByAltText("Solo Energia");
        expect(img).toBeInTheDocument();
        expect(img.getAttribute("src")).toContain("wordmark-light");
    });
    it("forwards a custom height", () => {
        render(<BrandLogo height={40} />);
        expect(screen.getByAltText("Solo Energia")).toHaveAttribute(
            "height",
            "40",
        );
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx.cmd vitest run src/frontend/brand/brand-logo.test.tsx` Expected: FAIL
with "Failed to resolve import './brand-logo'".

- [ ] **Step 3: Write minimal implementation**

Create `src/frontend/brand/brand-logo.tsx`:

```tsx
import { cn } from "@/lib/utils";

export function BrandLogo({
    height = 28,
    className,
}: {
    height?: number;
    className?: string;
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
    );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx.cmd vitest run src/frontend/brand/brand-logo.test.tsx` Expected: PASS
(2 tests).

- [ ] **Step 5: Create the barrel**

Create `src/frontend/brand/index.ts`:

```ts
export { BrandMark } from "./brand-mark";
export { BrandLogo } from "./brand-logo";
```

- [ ] **Step 6: Commit**

```bash
git add src/frontend/brand/brand-logo.tsx src/frontend/brand/brand-logo.test.tsx src/frontend/brand/index.ts
git commit -m "feat: add BrandLogo wordmark component + brand barrel"
```

---

## Task 6: Branded auth shell `(auth)/layout.tsx`

**Files:**

- Create: `src/app/(auth)/layout.tsx`

Currently there is no `(auth)` layout; each page paints its own full-screen
Unsplash background. This layout provides one branded shell (left brand panel on
desktop, centered form on mobile) so each page only renders its form card.

- [ ] **Step 1: Create the layout**

Create `src/app/(auth)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { BrandLogo } from "@/frontend/brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen w-full bg-background text-foreground lg:grid lg:grid-cols-2">
            {/* Brand panel (desktop) */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-card p-12 lg:flex">
                <div className="absolute inset-0 bg-brand-gradient opacity-10" />
                <div className="relative z-10">
                    <BrandLogo height={32} />
                </div>
                <div className="relative z-10 space-y-3">
                    <h1 className="font-display text-4xl font-bold leading-tight text-foreground">
                        Você no controle
                        <span className="text-brand-gradient">
                            da sua energia
                        </span>
                    </h1>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Acompanhe sua geração, economia e o retorno do seu
                        investimento em energia solar — em tempo real.
                    </p>
                </div>
                <div className="relative z-10 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Solo Energia
                </div>
            </div>

            {/* Form area */}
            <div className="flex min-h-screen items-center justify-center p-6 lg:min-h-0">
                <div className="w-full max-w-sm space-y-8">
                    <div className="flex justify-center lg:hidden">
                        <BrandLogo height={28} />
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx.cmd tsc --noEmit 2>&1 | grep "(auth)/layout"` — expect no output (no
errors from this file).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(auth)/layout.tsx"
git commit -m "feat: add branded auth layout shell"
```

---

## Task 7: Rebuild the Login page on brand tokens

**Files:**

- Modify: `src/frontend/auth/pages/login.page.tsx`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `src/frontend/auth/pages/login.page.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/frontend/auth/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const { login } = useAuthContext();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const result = await login({ email, password });
            if (result.success) {
                router.push("/dashboard");
            } else {
                setError(result.error || "Não foi possível entrar");
            }
        } catch {
            setError("Ocorreu um erro inesperado");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1 text-center lg:text-left">
                <h2 className="font-display text-2xl font-bold text-foreground">
                    Entrar
                </h2>
                <p className="text-sm text-muted-foreground">
                    Acesse o painel da sua energia
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 w-full"
                >
                    {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                <div className="text-center text-sm">
                    <Link
                        href="/forgot-password"
                        className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                        Recuperar senha
                    </Link>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Não tem uma conta?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                        Registre-se aqui
                    </Link>
                </p>
            </form>
        </div>
    );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx.cmd tsc --noEmit 2>&1 | grep "login.page"` — expect no output.

- [ ] **Step 3: Commit**

```bash
git add src/frontend/auth/pages/login.page.tsx
git commit -m "feat: rebuild login page on Solo brand tokens"
```

---

## Task 8: Rebuild the Forgot-password page

**Files:**

- Modify: `src/frontend/auth/pages/forgot-password.page.tsx`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of
`src/frontend/auth/pages/forgot-password.page.tsx` with:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | null>(
        null,
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        setMessageType(null);
        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessageType("success");
                setMessage(
                    data.message ||
                        "Se o email existir, enviamos um link de recuperação.",
                );
                setEmail("");
            } else {
                setMessageType("error");
                setMessage(data.message || "Ocorreu um erro. Tente novamente.");
            }
        } catch {
            setMessageType("error");
            setMessage("Ocorreu um erro inesperado. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1 text-center lg:text-left">
                <h2 className="font-display text-2xl font-bold text-foreground">
                    Recuperar senha
                </h2>
                <p className="text-sm text-muted-foreground">
                    Digite seu email para receber o link de redefinição
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {message && (
                    <Alert
                        variant={messageType === "error"
                            ? "destructive"
                            : "default"}
                    >
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 w-full"
                >
                    {isLoading ? "Enviando..." : "Enviar link"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Lembrou sua senha?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                        Voltar para login
                    </Link>
                </p>
            </form>
        </div>
    );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx.cmd tsc --noEmit 2>&1 | grep "forgot-password.page"` — expect no
output.

- [ ] **Step 3: Commit**

```bash
git add src/frontend/auth/pages/forgot-password.page.tsx
git commit -m "feat: rebuild forgot-password page on Solo brand tokens"
```

---

## Task 9: Rebuild the Reset-password page

**Files:**

- Modify: `src/frontend/auth/pages/reset-password.page.tsx`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `src/frontend/auth/pages/reset-password.page.tsx`
with:

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";

export function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        setStatus("idle");

        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("As senhas não coincidem");
            setIsLoading(false);
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            setStatus("error");
            setMessage(
                "A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula e número",
            );
            setIsLoading(false);
            return;
        }
        if (!token) {
            setStatus("error");
            setMessage("Link inválido ou expirado");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setStatus("success");
                setMessage("Senha alterada com sucesso!");
                setPassword("");
                setConfirmPassword("");
                setTimeout(() => router.push("/login"), 2000);
            } else {
                setStatus("error");
                setMessage(
                    data.message || "Erro ao redefinir senha. Tente novamente.",
                );
            }
        } catch {
            setStatus("error");
            setMessage("Ocorreu um erro inesperado. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1 text-center lg:text-left">
                <h2 className="font-display text-2xl font-bold text-foreground">
                    Redefinir senha
                </h2>
                <p className="text-sm text-muted-foreground">
                    Digite sua nova senha abaixo
                </p>
            </div>

            {message && (
                <Alert variant={status === "error" ? "destructive" : "default"}>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            {status === "success"
                ? (
                    <div className="space-y-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Redirecionando para o login...
                        </p>
                        <Link href="/login" className="inline-block w-full">
                            <Button type="button" className="h-11 w-full">
                                Ir para o login
                            </Button>
                        </Link>
                    </div>
                )
                : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="password">Nova senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)}
                                    placeholder="8+ caracteres (A-Z, a-z, 0-9)"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {showPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Confirmar senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword
                                        ? "text"
                                        : "password"}
                                    required
                                    minLength={8}
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)}
                                    placeholder="Digite a senha novamente"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {showConfirmPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-11 w-full"
                        >
                            {isLoading ? "Alterando senha..." : "Alterar senha"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Lembrou sua senha?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-primary underline-offset-4 hover:underline"
                            >
                                Voltar para login
                            </Link>
                        </p>
                    </form>
                )}
        </div>
    );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx.cmd tsc --noEmit 2>&1 | grep "reset-password.page"` — expect no
output.

- [ ] **Step 3: Commit**

```bash
git add src/frontend/auth/pages/reset-password.page.tsx
git commit -m "feat: rebuild reset-password page on Solo brand tokens"
```

---

## Task 10: Rebuild the Register page (de-glassmorphism, keep multi-step)

**Files:**

- Modify: `src/frontend/auth/pages/register.page.tsx`

Keep the existing 4-step logic, `formData` shape, `register()` call,
file→base64, indication code, and WhatsApp CTA exactly. Only change: remove the
Unsplash/glassmorphism wrapper (the `(auth)/layout.tsx` now provides the shell)
and recolor to semantic tokens. The page must render its content directly (no
fixed full-screen background) and use a wider container than the other auth
forms.

- [ ] **Step 1: Replace the success-screen wrapper**

In `src/frontend/auth/pages/register.page.tsx`, replace the entire
`if (success) { return ( … ) }` block with:

```tsx
if (success) {
    return (
        <div className="mx-auto w-full max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-success">
                        Cadastro concluído!
                    </CardTitle>
                    <CardDescription className="text-center">
                        {success}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Em breve nossa equipe entrará em contato para análise do
                        seu perfil.
                    </p>
                    <Button onClick={handleWhatsAppContact} className="w-full">
                        Entrar em contato pelo WhatsApp
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
```

- [ ] **Step 2: Replace the main return wrapper**

Replace the outer wrapper of the main `return (` — i.e. replace this opening:

```tsx
    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat py-12 px-4 sm:px-6 lg:px-8 relative"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80&sat=-100')",
            }}>
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="max-w-2xl w-full space-y-6 sm:space-y-8 relative z-10">
                {/* Progress Bar */}
                <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/30">
```

with:

```tsx
return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
```

and remove the now-orphaned extra closing `</div>` that previously closed the
outer Unsplash wrapper (the JSX must stay balanced — after this change there is
one outer `<div>` and one inner card `<div>`, each with a matching close).

- [ ] **Step 3: Recolor the step indicators, copy, and inputs to tokens**

Within the same file, apply these literal replacements (each is unique):

Progress dot active/complete classes — replace:

```tsx
<div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${currentStep > step.id
        ? 'bg-green-500 text-white'
        : currentStep === step.id
            ? 'bg-primary text-primary-foreground'
            : 'bg-white/20 text-white/60'
    }`}>
```

with:

```tsx
<div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${currentStep > step.id
        ? 'bg-success text-white'
        : currentStep === step.id
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
    }`}>
```

Connector bar — replace:

```tsx
<div
    className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 rounded ${
        currentStep > step.id ? "bg-green-500" : "bg-white/20"
    }`}
/>;
```

with:

```tsx
<div
    className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 rounded ${
        currentStep > step.id ? "bg-success" : "bg-muted"
    }`}
/>;
```

Step header text — replace:

```tsx
<h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{steps[currentStep - 1].title}</h2>
<p className="text-white/90 text-sm sm:text-base">{steps[currentStep - 1].description}</p>
<p className="text-white/70 text-xs sm:text-sm mt-2">{steps[currentStep - 1].content}</p>
```

with:

```tsx
<h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">{steps[currentStep - 1].title}</h2>
<p className="text-muted-foreground text-sm sm:text-base">{steps[currentStep - 1].description}</p>
<p className="text-muted-foreground/70 text-xs sm:text-sm mt-2">{steps[currentStep - 1].content}</p>
```

Inline error box — replace:

```tsx
<div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-100 px-4 py-3 rounded-lg mb-6">
    {error}
</div>;
```

with:

```tsx
<div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
    {error}
</div>;
```

Then, in `renderStepContent()` and the step-1 marketing block, replace every
occurrence of the glassmorphism input/label/card classes with tokens:

- Replace all `text-white/90` → `text-foreground` (labels).
- Replace all
  `bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60`
  → `` (empty — let the default `Input` styles apply; keep any `h-12 sm:h-10`
  sizing already present).
- Replace `text-white/60` → `text-muted-foreground`.
- Replace the step-1 marketing tiles
  `bg-white/10 backdrop-blur-sm rounded-lg p-4` →
  `rounded-lg border bg-muted/50 p-4` and `text-white` → `text-foreground`
  inside them.

Use `replace_all` for the `text-white/90`→`text-foreground` and
`bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60`→``
substitutions.

Navigation buttons — replace the outline "Anterior" button className:

```tsx
className =
    "flex items-center justify-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 h-12 sm:h-10 text-base sm:text-sm";
```

with:

```tsx
className =
    "flex items-center justify-center gap-2 h-12 sm:h-10 text-base sm:text-sm";
```

Indication-code box — replace:

```tsx
<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
    <p className="text-white/90 text-sm">
        Você foi indicado! Código:{" "}
        <span className="font-bold text-primary">{indicationCode}</span>
    </p>
</div>;
```

with:

```tsx
<div className="rounded-2xl border bg-card p-4 text-center">
    <p className="text-sm text-foreground">
        Você foi indicado! Código:{" "}
        <span className="font-bold text-primary">{indicationCode}</span>
    </p>
</div>;
```

- [ ] **Step 4: Verify it compiles and JSX is balanced**

Run: `npx.cmd tsc --noEmit 2>&1 | grep "register.page"` — expect no output. If a
JSX-balance error appears, re-check the Step 2 wrapper replacement (one outer
`<div>`, one card `<div>`).

- [ ] **Step 5: Commit**

```bash
git add src/frontend/auth/pages/register.page.tsx
git commit -m "feat: rebuild register page on Solo brand tokens"
```

---

## Task 11: App shell brand polish (sidebar wordmark + display headings)

**Files:**

- Modify: `src/frontend/app-sidebar.tsx`
- Modify: `src/components/ui/page-layout.tsx`

- [ ] **Step 1: Point the sidebar at the brand wordmark**

In `src/frontend/app-sidebar.tsx`, replace:

```tsx
const logoSrc = resolvedTheme === "dark"
    ? "/logo-white-text.png"
    : "/logo-black-text.png";
```

with:

```tsx
// App is dark-first; brand wordmark reads on dark surfaces.
const logoSrc = resolvedTheme === "light"
    ? "/logo-black-text.png"
    : "/brand/wordmark-light.png";
```

- [ ] **Step 2: Tidy the user IA label to match the spec vocabulary**

In the same file, in `vendedorSections`, change the first item label:

```tsx
{ label: 'Minha geração', mobileLabel: 'Geração', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
```

to:

```tsx
{ label: 'Geração', mobileLabel: 'Geração', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
```

- [ ] **Step 3: Use the display font for page-header titles**

In `src/components/ui/page-layout.tsx`, in `PageHeader`, replace:

```tsx
<h1 className="text-2xl font-bold text-foreground">{title}</h1>;
```

with:

```tsx
<h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>;
```

- [ ] **Step 4: Verify it compiles**

Run: `npx.cmd tsc --noEmit 2>&1 | grep -E "app-sidebar|page-layout"` — expect no
output.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/app-sidebar.tsx src/components/ui/page-layout.tsx
git commit -m "feat: brand the app shell (sidebar wordmark + display headings)"
```

---

## Task 12: Brand pass over remaining pages (tokenize colors + consistent states)

**Files (one commit per file group is fine):**

- `src/app/(private)/@user/profile/page.tsx`
- `src/app/(private)/@user/club/page.tsx`
- `src/app/(private)/@user/solo-coins/page.tsx`
- `src/app/(private)/@user/vouchers/page.tsx`
- `src/app/(private)/@user/support/page.tsx`
- `src/app/(private)/@user/economy-dashboard/page.tsx`
- `src/app/(private)/@master/dashboard/page.tsx`
- `src/app/(private)/@master/clients/page.tsx`
- `src/app/(private)/@master/offers/page.tsx`
- `src/app/(private)/@master/faqs/page.tsx`

**Goal:** no page should use hardcoded Tailwind palette colors or stock
backgrounds; all use semantic tokens and the shared
`PageLayout`/`PageHeader`/`PageEmpty`. This is a mechanical, per-file transform
— do them one at a time and visually verify each.

**Canonical transform (apply to each file):**

1. Wrap the page body in `PageLayout` with a `PageHeader` if it isn't already:

```tsx
import { PageHeader, PageLayout } from "@/components/ui/page-layout";

return (
    <PageLayout header={<PageHeader title="<Título>" subtitle="<subtítulo>" />}>
        {/* existing content */}
    </PageLayout>
);
```

2. Replace hardcoded palette utilities with tokens (use `replace_all` per file):
   - `text-gray-*` / `text-slate-*` / `text-zinc-*` → `text-muted-foreground`
     (secondary) or `text-foreground` (primary).
   - `bg-white` → `bg-card`; `bg-gray-50` / `bg-gray-100` → `bg-muted`.
   - `border-gray-200` / `border-gray-300` → `border-border`.
   - `text-green-*` (success) → `text-success`; `bg-green-*` → `bg-success`.
   - `text-yellow-*` / amber (warning/brand) → `text-warning` or `text-primary`
     per meaning.
   - `text-red-*` / `bg-red-*` (errors) → `text-destructive` / `bg-destructive`.
   - brand accents (`text-orange-*`, `bg-orange-*`) → `text-primary` /
     `bg-primary`.

3. Replace ad-hoc empty states with `PageEmpty`:

```tsx
import { PageEmpty } from "@/components/ui/page-layout";
<PageEmpty
    icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
    title="Nada por aqui ainda"
    description="<contexto>"
/>;
```

4. Make primary section titles use the display font: add `font-display` to the
   main `<h1>/<h2>` of each page.

- [ ] **Step 1: `@user/profile/page.tsx`** — apply the canonical transform. Run
      `npx.cmd tsc --noEmit 2>&1 | grep "profile/page"` (expect none). Commit
      `feat: brand pass on profile page`.
- [ ] **Step 2: `@user/club/page.tsx`** — apply transform; tsc grep clean;
      commit `feat: brand pass on club page`.
- [ ] **Step 3: `@user/solo-coins/page.tsx`** — apply transform; tsc grep clean;
      commit `feat: brand pass on solo-coins page`.
- [ ] **Step 4: `@user/vouchers/page.tsx`** — apply transform; tsc grep clean;
      commit `feat: brand pass on vouchers page`.
- [ ] **Step 5: `@user/support/page.tsx`** — apply transform; tsc grep clean;
      commit `feat: brand pass on support page`.
- [ ] **Step 6: `@user/economy-dashboard/page.tsx`** — apply transform; tsc grep
      clean; commit `feat: brand pass on economy-dashboard page`.
- [ ] **Step 7: `@master/dashboard/page.tsx`** — apply transform; tsc grep
      clean; commit `feat: brand pass on admin dashboard page`.
- [ ] **Step 8: `@master/clients/page.tsx`** — apply transform; tsc grep clean;
      commit `feat: brand pass on admin clients page`.
- [ ] **Step 9: `@master/offers/page.tsx`** — apply transform; tsc grep clean;
      commit `feat: brand pass on admin offers page`.
- [ ] **Step 10: `@master/faqs/page.tsx`** — apply transform; tsc grep clean;
      commit `feat: brand pass on admin faqs page`.

> Note for the worker: read each file before editing; some already use
> `PageLayout`/tokens (e.g. the generation dashboard does) — only change what
> deviates. Do not invent new copy; preserve existing data and behavior.

---

## Task 13: App metadata + final verification

**Files:**

- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Brand the metadata**

In `src/app/layout.tsx`, replace the `metadata` export:

```tsx
export const metadata: Metadata = {
    title: "Solo App",
    description: "Aplicativo de monitoramento solar da Solo Energia.",
};
```

with:

```tsx
export const metadata: Metadata = {
    title: {
        default: "Solo Energia — Você no controle da sua energia",
        template: "%s · Solo Energia",
    },
    description:
        "Acompanhe sua geração, economia e o retorno do seu investimento em energia solar.",
};
```

- [ ] **Step 2: Run the full telemetry-kit + brand test suite**

Run: `npx.cmd vitest run src/frontend/telemetry-kit src/frontend/brand`
Expected: PASS (Plan-1 telemetry-kit tests + the 5 new brand tests).

- [ ] **Step 3: Production build**

Run: `npx.cmd next build --no-lint 2>&1 | tail -25` Expected: "Compiled
successfully" / route summary, no errors from the touched files. (Pre-existing
unrelated type errors outside this plan's scope — admin Prisma JSON typing,
inverter fixtures, object-storage, the JWT expiry test — are documented in Plan
1 and are not introduced here.)

- [ ] **Step 4: Manual visual verification**

Use the `run` skill (`! npm run dev`) and confirm:

- `/login`, `/register`, `/forgot-password`, `/reset-password`: dark background,
  SOLO wordmark, brand-gradient panel on desktop, orange primary button, no
  Unsplash photo, no glass panels.
- Browser tab shows the orange "O" favicon; title reads "Solo Energia — …".
- Any private page (e.g. `/dashboard`): sidebar shows the SOLO wordmark; page
  title renders in Neue Montreal (geometric display face).
- A couple of Task-12 pages: no stray grey/white/colored hardcoded surfaces;
  everything sits on the dark token palette.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: brand app metadata + title template"
```

---

## Self-Review (completed during planning)

**Spec coverage (sprint_2_frontend_v1.md + spec §4 + user request):**

- "Improve the auth page" → Tasks 6–10 (branded shell + 4 rebuilt pages).
- "all pages: use the solo assets (colors and logo)" → Task 1 (assets), Task 11
  (shell), Task 12 (every remaining `@user`/`@master` page).
- "use the recommended design system" → Task 2 (Neue Montreal), Task 3
  (glow/energy/gradient tokens completing the mockup port), building on Plan-1
  tokens already in `globals.css`.
- Logo/symbol usage → `BrandMark`/`BrandLogo` (Tasks 4–5), wired in auth shell +
  sidebar.
- Out of scope (correctly deferred to later plans): Geração full redesign (spec
  §6), Controle landing (spec §5), Economia (spec §7), payer access control,
  admin cockpit — these are bespoke screen plans, not the brand/shell layer this
  plan delivers.

**Placeholder scan:** none — every code step contains complete code or a precise
literal replacement; every run step states an expected result. Task 12 is a
mechanical per-file transform with a fully specified canonical pattern and an
explicit file list (acceptable: it is repetition of one shown transform, not a
TODO).

**Type/name consistency:** `BrandMark`/`BrandLogo` props (`variant`, `size`,
`height`) defined in Tasks 4–5 are used unchanged in Task 6
(`BrandLogo height={…}`) and Task 11. The `--energy`/`--card-border`/glow tokens
added in Task 3 back the `bg-success`/`text-success` (already in Plan 1) and the
optional glow utilities; no later task references a token not defined here. Auth
pages reuse existing `useAuthContext`, `login`/`register` signatures and the
existing `/api/auth/*` routes unchanged — only presentation changes.

---

## Execution Handoff

**Plan complete and saved to
`docs/superpowers/plans/2026-06-14-solo-brand-auth-shell.md`. Two execution
options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task,
review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans,
batch execution with checkpoints for review.

**Which approach?**

Plan Codex - 18/06/2026

# Sprint 3 - Solo Brand, Auth Shell, and v1 Visual Foundation

> PM owner: Codex Source plan:
> `docs/superpowers/plans/2026-06-14-solo-brand-auth-shell.md` v1 strategy
> reference: `docs/superpowers/specs/2026-06-18-solo-app-v1-overview-design.md`
> Execution style: use `superpowers:subagent-driven-development` when possible.
> If unavailable, execute wave-by-wave with `superpowers:executing-plans`.

---

## 1. Sprint Goal

Make the app visibly and consistently feel like Solo Energia before the next v1
feature work starts.

This sprint does not build the full v1 product. It creates the branded
foundation that v1 screens will inherit:

- Official Solo logo, mark, favicon, and Neue Montreal display font.
- Dark Solo design tokens: orange/gold brand gradient, energy green, glow
  shadows, card borders.
- Reusable `BrandMark` and `BrandLogo` components.
- Branded auth shell for login, register, forgot-password, and reset-password.
- Branded app shell: sidebar wordmark, display headings, consistent labels.
- Token cleanup pass over existing user and master pages.

The sprint is successful when a user can open the auth flow and private app
pages and immediately see "Solo: voce no controle da sua energia", with no stock
Unsplash/glassmorphism leftovers.

---

## 2. Product Boundaries

### In scope

- Import and wire brand assets.
- Self-host Neue Montreal as the display font.
- Extend `globals.css` with missing Solo design tokens.
- Add tested brand image components.
- Add `(auth)` layout and rebuild the four auth pages on semantic tokens.
- Polish app shell and page headings.
- Tokenize remaining `@user` and `@master` pages listed in the source plan.
- Run focused tests and build/type checks.

### Out of scope

- Bespoke redesign of Geracao, Controle, or Economia hero screens.
- New v1 flows from the overview spec, including:
  - "Analise da Conta" deep view.
  - "Minhas Usinas" setup wizard.
  - Rateio screen and Enel sync loop.
  - Client self-upload trust queue.
- Bot-Enel automation, Rateio-Actuator, n8n notifications, Agno migration.
- Business logic changes to auth, club, generation, consumption, or admin
  modules.

---

## 3. Execution Rules for Junior Engineers

Follow these rules for every task:

1. Read the target file before editing it.
2. Make the smallest change that satisfies the task.
3. Preserve existing behavior and data flow. This is mostly presentation work.
4. Prefer semantic tokens (`bg-card`, `text-muted-foreground`, `text-primary`,
   `border-border`) over hardcoded Tailwind colors.
5. Add or keep tests where the source plan asks for them.
6. Run the verification command listed for the task before moving on.
7. Commit at the end of each wave or task group, not after unrelated work.
8. If a task is already done in the repo, mark it as verified instead of
   recreating it.
9. Stop and ask the PM if a requested asset file is missing from the source
   brand folder.

Recommended commit style:

```bash
git add <files>
git commit -m "feat: <short description>"
```

---

## 4. Definition of Done

Sprint 3 is done only when all items below are true:

- `public/brand/*` contains the Solo mark and wordmark assets.
- `src/app/fonts/*` contains the three Neue Montreal font files.
- `src/app/layout.tsx` uses `next/font/local` for Neue Montreal and branded
  metadata.
- `src/app/globals.css` exposes the missing Solo tokens and utilities.
- `src/frontend/brand/*` contains `BrandMark`, `BrandLogo`, barrel exports, and
  tests.
- `src/app/(auth)/layout.tsx` provides the branded auth shell.
- The four auth pages no longer render their own Unsplash/glassmorphism
  full-screen backgrounds.
- Sidebar uses the Solo wordmark in dark mode.
- Page headings use `font-display`.
- Listed private user/master pages no longer rely on obvious hardcoded
  gray/white/orange/red/green palette classes where semantic tokens are
  available.
- Focused Vitest suite passes for `src/frontend/brand` and existing
  telemetry-kit tests.
- Build/type check has no new errors from the files touched in this sprint.

---

## 5. Wave Plan

### Wave 0 - Preflight and Repo Reality Check

Goal: understand what is already done before editing.

Owner: junior engineer

Checklist:

- [ ] Run `git status --short` and note existing uncommitted changes.
- [ ] Read `docs/superpowers/plans/2026-06-14-solo-brand-auth-shell.md`.
- [ ] Read this sprint file end-to-end.
- [ ] Confirm whether these files already exist:
  - [ ] `public/brand/mark-orange.png`
  - [ ] `public/brand/mark-gradient.png`
  - [ ] `public/brand/mark-light.png`
  - [ ] `public/brand/wordmark-light.png`
  - [ ] `src/app/fonts/NeueMontreal-Regular.otf`
  - [ ] `src/app/fonts/NeueMontreal-Medium.otf`
  - [ ] `src/app/fonts/NeueMontreal-Bold.otf`
  - [ ] `src/frontend/brand/brand-mark.tsx`
  - [ ] `src/frontend/brand/brand-logo.tsx`
  - [ ] `src/app/(auth)/layout.tsx`

Verification commands:

```bash
git status --short
rg --files public/brand src/app/fonts src/frontend/brand
```

Exit criteria:

- The engineer knows which source-plan tasks are already complete and which
  still need implementation.
- No code has been changed yet.

---

### Wave 1 - Brand Assets and Font Foundation

Goal: put official Solo assets and Neue Montreal in the repo, then wire the
display font.

Source-plan tasks: 1, 2, 13 metadata step

Files:

- `public/brand/*.png`
- `src/app/icon.png`
- `src/app/apple-icon.png`
- `src/app/fonts/*.otf`
- `src/app/layout.tsx`

Steps:

- [ ] Create `public/brand` and `src/app/fonts` if missing.
- [ ] Copy the official Solo mark and wordmark files from the brand asset folder
      defined in the source plan.
- [ ] Copy the orange mark to `src/app/icon.png` and `src/app/apple-icon.png`.
- [ ] Copy Neue Montreal Regular, Medium, and Bold into `src/app/fonts`.
- [ ] In `src/app/layout.tsx`, replace Outfit with `localFont`.
- [ ] Set `--font-display` to the Neue Montreal local font.
- [ ] Update app metadata to:
  - default title: `Solo Energia - Voce no controle da sua energia`
  - template: `%s - Solo Energia`
  - description:
    `Acompanhe sua geracao, economia e o retorno do seu investimento em energia solar.`

Implementation notes:

- If assets already exist, do not copy again. Verify dimensions and filenames
  instead.
- Use ASCII metadata text unless the file already uses correct UTF-8
  consistently.
- Do not remove `DM Sans`; it remains the body font.

Verification commands:

```bash
rg "localFont|NeueMontreal|metadata|font-display" src/app/layout.tsx
npm.cmd run build
```

Exit criteria:

- Build has no font-resolution error.
- Browser metadata and favicon are handled by Next app metadata conventions.

Suggested commit:

```bash
git add public/brand src/app/icon.png src/app/apple-icon.png src/app/fonts src/app/layout.tsx
git commit -m "feat: wire Solo brand assets and display font"
```

---

### Wave 2 - Design Tokens and Utilities

Goal: complete the dark Solo token layer needed by auth and future v1 screens.

Source-plan task: 3

File:

- `src/app/globals.css`

Steps:

- [ ] Read the current `@theme inline` block.
- [ ] Add `--color-energy: var(--energy);`.
- [ ] Add root values for:
  - `--energy`
  - `--card-border`
  - `--brand-gradient-90`
  - `--glow-primary`
  - `--glow-primary-sm`
  - `--glow-energy`
- [ ] Add utility classes:
  - `.bg-brand-gradient-90`
  - `.shadow-glow`
  - `.shadow-glow-sm`
  - `.shadow-glow-energy`

Implementation notes:

- Keep existing tokens intact.
- Do not rename tokens used by existing components.
- This wave should not touch React files.

Verification commands:

```bash
rg "energy|card-border|brand-gradient-90|shadow-glow" src/app/globals.css
npm.cmd run build
```

Exit criteria:

- CSS compiles.
- Token names match the source plan exactly.

Suggested commit:

```bash
git add src/app/globals.css
git commit -m "feat: add Solo energy and glow design tokens"
```

---

### Wave 3 - Brand Components

Goal: create reusable, test-covered brand primitives that every shell/page can
consume.

Source-plan tasks: 4, 5

Files:

- `src/frontend/brand/brand-mark.tsx`
- `src/frontend/brand/brand-mark.test.tsx`
- `src/frontend/brand/brand-logo.tsx`
- `src/frontend/brand/brand-logo.test.tsx`
- `src/frontend/brand/index.ts`

Steps:

- [ ] Add `BrandMark` with variants:
  - `gradient` -> `/brand/mark-gradient.png`
  - `orange` -> `/brand/mark-orange.png`
  - `light` -> `/brand/mark-light.png`
- [ ] Add `BrandLogo` pointing to `/brand/wordmark-light.png`.
- [ ] Use plain `<img>`, not `next/image`, so jsdom tests remain simple.
- [ ] Add `data-slot="brand-mark"` and `data-slot="brand-logo"`.
- [ ] Add tests for default render, variant render, accessible alt text, and
      sizing.
- [ ] Export both components from `src/frontend/brand/index.ts`.

Implementation notes:

- Import `cn` from `@/lib/utils`.
- Add the required eslint disable comment immediately above each `<img>`.
- Keep prop APIs tiny: `variant`, `size`, `height`, `className`.

Verification commands:

```bash
npx.cmd vitest run src/frontend/brand
```

Exit criteria:

- Brand component tests pass.
- No component imports from app routes, auth pages, or sidebar are changed yet.

Suggested commit:

```bash
git add src/frontend/brand
git commit -m "feat: add tested Solo brand components"
```

---

### Wave 4 - Branded Auth Shell and Auth Pages

Goal: replace stock auth visuals with one shared Solo auth experience.

Source-plan tasks: 6, 7, 8, 9, 10

Files:

- `src/app/(auth)/layout.tsx`
- `src/frontend/auth/pages/login.page.tsx`
- `src/frontend/auth/pages/register.page.tsx`
- `src/frontend/auth/pages/forgot-password.page.tsx`
- `src/frontend/auth/pages/reset-password.page.tsx`

Steps:

- [ ] Create `(auth)/layout.tsx` with:
  - desktop split layout
  - `BrandLogo`
  - dark background
  - Solo gradient accent
  - mobile centered logo
  - `{children}` in a constrained form column
- [ ] Rebuild login page so it only renders page content/form, not the whole
      screen background.
- [ ] Rebuild forgot-password page the same way.
- [ ] Rebuild reset-password page the same way.
- [ ] Rebuild register page while preserving:
  - existing multi-step logic
  - `formData` shape
  - `register()` call
  - file-to-base64 behavior
  - indication code behavior
  - WhatsApp CTA
- [ ] Remove Unsplash background usage from auth pages.
- [ ] Remove glassmorphism classes from auth pages:
  - `bg-white/20`
  - `backdrop-blur-*`
  - `border-white/*`
  - `text-white/*` when used as the main auth text style

Implementation notes:

- This is the riskiest wave because register has the most existing behavior.
- Do login, forgot-password, and reset-password first.
- Do register last and test JSX balance carefully.
- Do not change API routes or auth context logic.

Focused verification commands:

```bash
rg "unsplash|backdrop-blur|bg-white/20|border-white|text-white" src/frontend/auth/pages
npm.cmd run build
```

Manual verification:

- [ ] `/login` shows Solo brand shell.
- [ ] `/register` keeps all steps and no longer shows photo/glass styling.
- [ ] `/forgot-password` and `/reset-password` use the same shell.
- [ ] Primary buttons are orange via semantic `Button` styles.

Exit criteria:

- Auth pages compile.
- No auth behavior was removed.
- No page paints its own full-screen stock background.

Suggested commit:

```bash
git add "src/app/(auth)/layout.tsx" src/frontend/auth/pages
git commit -m "feat: rebuild auth flow on Solo brand shell"
```

---

### Wave 5 - App Shell Polish

Goal: make the private app shell match the new brand layer.

Source-plan task: 11

Files:

- `src/frontend/app-sidebar.tsx`
- `src/components/ui/page-layout.tsx`

Steps:

- [ ] Update dark-mode sidebar logo to `/brand/wordmark-light.png`.
- [ ] Keep the light-mode logo fallback if the app still supports light mode.
- [ ] Change first user navigation label from `Minha geracao` to `Geracao`.
- [ ] Add `font-display` to `PageHeader` title.

Implementation notes:

- Do not redesign navigation in this wave.
- Keep routes and icons unchanged.

Verification commands:

```bash
rg "wordmark-light|Geracao|font-display" src/frontend/app-sidebar.tsx src/components/ui/page-layout.tsx
npm.cmd run build
```

Exit criteria:

- Sidebar brand changes compile.
- Page headers inherit the display font.

Suggested commit:

```bash
git add src/frontend/app-sidebar.tsx src/components/ui/page-layout.tsx
git commit -m "feat: polish Solo app shell branding"
```

---

### Wave 6 - Brand Pass on Existing User and Master Pages

Goal: remove obvious non-brand hardcoded surfaces and make existing pages
consistent with the shared shell.

Source-plan task: 12

Files:

- `src/app/(private)/@user/profile/page.tsx`
- `src/app/(private)/@user/club/page.tsx`
- `src/app/(private)/@user/solo-coins/page.tsx`
- `src/app/(private)/@user/vouchers/page.tsx`
- `src/app/(private)/@user/support/page.tsx`
- `src/app/(private)/@user/economy-dashboard/page.tsx`
- `src/app/(private)/@master/dashboard/page.tsx`
- `src/app/(private)/@master/clients/page.tsx`
- `src/app/(private)/@master/offers/page.tsx`
- `src/app/(private)/@master/faqs/page.tsx`

Per-file steps:

- [ ] Read the file first.
- [ ] Check whether it already uses `PageLayout` and `PageHeader`.
- [ ] If not, wrap the main content in `PageLayout`.
- [ ] Use `PageHeader` for page title/subtitle where appropriate.
- [ ] Add `font-display` to primary headings if the page does not use
      `PageHeader`.
- [ ] Replace hardcoded color classes with semantic tokens:
  - gray/slate/zinc text -> `text-muted-foreground` or `text-foreground`
  - `bg-white` -> `bg-card`
  - `bg-gray-*` -> `bg-muted`
  - `border-gray-*` -> `border-border`
  - success green -> `text-success` / `bg-success`
  - warnings -> `text-warning`
  - errors -> `text-destructive` / `bg-destructive`
  - brand orange -> `text-primary` / `bg-primary`
- [ ] Replace ad-hoc empty states with `PageEmpty` when it is a simple empty
      state.
- [ ] Preserve all hooks, API calls, data mapping, and user actions.

Implementation notes:

- Do one page at a time.
- Avoid broad search-and-replace across multiple files. Some color classes may
  be intentional chart/status colors.
- If a page uses chart palettes or status legends, verify meaning before
  changing.
- If a file already matches the brand system, leave it alone and mark it
  verified.

Verification commands per page:

```bash
npm.cmd run build
```

Optional inspection commands:

```bash
rg "text-gray|text-slate|text-zinc|bg-white|bg-gray|border-gray|text-orange|bg-orange" "src/app/(private)"
```

Exit criteria:

- Listed pages compile.
- Obvious stock light surfaces and hardcoded brand colors are removed or
  justified.
- User/admin functionality remains unchanged.

Suggested commits:

```bash
git add "src/app/(private)/@user"
git commit -m "feat: brand pass on user pages"

git add "src/app/(private)/@master"
git commit -m "feat: brand pass on master pages"
```

---

### Wave 7 - Final Verification and Handoff

Goal: prove the sprint is ready for v1 feature work to build on top.

Steps:

- [ ] Run brand tests.
- [ ] Run telemetry-kit tests, because this brand work builds on Sprint 2
      telemetry components.
- [ ] Run production build.
- [ ] Start local dev server.
- [ ] Manually inspect auth pages.
- [ ] Manually inspect at least one private user page and one master page.
- [ ] Write a short handoff note listing:
  - completed waves
  - known pre-existing build/test issues, if any
  - screenshots or routes checked
  - follow-up work for v1 roadmap

Verification commands:

```bash
npx.cmd vitest run src/frontend/brand src/frontend/telemetry-kit
npm.cmd run build
npm.cmd run dev
```

Manual routes:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/dashboard`
- `/economy-dashboard`
- `/master/dashboard` or the current admin dashboard route

Exit criteria:

- The sprint has a clear green/red verification report.
- Any remaining errors are classified as either:
  - introduced by this sprint and must be fixed now, or
  - pre-existing and documented for later.

Suggested final commit if needed:

```bash
git add -A
git commit -m "chore: verify Sprint 3 brand foundation"
```

---

## 6. Risk Register

### Risk 1 - Brand asset paths contain spaces and accented folder names

Impact: copy commands fail or wrong assets are imported.

Mitigation:

- Quote source paths exactly.
- Verify copied filenames in `public/brand`.
- If the source path is unavailable, stop and ask Mateus for the asset location.

### Risk 2 - Register page behavior regression

Impact: users cannot complete signup.

Mitigation:

- Preserve register state, validation, file upload, and submit logic.
- Only change wrappers/classes unless the source plan explicitly says otherwise.
- Manually walk through all register steps after the edit.

### Risk 3 - Build already has unrelated errors

Impact: engineer cannot tell whether this sprint broke the app.

Mitigation:

- Run verification before and after risky waves when possible.
- If build fails, inspect error filenames.
- Fix errors in touched files. Document unrelated existing errors.

### Risk 4 - Over-tokenizing meaningful status colors

Impact: charts/status indicators lose clarity.

Mitigation:

- Replace obvious stock classes first.
- Keep chart/status palettes when they carry business meaning and no semantic
  token exists.
- Prefer focused edits over sweeping replacements.

---

## 7. PM Acceptance Checklist

- [ ] Auth pages look like one cohesive Solo product.
- [ ] The first viewport includes Solo brand identity, not stock imagery.
- [ ] Private app shell uses Solo wordmark.
- [ ] Headings feel like display typography.
- [ ] User/master pages sit on the dark token system.
- [ ] No v1 feature behavior was removed.
- [ ] Junior engineer handoff is complete and understandable.

---

## 8. Follow-Up Roadmap After Sprint 3

Once Sprint 3 is accepted, the next v1 implementation plans should be created in
this order:

1. Swappable two-stage Economia analyzer module.
2. "Analise da Conta" client view.
3. Client self-upload trust flow and team validation queue.
4. "Minhas Usinas" setup wizard.
5. Rateio intended-vs-applied screen and audit trail.
6. One-click PIX/barcode and paid confirmation hardening.
7. Domain event emission across bill, rateio, and inverter actions.

These follow-ups are intentionally not part of Sprint 3. Sprint 3 makes them
cheaper by giving every future screen the same branded visual foundation.
