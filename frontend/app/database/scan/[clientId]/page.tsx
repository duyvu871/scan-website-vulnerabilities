// @flow
import * as React from 'react';
import {DatabaseScanTargetPage} from "src/containers/database-scan-target-page";

type Props = {
    params: {
        clientId: string;
    };
};

export default function Page(props: Props) {
    return (
       <DatabaseScanTargetPage clientId={props.params.clientId} />
    );
};