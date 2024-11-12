
import * as React from 'react';
import {DatabaseScanPage} from "src/containers/database-scan-page";
import {ScanHistoryPage} from "src/containers/scan-history-page";

export default function Page() {
    return (
        <ScanHistoryPage type={'database/scan'} title={"Tiến trình quét"} />
    );
};