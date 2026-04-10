import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';

const consumptionSchema = z.object({
  competenceDate: z.string(), // ISO string date for month/year e.g. 2023-10-01T00:00:00.000Z
  consumptionKwh: z.number().min(0, "Consumo deve ser positivo"),
  injectedEnergyKwh: z.number().min(0, "Energia injetada deve ser positiva"),
  tariffPerKwh: z.number().min(0, "Tarifa deve ser positiva"),
  totalBillValue: z.number().min(0, "Valor deve ser positivo")
});

const getConsumption = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await AuthMiddleware.extractUserContext(request);

  const { id: clientId } = params;

  const consumptions = await prisma.consumption.findMany({
    where: { clientId },
    orderBy: { competenceDate: 'desc' }
  });

  return NextResponse.json({
    success: true,
    data: consumptions
  });
};

const saveConsumption = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await AuthMiddleware.extractUserContext(request);
  const { id: clientId } = params;

  const body = await request.json();
  const data = consumptionSchema.parse(body);

  const date = new Date(data.competenceDate);
  // Ensure it's the first day of the month for consistency
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  // Upsert the consumption record
  const consumption = await prisma.consumption.upsert({
    where: {
      clientId_competenceDate: {
        clientId,
        competenceDate: startOfMonth,
      }
    },
    update: {
      consumptionKwh: data.consumptionKwh,
      injectedEnergyKwh: data.injectedEnergyKwh,
      tariffPerKwh: data.tariffPerKwh,
      totalBillValue: data.totalBillValue,
    },
    create: {
      clientId,
      competenceDate: startOfMonth,
      consumptionKwh: data.consumptionKwh,
      injectedEnergyKwh: data.injectedEnergyKwh,
      tariffPerKwh: data.tariffPerKwh,
      totalBillValue: data.totalBillValue,
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Consumo salvo com sucesso',
    data: consumption
  });
};

export const GET = withHandle(getConsumption);
export const POST = withHandle(saveConsumption);
