'use client';
import * as React from 'react';
import {useEffect} from "react";
import moment from "moment";
import 'moment/locale/vi';
import {IoIosArrowForward} from "react-icons/io";
import Link from "next/link";
import useUID from "src/hooks/useUID";
moment.locale('vi');

export function ScanHistoryPage({type, title}: { type: string;title: string }) {
    const [scanHistory, setScanHistory] = React.useState<{ url: string, status: string, clientId: string, timestamp: number}[]>([]);
    const [genUID] = useUID();
    useEffect(() => {
       window.api.databaseAccess.list().then((history) => {
           if (history.length) {
               setScanHistory(history.map((scan) => ({
                     url: scan.url,
                     status: scan.status || "pending",
                     clientId: scan.clientId || "",
                     timestamp: scan.timestamp || Date.now(),
                })));
           }
       });
    }, []);
    return (
        <div className={"w-full h-full flex flex-col gap-10 pb-24 overflow-hidden"}>
            <div className={'w-full flex flex-col gap-5 items-center'}>
                 <span className="flex flex-col gap-2">
                    <p className={"text-3xl font-semibold"}>{title}</p>
                    <p className={"text-xl text-zinc-400"}>
                    </p>
                </span>
            </div>
            <div className={"flex flex-col items-center gap-5"}>
                {scanHistory.length === 0 && (
                    <div>Không có lịch sử quét</div>
                )}
                {scanHistory.map((scan, index) => (
                    <div key={genUID()} className={"w-full flex justify-between bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden p-3"}>
                        <div className={"flex flex-col items-start gap-2"}>
                            <div className={"align-middle text-xs md:text-lg"}>
                               URL: <span className={"text-blue-500 cursor-pointer hover:underline"}>{scan.url}</span>
                            </div>
                            <div className={"flex flex-col gap-1"}>
                            <div className={"align-middle text-[10px] md:text-sm"}>
                                    Trạng thái:
                                    <span className={"ml-1 font-bold"}>{scan.status}</span>
                                </div>
                                <div className={"align-middle text-[10px] md:text-sm"}>
                                    ID: <span className={"text-zinc-500 dark:text-zinc-400"}>{scan.clientId}</span>
                                </div>
                                <div className={"align-middle text-[10px] md:text-sm"}>
                                    <span className={"text-zinc-400"}>{moment(scan.timestamp).startOf('hour').fromNow()}</span>
                                </div>
                            </div>
                        </div>
                        <div className={"flex align-middle"}>
                            <Link href={`/${type}/${scan.clientId}`} passHref>
                                <div
                                    className={"w-8 h-8 flex justify-center items-center rounded-lg bg-zin-900 cursor-pointer hover:bg-zinc-700 transition-colors"}>
                                    <IoIosArrowForward className={"text-sm md:text-lg"}/>
                                </div>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};