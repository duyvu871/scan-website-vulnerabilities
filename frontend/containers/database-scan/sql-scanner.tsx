"use client";

import * as React from 'react';
import {Input} from "src/components/ui/input";
import {Button} from "src/components/ui/button";
import {useEffect, useRef, useState} from "react";
import {io, Socket} from "socket.io-client";
import {ScanProgress, ScanResult} from "src/types/services/api";
import Terminal from "src/components/terminal";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from 'src/components/ui/select';
import useUID from "src/hooks/useUID";
import {useToast} from "src/hooks/useToast";
import {cn} from "src/utils/tailwind";
import {Slider} from "src/components/ui/slider";

const scoreLabelStyle = {
    "F": {
        color: "text-red-600",
        bg: "bg-red-600"
    },
    "E": {
        color: "text-red-500",
        bg: "bg-red-500"
    },
    "D": {
        color: "text-yellow-400",
        bg: "bg-yellow-400"
    },
    "C": {
        color: "text-yellow-600",
        bg: "bg-yellow-600"
    },
    "B": {
        color: "text-green-500",
        bg: "bg-green-500"
    },
    "A": {
        color: "text-green-300",
        bg: "bg-green-300"
    }
}

type ScoreLabel = keyof typeof scoreLabelStyle;

type Content = {
    detail?: {
        process: string;
        percentage: string;
    };
    request: string;
    response: string;
}

