import { z } from 'zod';

export const credentialsSchema = z.object({
    email: z.string().trim().min(1),
    password: z.string().min(1),
});

export const linkUnitSchema = z.object({
    source: z.enum(['pessoa', 'empresa', 'inbox']),
    credentials: credentialsSchema.optional(),
    backfill: z.number().int().min(0).max(24).optional(),
}).refine(
    (data) => (data.source === 'inbox') === !data.credentials,
    { message: 'credentials sao obrigatorias para pessoa/empresa e proibidas para inbox', path: ['credentials'] },
);

export const updateUnitSchema = z.object({
    status: z.enum(['active', 'paused']).optional(),
    credentials: credentialsSchema.optional(),
}).refine((data) => data.status || data.credentials, { message: 'Informe status ou credentials' });

export const backfillSchema = z.object({ months: z.number().int().min(1).max(24) });

export const createConnectionSchema = z.object({
    source: z.enum(['pessoa', 'empresa']),
    credentials: credentialsSchema,
});

export const updateConnectionSchema = z.object({ credentials: credentialsSchema });

export const monitorUnitsSchema = z.object({
    ucs: z.array(z.string().trim().min(1)).min(1),
    plantId: z.string().min(1).optional(),
    backfill: z.number().int().min(0).max(24).optional(),
});

export const assignConnectionSchema = z.object({ clientId: z.string().min(1) });
export const assignUnitSchema = z.object({ consumerUnitId: z.string().min(1) });
