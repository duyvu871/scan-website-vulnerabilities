import { NextResponse, NextRequest } from "next/server";

// Danh sách các origin được phép
const allowedOrigins = [
    'http://localhost:3999',
    'url-scanner-frontend.vercel.app',
];

// Hàm tạo Content-Security-Policy header
const generateCSPHeader = (nonce: string) => {
    return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();
};

export function middleware(req: NextRequest) {
    // Khởi tạo response
    const res = NextResponse.next();

    // Tạo nonce và CSP header
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const cspHeader = generateCSPHeader(nonce);

    // Lấy origin từ request header
    const origin = req.headers.get("origin") || '';

    // Thiết lập CORS headers
    if (allowedOrigins.includes(origin)) {
        res.headers.set('Access-Control-Allow-Origin', origin);
    }
    res.headers.set('Access-Control-Allow-Credentials', "true");
    res.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    res.headers.set(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Thiết lập CSP header và nonce
    res.headers.set('Content-Security-Policy', cspHeader);
    res.headers.set('x-nonce', nonce);

    return res;
}

// // Áp dụng middleware cho các request đến /api/*
// export const config = {
//     matcher: '/*',
// };