export function SqlScanner({clientId}: {clientId: string}) {
    const [scanning, setScanning] = useState<boolean>(false);
    const {error: showError} = useToast()

    const ioRef = useRef<Socket | null>(null);
    const isMounted = useRef<boolean>(false);
    const [content, setContent] = React.useState<Content[]>([]);
    const [latestCommand, setLatestCommand] = useState<Content | null>(null);

    const [method, setMethod] = React.useState("get");
    const [genUID] = useUID();

    const [scanComplete, setScanComplete] = useState<{percentage: number, message: string; pointMarked: ScoreLabel} | null>(null)

    const [url, setUrl] = React.useState<string>('');
    const [headers, setHeaders] = React.useState<string>('');
    const [params, setParams] = React.useState<string>('');
    const [body, setBody] = React.useState<string>('');
    const [path, setPath] = React.useState<string>('');

    const [loadingSocket, setLoadingSocket] = useState<boolean>(true);
    const appendContent = (data: Content) => {
        setContent((prev) => [...prev, data]);
        if (data.detail) {
            setLatestCommand(data);
        }
    }

    const startScan = () => {
        if (ioRef.current) {
            console.log('start scan');
            console.log(ioRef.current);
            setScanComplete(null);
            ioRef.current.emit('start_sql_injection_scan', JSON.stringify({
                url,
                method,
                headers,
                params,
                body,
                path
            }));
        }
    }

    const fillExample = () => {
        setUrl('https://kenh14.vn/tim-kiem.chn');
        setMethod('get');
        setParams('keyword: đất đai')
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
            ioRef.current = io(`http://localhost:${socketInfo.port}/feature/sql-injection`, {
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
            ioRef.current.on('complete', (data: {percentage: number, message: string; pointMarked: ScoreLabel}) => {

                setScanComplete(data);
                console.log('complete', data);
            });
            ioRef.current.on('progress', (progress: Content) => {
                appendContent(progress);
                console.log('progress:', progress);
            });
        });
        isMounted.current = true;

        return () => {
            if (ioRef.current) {
                ioRef.current.disconnect();
            }
        }
    }, []);

    return (
        <div className={"w-full h-full flex flex-col justify-center gap-10 pb-24"}>
            <div className={'w-full flex flex-col items-center gap-5'}>
                 <span className="flex flex-col gap-2 w-full max-w-xl">
                    <p className={"text-3xl font-semibold"}>Quét lỗ hổng SQL Injection</p>
                     {/*<p className={"text-lg text-zinc-400"}>*/}
                     {/*    Xem quá trình phân tích và kết quả của bạn*/}
                     {/*</p>*/}
                </span>
                {!loadingSocket && (
                    <>
                        <div>
                            <Button onClick={fillExample}
                                    className={"w-full max-w-lg border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors py-5"}>Sử
                                dụng ví dụ</Button>
                        </div>
                        <div className={"max-w-xl w-full"}>
                            <Input
                                value={url}
                                onChange={(text) => {
                                    setUrl(text.target.value)
                                }}
                                className={"border-zinc-700 bg-zinc-900"} type="text"
                                placeholder="Url: https://google.com/"/>
                            <div className={"text-lg py-3"}>
                                Tham số tùy chỉnh
                            </div>
                            <div className={"flex flex-col gap-5"}>
                                <div>
                                    <span className={"text-xs"}>Method:</span>
                                    <Select defaultValue="get" value={method} onValueChange={(v) => {
                                        setMethod(v);
                                        console.log(v)
                                    }}>
                                        <SelectTrigger className="w-[180px] border-zinc-700">
                                            <SelectValue placeholder="Chọn phương thức"/>
                                        </SelectTrigger>
                                        <SelectContent className={"bg-zinc-900 border-zinc-700"}>
                                            {/*<SelectGroup>*/}
                                            {/*    <SelectLabel>Phương thức</SelectLabel>*/}
                                            <SelectItem value="get">GET</SelectItem>
                                            <SelectItem value="post">POST</SelectItem>
                                            <SelectItem value="update">UPDATE</SelectItem>
                                            <SelectItem value="put">PUT</SelectItem>
                                            <SelectItem value="options">OPTIONS</SelectItem>
                                            {/*</SelectGroup>*/}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className={"flex flex-col"}>
                                    <div className={"flex justify-center items-center w-full gap-2"}>
                                        <span className={"text-xs"}>Headers:</span>
                                        <Input
                                            value={headers}
                                            onChange={(text) => {
                                                setHeaders(text.target.value)
                                            }}
                                            className={"border-zinc-700 bg-zinc-900"} type="text"
                                            placeholder="Authorization: Bearer <token>, ..."/>
                                    </div>
                                    <div className={"text-[12px] text-zinc-500"}>
                                        (tùy chọn) ví
                                        dụ: {'Authorization: Bearer <token>'}, {'Content-type: application/*'}
                                    </div>
                                </div>
                                <div className={"flex flex-col"}>
                                    <div className={"flex justify-center items-center w-full gap-2"}>
                                        <span className={"text-xs"}>Params:</span>
                                        <Input
                                            value={params}
                                            onChange={(text) => {
                                                setParams(text.target.value)
                                            }}
                                            className={"border-zinc-700 bg-zinc-900"} type="text"
                                            placeholder="query: 2024, page: 1..."/>
                                    </div>
                                    <div className={"text-xs text-zinc-500"}>
                                        (tùy chọn) ví dụ: {'query: 2024'}, {'page: 1'}
                                        {' -> query=2024&page=1'}
                                    </div>
                                </div>
                                <div className={"flex flex-col"}>
                                    <div className={"flex justify-center items-center w-full gap-2"}>
                                        <span className={"text-xs"}>Body:</span>
                                        <Input
                                            value={body}
                                            onChange={(text) => {
                                                setBody(text.target.value)
                                            }}
                                            className={"border-zinc-700 bg-zinc-900"} type="text"
                                            placeholder="password: 123, username: admin"/>
                                    </div>
                                    <div className={"text-[12px] text-zinc-500"}>
                                        (tùy chọn) ví dụ: {'password: 123, username: admin'}
                                        hay được dùng cho đăng nhập và các tác vụ cập nhật dữ liệu, tạo mới, xóa
                                    </div>
                                </div>
                                <div className={"flex flex-col"}>
                                    <div className={"flex justify-center items-center w-full gap-2"}>
                                        <span className={"text-xs"}>Đường dẫn:</span>
                                        <Input
                                            value={path}
                                            onChange={(text) => {
                                                setPath(text.target.value)
                                            }}
                                            className={"border-zinc-700 bg-zinc-900"} type="text"
                                            placeholder="/api/v1/login"/>
                                    </div>
                                    <div className={"text-[12px] text-zinc-500"}>
                                        (tùy chọn) ví dụ: {'/api/v1/login'}, {'/api/v1/user'}
                                        {' -> https://google.com/api/v1/login'}
                                    </div>
                                </div>
                            </div>
                            <div className={"my-5"}>
                                <Button
                                    onClick={startScan}
                                    className={"w-full border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors py-5"}>Quét</Button>
                            </div>
                        </div>
                        <div className={"w-full max-w-xl flex flex-col gap-5"}>
                            <div className={"w-full flex flex-col gap-5 justify-center items-center"}>
                                {scanComplete && (
                                    <>
                                        <div
                                            className={cn("w-28 h-28 aspect-square md:w-32 md:h-32 rounded-lg flex justify-center items-center", scoreLabelStyle[scanComplete.pointMarked].bg)}>
                                    <span
                                        className={"text-8xl md:text-9xl font-semibold"}>{scanComplete.pointMarked}</span>
                                        </div>
                                        {/*<div>*/}
                                        {/*    <span*/}
                                        {/*        className={"text-3xl md:text-4xl font-semibold"}>{scanComplete.percentage || "8"}%</span>*/}
                                        {/*</div>*/}
                                        <div
                                            className={cn("flex flex-col justify-center items-start", scoreLabelStyle[scanComplete.pointMarked].color)}>
                                    <span
                                        className={"text-xl md:text-2xl font-bold uppercase"}>{scanComplete.message}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div
                                className="flex flex-col h-fit w-full max-w-2xl bg-[#1e1e1e] rounded-lg overflow-hidden font-mono text-white">
                                <div className={"flex flex-col p-4 pb-0 gap-1"}>
                                    {latestCommand?.detail && (
                                        <>
                                            <div className={"flex gap-2"}>
                                                <span className={"text-sm"}>Tiến trình: {latestCommand.detail.process}</span>
                                                <span className={"text-sm"}>{latestCommand.detail.percentage + "%"}</span>
                                            </div>
                                            <Slider color={"red"} defaultValue={[0]} step={1}
                                                    value={[parseInt(latestCommand.detail.percentage)]} max={100}/>
                                        </>
                                    )}
                                </div>
                                <div className="flex-1 overflow-auto p-4">
                                    <div className="space-y-2 w-fit">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#9cdcfe] text-sm">user@terminal</span>
                                            <span className="text-[#ce9178] text-sm">~</span>
                                            <span className="animate-blink text-[#d4d4d4] text-sm"></span>
                                        </div>
                                        {content.slice(content.length - 5, content.length - 1).map(({
                                                                                                        request,
                                                                                                        response
                                                                                                    }, index) => (
                                            <>
                                                <div key={genUID()} className="items-center gap-2">
                                                    <span className="text-[#9cdcfe] text-xs">$</span>
                                                    <span className="text-[#ce9178] text-xs mx-1">~</span>
                                                    {/*<span className="animate-blink text-[#d4d4d4]">_</span>*/}
                                                    <span className={"text-xs"}>{request}</span>
                                                </div>
                                                <div key={genUID()} className="items-center gap-2">
                                                    <span className="text-[#9cdcfe] text-xs">$</span>
                                                    <span className="text-[#ce9178] text-xs mx-1">~</span>
                                                    {/*<span className="animate-blink text-[#d4d4d4]">_</span>*/}
                                                    <span className={"text-xs"}>{response}</span>
                                                </div>
                                            </>
                                        ))}
                                        <div className="items-center gap-2">
                                            <span className="text-[#9cdcfe] text-xs">$</span>
                                            <span className="text-[#ce9178] text-xs mx-1">~</span>
                                            {/*<span className="animate-blink text-[#d4d4d4]">_</span>*/}
                                            <span className={"text-xs"}>_</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>);
};