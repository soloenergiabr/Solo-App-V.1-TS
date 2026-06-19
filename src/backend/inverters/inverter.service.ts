import prisma from '@/lib/prisma';
import { decrypt } from '@/backend/crypto/encryption';

export interface InverterWithDecryptedCreds {
    id: string;
    name: string | null;
    serialNumber: string | null;
    provider: string | null;
    providerId: string | null;
    providerApiKey: string | null;
    providerApiSecret: string | null;
    providerUrl: string | null;
    providerPlantId: string | null;
    providerPlantName: string | null;
    clientId: string;
    plantId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Retrieves an inverter by ID and decrypts its sensitive credentials.
 *
 * Verifies that the inverter belongs to the specified client before
 * returning the decrypted data.
 *
 * @param inverterId - The ID of the inverter
 * @param clientId - The client ID for ownership verification
 * @returns The inverter with decrypted providerApiKey and providerApiSecret
 * @throws Error if inverter is not found or not owned by the client
 */
export async function getInverterWithCredentials(
    inverterId: string,
    clientId: string
): Promise<InverterWithDecryptedCreds> {
    const inverter = await prisma.inverter.findFirst({
        where: {
            id: inverterId,
            clientId,
            deletedAt: null,
        },
    });

    if (!inverter) {
        throw new Error('Inversor nao encontrado');
    }

    // Decrypt credentials if they are encrypted
    const decryptedKey = inverter.providerApiKey
        ? tryDecrypt(inverter.providerApiKey)
        : null;

    const decryptedSecret = inverter.providerApiSecret
        ? tryDecrypt(inverter.providerApiSecret)
        : null;

    return {
        id: inverter.id,
        name: inverter.name,
        serialNumber: inverter.serialNumber,
        provider: inverter.provider,
        providerId: inverter.providerId,
        providerApiKey: decryptedKey,
        providerApiSecret: decryptedSecret,
        providerUrl: inverter.providerUrl,
        providerPlantId: inverter.providerPlantId,
        providerPlantName: inverter.providerPlantName,
        clientId: inverter.clientId,
        plantId: inverter.plantId,
        createdAt: inverter.createdAt,
        updatedAt: inverter.updatedAt,
    };
}

/**
 * Attempts to decrypt a value. If it's not in encrypted format,
 * returns the original value as-is (for backward compatibility
 * with existing plaintext credentials).
 */
function tryDecrypt(value: string): string {
    try {
        return decrypt(value);
    } catch {
        // If decryption fails, assume it's plaintext (legacy data)
        return value;
    }
}
