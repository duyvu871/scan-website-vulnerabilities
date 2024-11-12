import React from 'react';
import TargetPage from "src/containers/target-page";

interface PageProps {
    params: {
        clientId: string;
    };
};

function Page({params}: PageProps) {
    return (
        <TargetPage clientId={params.clientId} />
    );
}

export default Page;