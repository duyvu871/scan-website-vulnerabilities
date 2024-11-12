
import NavigationBar from "src/components/Navbar";
import React from "react";
import Transition from "src/components/Animate/transition";

type MainLayoutProps = {
    children: React.ReactNode;
};

export default function MainLayout({children}: MainLayoutProps) {
    return (
        <main className="dark flex min-h-svh flex-col items-center justify-between p-5 lg:p-24">
            <Transition>
                {children}
            </Transition>
            <NavigationBar />
        </main>
    );
}
