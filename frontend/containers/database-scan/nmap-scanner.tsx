"use client";
import * as React from 'react';
import {ScanNetworkMap} from "src/components/ScanSections/scan-network-map";
import {useAtom} from "jotai/index";
import {clientIdAtom, clientStatusAtom} from "src/states/target-page";
import {useLayoutEffect} from "react";
import apiAlternative from "src/lib/axios";
import moment from "moment";
import 'moment/locale/vi';
moment.locale("vi");

type Props = {
    clientId: string;
};

export function NmapScanner({clientId}: Props) {
    const [, setClient] = useAtom(clientIdAtom);
    const [clientStatus, setClientStatusAtom] = useAtom(clientStatusAtom);

    const isMounted = React.useRef(false);

    const checkClientStatus = async (clientId: string) => {
        const clientStatus = await apiAlternative.v1.getScanStatus(clientId);
        if (clientStatus && !clientStatus.error) {
            // setClientStatus(result);
            setClientStatusAtom(clientStatus);
        }
        return clientStatus;
    }

    useLayoutEffect(() => {
        setClient(clientId);
        // // if (!isMounted.current) {
        checkClientStatus(clientId).then((res) => {});
        // // }
        isMounted.current = true;
    }, [clientId]);

    return (
        <div className={"w-full h-full flex flex-col justify-center gap-10 pb-24"}>
            <div className={'w-full flex flex-col items-center gap-5'}>
                 <span className="flex flex-col gap-2 w-full max-w-xl">
                    <p className={"text-3xl font-semibold"}>Quét mạng lưới network</p>
                    {/*<p className={"text-lg text-zinc-400"}>*/}
                    {/*    Xem quá trình phân tích và kết quả của bạn*/}
                    {/*</p>*/}
                </span>
                <div className={"max-w-xl w-full"}>
                    {clientStatus && (
                        <div className={"w-full flex justify-between bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden p-3"}>
                            <div className={"flex flex-col items-start gap-2"}>
                                <div className={"align-middle text-xs md:text-lg"}>
                                   URL: <span className={"text-blue-500 cursor-pointer hover:underline"}>{clientStatus.url}</span>
                                </div>
                                <div className={"flex flex-col gap-1"}>
                                    {/*<div className={"align-middle text-[10px] md:text-sm"}>*/}
                                    {/*    Trạng thái:*/}
                                    {/*    <span className={"ml-1 font-bold"}>{clientStatus.status}</span>*/}
                                    {/*</div>*/}
                                    <div className={"align-middle text-[10px] md:text-sm"}>
                                        ID: <span className={"text-zinc-500 dark:text-zinc-400"}>{clientId}</span>
                                    </div>
                                    <div className={"align-middle text-[10px] md:text-sm"}>
                                        <span className={"text-zinc-400 capitalize"}>{moment(clientStatus.timestamp).format("LLLL")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ScanNetworkMap/>
        </div>
    );
};