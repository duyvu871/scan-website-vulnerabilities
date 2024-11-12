import React from 'react';
import Link from "next/link";
import CodeBlockShell from "src/components/Hightlight/shell";
import {GetHeadersResponse, HeaderSecureCheck, ResponseHeaders} from "src/types/services/api";
import {useAtom} from "jotai/index";
import {clientIdAtom, headerCheckAtom, headersAtom} from "src/states/target-page";
import Markdown from "src/components/Markdown";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "src/components/ui/accordion";
import RotateLoader from "src/components/Loader/spinner";
import useUID from "src/hooks/useUID";
import Status, {StatusProps} from "src/components/Badge/status";
import {transformHeaders} from "src/utils/header-translated";
import apiAlternative from "src/lib/axios";

const statusHeaderCheckedBinding = {
    "missing": "error",
    "secure": "success",
    "insecure": "warning",
    "present": "info",
    "error": "error"
}

function HeaderSecure() {
    const [clientId, ] = useAtom(clientIdAtom);
    const [genID] = useUID();

    const [show, setShow] = React.useState(false);
    const [headers, setHeaders] = useAtom(headersAtom);
    const [headerCheck, setHeaderCheck] = useAtom(headerCheckAtom);
    const toggleShow = () => setShow(!show);
    const fetchHeaders = async () => {
        if (!clientId) return;
        const result = await apiAlternative.v1.getHeaders(clientId);
        if (result && !result.error) {
            setHeaders(result);
        }
    }
    const fetchHeaderCheck = async () => {
        if (!clientId) return;
        const result = await apiAlternative.v1.getHeadersCheck(clientId);
        if (result && !result.error) {
            setHeaderCheck(result);
        }
    }

    React.useEffect(() => {
        (async () => {
            await fetchHeaders();
            await fetchHeaderCheck();
        })();
    }, [clientId]);

    return (
        <div className={"flex flex-col bg-zinc-950 rounded-xl border border-zinc-700 overflow-hidden"}>
            <div className={"flex flex-col gap-2 w-full px-4 py-4 border-b border-zinc-700"}>
                <div className={"w-full font-semibold text-xl uppercase"}>Kiểm tra header của trang web</div>
                <div>
                    <span className={"text-zinc-300 text-xs italic"}>Yêu cầu/Phản hồi</span>
                </div>
            </div>
            {headers ? (
                <div>
                    <div className={"border-b dark:border-zinc-800 border-zinc-200"}>
                        <div className={"py-3 px-4 flex items-center"}>
                            <span className={"text-lg  font-semibold hover:underline hover:text-zinc-100 cursor-pointer"}>Trạng thái phản hồi của trang web</span>
                            <span></span>
                        </div>
                        <div >
                            <Markdown>{'```shell\n' + (headers?.headers ? headers.headers.responseStatusLine : "Không tìm thấy kết quả trả về") + '\n```'}</Markdown>
                        </div>
                    </div>
                    <div>
                        <div className={"py-3 px-4"}>
                            <span className={"text-lg font-semibold hover:underline hover:text-zinc-100 cursor-pointer"}>Header phản hồi</span>
                        </div>
                        <div className={""}>
                            {headers?.headers ? (
                                <table className={"w-full h-full p-0 border-spacing-0 table-fixed"}>
                                    <colgroup>
                                        <col className={"w-[30%]"}/>
                                        <col className={"w-[70%]"}/>
                                    </colgroup>
                                    <tbody className={"w-full align-baseline"}>
                                    {transformHeaders(headers.headers.responseHeaders).map((header, index) => (
                                        <tr key={genID()}
                                            className={"border-b dark:border-zinc-800 border-zinc-200 align-baseline text-left"}>
                                            <th className={"text-xs md:text-sm py-3 px-2 md:pl-6 text-wrap hyphens-auto align-middle"}>{header.translated}</th>
                                            <td className={"text-xs md:text-sm py-3 px-2 break-words hyphens-auto text-zinc-200"}>
                                                {header.value}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : <div>Không tìm thấy header phản hồi</div>}
                        </div>
                    </div>
                </div>
            ) : <RotateLoader/>}
            {headerCheck ? (
                <div>
                    {headers?.headers
                        ? (<Accordion type="single" collapsible className="w-full p-4">
                        {headerCheck?.headerChecks && Object.keys(headerCheck?.headerChecks).map((header, index) => (
                            <AccordionItem key={genID()} value={header} className={"border-zinc-800 w-5xl"}>
                                <AccordionTrigger className={"capitalize font-semibold hover:no-underline"}>
                                    <Status
                                        status={
                                            statusHeaderCheckedBinding[
                                                headerCheck.headerChecks?.[header as ResponseHeaders].status
                                                ] as StatusProps['status'] || "info"
                                        }
                                        className={"hover:bg-opacity-30 transition-colors gap-1 [&>span]:pr-1"}
                                    >
                                        {header}
                                    </Status>
                                </AccordionTrigger>
                                <AccordionContent className={"pl-4 font-medium text-zinc-700 dark:text-zinc-100"}>
                                    {headerCheck.headerChecks?.[header as ResponseHeaders].message || 'Not Found'}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>)
                        : <div>Không tìm thấy header phản hồi</div>}
                </div>
            ): <RotateLoader />}
        </div>
    );
}

export default HeaderSecure;