import React from 'react';
import {useAtom} from "jotai/index";
import {technologiesAtom} from "src/states/target-page";
import {ThirdPartyApi} from "src/global/contants/third-party-api";
import Image from "next/image";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "src/components/ui/accordion";
import useUID from "src/hooks/useUID";
import RotateLoader from "src/components/Loader/spinner";
import {MdTranslate} from "react-icons/md";
import Tooltip from "src/components/tooltip";

function TechnologiesList() {
    const [technologies] = useAtom(technologiesAtom);
    const [genID] = useUID();

    if (!technologies) {
        return null;
    }
    const resolveIconPath = (name: string) => {
        return ThirdPartyApi.wrappalyzerIcon + name;
    }

    return (
        <div className={"flex flex-col bg-zinc-950 rounded-xl border border-zinc-700"}>
            <div className={"w-full px-4 py-4 font-semibold uppercase border-b border-zinc-700"}>Công nghệ sử dụng</div>
            <Accordion type="single" collapsible className="w-full p-4">
                {!technologies && (
                    <RotateLoader />
                )}
                {technologies && technologies.length === 0 && (
                    <div className="text-center text-zinc-300">Không có dữ liệu</div>
                )}
                {technologies && technologies.map((technology, index) => (
                    <AccordionItem key={genID()} value={technology.name} className={"border-zinc-800"}>
                        <AccordionTrigger className={"hover:no-underline"}>
                            <div className={"flex flex-col gap-2"}>
                                <div className={"group flex flex-row justify-start items-center gap-2"}>
                                    <Image className={"w-6 h-6"} width={50} height={50} unoptimized
                                           src={resolveIconPath(technology.icon)} alt={technology.name}/>
                                    <div className={"flex flex-col justify-start items-start"}>
                                        <div className={"text-sm font-semibold group-hover:underline"}>{technology.name}</div>
                                        <div className={"text-xs text-zinc-500"}>{technology.version}</div>
                                    </div>
                                </div>
                                <div className={"flex flex-wrap gap-1"}>
                                    <div key={`category-${genID()}`}
                                         className={"text-[12px] font-semibold p-1 no-underline"}>
                                        <p className={"leading-[1]"}>Loại</p>
                                    </div>
                                    {technology.categories.map((category, index) => (
                                        <div key={`category-${genID()}`}
                                             className={"hover:underline text-[10px] text-zinc-300 bg-zinc-900 p-1 border border-zinc-800 rounded-full"}>
                                            <p className={"leading-[1]"}>{category.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className={"flex justify-start gap-2"}>
                            <div className={"flex flex-col gap-2"}>
                                <Tooltip title={"Translate"}>
                                    <div
                                        className={"cursor-pointer w-6 h-6 aspect-square flex justify-center items-center bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-900 dark:text-zinc-100 rounded-lg transition-colors"}>
                                        <MdTranslate/>
                                    </div>
                                </Tooltip>
                                <div></div>
                            </div>
                            <div className={"text-xs text-zinc-300"}>{technology.description}</div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}

export default TechnologiesList;