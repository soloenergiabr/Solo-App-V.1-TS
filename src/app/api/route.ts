import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const users = await prisma.user.findMany();
    return NextResponse.json({
        users
    })
}

export async function POST() {
    const user = await prisma.user.create({ data: { name: "Mateus" } });
    return NextResponse.json({ user });
}