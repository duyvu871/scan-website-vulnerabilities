// @flow
import * as React from 'react';
import {SqlScanner} from "src/containers/database-scan/sql-scanner";

type Props = {
    params: {
        clientId: string;
    };
};

export default function Page(props: Props) {
    return (
        <SqlScanner clientId={props.params.clientId} />
    );
};