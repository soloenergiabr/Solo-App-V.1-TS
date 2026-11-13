import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';

const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const MAX_BYTES = 5 * 1024 * 1024;

// Upload de imagens das ofertas do clube: so admin, so imagem.
export async function POST(request: NextRequest) {
    try {
        await AuthMiddleware.requireRole(request, 'master');
    } catch {
        return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'Nenhum arquivo enviado' },
                { status: 400 }
            );
        }

        const ext = IMAGE_TYPES[file.type];
        if (!ext || file.size > MAX_BYTES) {
            return NextResponse.json(
                { success: false, message: 'Envie uma imagem JPG, PNG, WEBP ou GIF de até 5MB' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const baseName = file.name.replace(/\.[^.]*$/, '').replace(/[^a-zA-Z0-9-]/g, '_').slice(0, 60);
        const filename = `${timestamp}_${baseName}.${ext}`;
        const filepath = join(uploadsDir, filename);

        await writeFile(filepath, buffer);

        const url = `/uploads/${filename}`;

        return NextResponse.json({
            success: true,
            data: { url, filename }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, message: 'Erro ao fazer upload' },
            { status: 500 }
        );
    }
}
