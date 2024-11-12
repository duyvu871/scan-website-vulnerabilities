import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams;
    const imagePath = query.get('path');
    if (!imagePath) {
        return new Response("Missing 'url' query parameter", { status: 400 });
    }
    try {
        const imageBuffer = await fs.promises.readFile(imagePath);
        const contentType = 'image/png';

        // Cache the image on the Edge Network for optimal performance
        const oneDayInSeconds = 60 * 60 * 24;
        return new Response(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType || 'image/png',
                'Cache-Control': `public, max-age=${oneDayInSeconds}, immutable`,
            },
        });
    } catch (error) {
        console.error('Error fetching or caching users: ', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}