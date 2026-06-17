import prisma from '@/lib/prisma'

/**
 * The set of consumer units a user may read.
 * - `'all'` means no unit-level restriction (titular / admin): scope by clientId.
 * - `string[]` is the explicit list of consumer unit ids a payer may read.
 */
export type AccessibleUnits = string[] | 'all'

/**
 * Pure scope decision: given the consumer unit ids a user pays for, decide the
 * accessible set. A user with no payer units is treated as titular/admin and
 * gets `'all'`; a user assigned as payer is restricted to exactly those units.
 */
export function computeAccessibleUnitIds(payerUnitIds: string[]): AccessibleUnits {
    return payerUnitIds.length > 0 ? payerUnitIds : 'all'
}

/**
 * Resolve the consumer units a user may read. Queries the units this user is
 * assigned to pay; returns `'all'` for titular/admin (no payer assignments).
 */
export async function resolveAccessibleUnitIds(userId: string): Promise<AccessibleUnits> {
    const payerUnits = await prisma.consumerUnit.findMany({
        where: { payerUserId: userId, deletedAt: null },
        select: { id: true },
    })
    return computeAccessibleUnitIds(payerUnits.map((u) => u.id))
}
