import * as React from 'react';
import {io, Socket} from 'socket.io-client';
import {useEffect, useRef, useState} from "react";
import {Button} from "src/components/ui/button";
import {useAtom} from "jotai/index";
import {clientIdAtom} from "src/states/target-page";
import Terminal from "src/components/terminal";
import {ScanProgress, ScanResult} from "src/types/services/api";
import {useToast} from "src/hooks/useToast";
import useUID from "src/hooks/useUID";
import RotateLoader from "src/components/Loader/spinner";
import moment from 'moment';

export function ScanNetworkMap() {
    const [clientId] = useAtom(clientIdAtom);
    const {error: showError} = useToast()
    const ioRef = useRef<Socket | null>(null);
    const isMounted = useRef<boolean>(false);
    const [content, setContent] = React.useState<ScanProgress[]>([]);
    const [scanCompleteResult, setScanCompleteResult] = useState<ScanResult | null>(null);
    const [loadingSocket, setLoadingSocket] = useState<boolean>(true);
    const resultsRef = useRef<HTMLDivElement>(null);

    const [genUID] = useUID();

    const appendContent = (data: ScanProgress) => {
        setContent((prev) => [...prev, data]);
    }

    const startScan = () => {
        if (ioRef.current && clientId) {
            console.log('start scan');
            console.log(ioRef.current);
            setScanCompleteResult(null);
            ioRef.current.emit('start_nmap_scan', JSON.stringify({clientId}));
        }
    }

    useEffect(() => {
        setLoadingSocket(true);
        window.websocket.socketInfo().then((socketInfo) => {
            if (!socketInfo) {
                showError('Không thể kết nối đến máy chủ quét, vui lòng thử lại sau');
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
                return;
            }
            setLoadingSocket(false);
            ioRef.current = io(`http://localhost:${socketInfo.port}/feature/nmap`, {
                transports: ["websocket"], // use websocket only
                addTrailingSlash: false, // remove trailing slash
                path: '/socket/socket.io',
            });

            ioRef.current.on('connect', () => {
                console.log('socket connected');
            });

            ioRef.current.on('disconnect', () => {
                console.log('socket disconnected');
            });
            ioRef.current.on('connect_error', (error) => {
                showError('Lỗi kết nối Socket.IO, vui lòng refresh lại trang');
                console.error('Lỗi kết nối Socket.IO:', error);
            });
            ioRef.current.on('complete', (data: ScanResult['result']) => {
                setScanCompleteResult({
                    result: data
                });
                console.log('complete', data);
            });
            ioRef.current.on('progress', (progress) => {
                appendContent(progress);
                console.log('progress:', progress);
            });
            // ioRef.current.on('start_nmap_scan', (data: ScanProgress) => {
            //     appendContent(data);
            // });
        });
        return () => {
            if (ioRef.current) {
                ioRef.current.disconnect();
            }
        }
    }, []);

    useEffect(() => {
        if (scanCompleteResult) {
            const latestContent = content[content.length - 1];
            if (latestContent && parseInt(latestContent.percent) < 100) {
                appendContent({
                    task: 'Hoàn thành',
                    percent: "100",
                    remaining: "0",
                    time: "0",
                    etc: String(new Date())
                });
            }
        }
    }, [scanCompleteResult, content]);

    return (
        <div className={"w-full flex justify-center"}>
            <div className={"w-full flex flex-col justify-center gap-5 max-w-xl"}>
                {loadingSocket ? (
                    <RotateLoader />
                ) : (
                    <>
                        <Button className={"border-zinc-700 bg-zinc-900 py-2"} onClick={startScan}>Scan Network Map</Button>
                        <div>
                            <Terminal commands={content.map(item => (
                                {
                                    process: item.task,
                                    percent: item.percent,
                                    remaining: item.remaining,
                                    time: Number(item.time),
                                    command: `[${
                                        moment(item.etc ? parseInt(item.etc)*1000 : new Date().getTime()).format('h:mm:ss')
                                    }] tiến trình: ${item.task}, còn lại: ${item.remaining}, tỉ lệ:${item.percent}%`
                                }
                            ))}/>
                        </div>
                        <div>
                            {scanCompleteResult && (
                                scanCompleteResult.result.map((item, index) => (
                                    <div key={genUID()} className={"rounded-xl bg-zinc-900 p-4 flex-col gap-5"}>
                                        <div className={"flex flex-col gap-1"}>
                                   <span className={"text-sm flex gap-1"}>
                                       <p className={"font-semibold"}>Host:</p>
                                       <p className={"text-zinc-300"}>{item.hostname}</p>
                                   </span>
                                            <span className={"text-sm flex gap-1"}>
                                       <p className={"font-semibold"}>IP:</p>
                                       <p className={"text-zinc-300"}>{item.ip}</p>
                                   </span>
                                            {item.osNmap && (
                                                <span className={"text-sm flex gap-1"}>
                                                       <p className={"font-semibold"}>HĐH mạng:</p>
                                                       <p className={"text-zinc-300"}>{item.osNmap}</p>
                                                   </span>
                                            )}
                                        </div>
                                        <div className={"mt-5"}>
                                            <div className={"text-sm font-semibold"}>Cổng mở</div>
                                            <div className={"flex flex-col gap-1"}>
                                                <table className={"w-full h-full p-0 border-spacing-0 table-fixed"}>
                                                    <colgroup>
                                                        <col className={"w-[47%]"} />
                                                        <col className={"w-[33%]"}/>
                                                        <col className={"w-[20%]"}/>
                                                    </colgroup>
                                                    <tbody className={"w-full align-baseline"}>
                                                    <tr className={"border-b dark:border-zinc-800 border-zinc-200 align-baseline text-left"}>
                                                        <th className={"text-xs md:text-sm py-3 px-2 break-words hyphens-auto "}>
                                                            Dịch vụ
                                                        </th>
                                                        <th className={"text-xs md:text-sm py-3 px-2 break-words hyphens-auto "}>
                                                            Giao thức
                                                        </th>
                                                        <th className={"text-xs md:text-sm py-3 px-2 md:pl-6 text-wrap hyphens-auto align-middle"}>
                                                            Cổng
                                                        </th>
                                                    </tr>
                                                    {item.openPorts.map((port, index) => (
                                                        <tr key={genUID()}
                                                            className={"border-b dark:border-zinc-800 border-zinc-200 align-baseline text-left"}>
                                                            <td className={"text-xs md:text-sm py-3 px-2 break-words hyphens-auto text-zinc-200"}>
                                                                {port.service || "Không xác định"}
                                                            </td>
                                                            <td className={"text-xs md:text-sm py-3 px-2 break-words hyphens-auto text-zinc-200"}>
                                                                {port.protocol}
                                                            </td>
                                                            <th className={"text-xs md:text-sm py-3 px-2 md:pl-6 text-wrap hyphens-auto align-middle"}>{port.port}</th>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>

    );
};