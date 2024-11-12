declare global {
    namespace NodeJS {
        interface ProcessEnv {
            API_ENDPOINT: string;
            NEXT_PUBLIC_API_BASE_URL: string;
        }
    }
}

export {};