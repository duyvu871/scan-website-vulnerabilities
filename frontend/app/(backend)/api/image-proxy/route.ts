
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams;
    const imageUrl = query.get('url');
    if (!imageUrl) {
        return new Response("Missing 'url' query parameter", { status: 400 });
    }
    try {

        // Fetch the image from the external source
        const response = await fetch(imageUrl);

        // Error handling if the image is not found
        if (!response.ok) {
            return new Response(`Error fetching image: ${response.status}`, { status: response.status });
        }

        // Get the image content type and buffer
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type');

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