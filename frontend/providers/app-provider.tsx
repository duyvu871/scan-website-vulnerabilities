import React from 'react';
import { Provider as JotaiProvider } from 'jotai';
import TanstackQueryProvider from "src/app/provider";

interface AppProviderProps {
    children: React.ReactNode;
};

function ReactQueryDevtools() {
    return null;
}

function AppProvider({children}: AppProviderProps) {
    return (
        <TanstackQueryProvider>
            <JotaiProvider>
                {children}
            </JotaiProvider>
        </TanstackQueryProvider>
    );
}

export default AppProvider;