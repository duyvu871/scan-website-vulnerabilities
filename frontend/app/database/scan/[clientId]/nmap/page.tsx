import * as React from 'react';
import {NmapScanner} from "src/containers/database-scan/nmap-scanner";

type Props = {
    params: {
        clientId: string;
    };
};

export default function Page(props: Props) {
    return (
       <NmapScanner clientId={props.params.clientId}/>
    );
};