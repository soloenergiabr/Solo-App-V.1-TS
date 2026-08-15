import prisma from '@/lib/prisma'

/** Role that marks a user as a payer (responsavel por UCs), not a titular. */
export const PAYER_ROLE = 'payer'

/**
 * The set of consumer units a user may read.
 * - `'all'` means no unit-level restriction (titular / admin): scope by clientId.
 * - `string[]` is the explicit list of consumer unit ids a payer may read.
 */
export type AccessibleUnits = string[] | 'all'

/**
 * Pure scope decision: given the consumer unit ids a user pays for, decide the
 * accessible set.
 *
 * `isPayer` comes from the user's role. It matters because a payer whose units
 * were all unassigned must see NOTHING — inferring "titular" from an empty list
 * would silently hand them the whole client's data.
 */
export function computeAccessibleUnitIds(
    payerUnitIds: string[],
    isPayer: boolean = false,
): AccessibleUnits {
    if (isPayer) return payerUnitIds
    return payerUnitIds.length > 0 ? payerUnitIds : 'all'
}

/**
 * Resolve the consumer units a user may read. Queries the user's roles and the
 * units they are assigned to pay; returns `'all'` for titular/admin.
 */
export async function resolveAccessibleUnitIds(userId: string): Promise<AccessibleUnits> {
    const [user, payerUnits] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { roles: true } }),
        prisma.consumerUnit.findMany({
            where: { payerUserId: userId, deletedAt: null },
            select: { id: true },
        }),
    ])

    const isPayer = user?.roles?.includes(PAYER_ROLE) ?? false
    return computeAccessibleUnitIds(
        payerUnits.map((u) => u.id),
        isPayer,
    )
}

/**
 * Guard for titular-only surfaces (rateio, usinas, geracao, gestao de
 * responsaveis). A payer belongs to the titular's client but must never act on
 * the client as a whole.
 */
export async function assertNotPayer(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { roles: true } })
    if (user?.roles?.includes(PAYER_ROLE)) {
        throw new Error('Esta area e do titular da conta. Voce tem acesso apenas as suas unidades.')
    }
}
