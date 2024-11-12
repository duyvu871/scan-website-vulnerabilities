import {ReactNode, useEffect, useState} from "react";
import useUID from "src/hooks/useUID";
import {Slider} from "src/components/ui/slider";
import moment from "moment";

export type TerminalProps = {
    commands: {
        time:number,
        command:string|ReactNode,
        process: string,
        percent: string,
        remaining: string
    }[];
}

export default function Terminal({commands}: TerminalProps) {
    const [genUID] = useUID();
    const latestCommand = commands[commands.length - 1];

    return (
        <div className="flex flex-col h-fit w-full max-w-2xl bg-[#1e1e1e] rounded-lg overflow-hidden font-mono text-white">
            <div className={"flex flex-col p-4 pb-0 gap-1"}>
                {latestCommand && (
                    <>
                        <div className={"flex gap-2"}>
                            <span className={"text-sm"}>Tiến trình: {latestCommand?.process}</span>
                            <span className={"text-sm"}>{latestCommand.percent + "%"}</span>
                        </div>
                        <Slider color={"red"} defaultValue={[0]} step={1} value={[parseInt(latestCommand?.percent)]} max={100}/>
                    </>
                )}
            </div>
            <div className="flex-1 overflow-auto p-4">
                <div className="space-y-2">
                <div className="flex items-center gap-2">
                        <span className="text-[#9cdcfe] text-sm">user@terminal</span>
                        <span className="text-[#ce9178] text-sm">~</span>
                        <span className="animate-blink text-[#d4d4d4] text-sm"></span>
                    </div>
                    {commands.slice(commands.length - 5, commands.length - 1).map(({time, command}, index) => (
                        <div key={genUID()} className="items-center gap-2">
                            <span className="text-[#9cdcfe] text-[10px]">
                                {moment(time).format("HH:mm:ss")}
                            </span>
                            <span className="text-[#9cdcfe] text-xs">$</span>
                            <span className="text-[#ce9178] text-xs mx-1">~</span>
                            {/*<span className="animate-blink text-[#d4d4d4]">_</span>*/}
                            <span className={"text-xs"}>{command}</span>
                        </div>
                    ))}
                    <div className="items-center gap-2">
                        <span className="text-[#9cdcfe] text-xs">$</span>
                        <span className="text-[#ce9178] text-xs mx-1">~</span>
                        {/*<span className="animate-blink text-[#d4d4d4]">_</span>*/}
                        <span className={"text-xs"}>_</span>
                    </div>
                </div>
            </div>
            {/*<div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2">*/}
            {/*    <span className="text-[#9cdcfe]">user@terminal</span>*/}
            {/*    <span className="text-[#ce9178]">~</span>*/}
            {/*    <span className="animate-blink text-[#d4d4d4]">_</span>*/}
            {/*    <input type="text" className="bg-transparent outline-none flex-1" placeholder="Enter command" />*/}
            {/*</div>*/}
        </div>
    )
}