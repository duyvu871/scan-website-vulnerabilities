import React, {useEffect} from 'react';
import {useAtom} from "jotai/index";
import {clientStatusAtom, dnsInfoAtom, headerCheckAtom, sslReportAtom} from "src/states/target-page";
import {useScore} from "src/hooks/useScore";
import {headerStatusScore} from "src/utils/header-score";
import {cn} from "src/utils/tailwind";
import Link from "next/link";
import useUID from "src/hooks/useUID";
import {scoreLabel} from "src/global/contants/score-label";
import Image from "next/image";
import {resolveCountryFlag} from "src/utils/resolve";
import { countries, TContinentCode } from 'countries-list'
import MapEmbed from "src/components/map-embed";

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

const familyLabel = {
    4: "IPv4",
    6: "IPv6"
}

type ScoreLabel = keyof typeof scoreLabelStyle;

function Report() {
    const [headerCheck] = useAtom(headerCheckAtom);
    const [clientStatus] = useAtom(clientStatusAtom);
    const [dnsInfo] = useAtom(dnsInfoAtom);
    const [sslReport] = useAtom(sslReportAtom);

    const [label, setLabel] = React.useState<ScoreLabel>("A");
    const [score, setScore] = React.useState(0);

    const [genID] = useUID();
    const {getScore} = useScore({
        "F": [0, 0.5],
        "E": [0.5, 1.2],
        "D": [1.2, 2.3],
        "C": [2.3, 3.4],
        "B": [3.4, 9],
        "A": [9, 10]
    });

    useEffect(() => {
        if (headerCheck) {
            const scores = Object.values(headerCheck.headerChecks).map(value => headerStatusScore[value.status] || 0);
            const {label, score} = getScore([
                ...scores,
                ...(sslReport?.results.checkSSLExpiry.valid ? [10] : [0])
            ]);
            console.log(scores, label, score);
            setLabel(label);
            setScore(score);
            console.log(
                // @ts-ignore
                countries[dnsInfo?.geo?.country ?? "VN"],
            )
        }
    }, [headerCheck, sslReport]);
    return (
        <div className={"flex flex-col bg-zinc-950 rounded-xl border border-zinc-700 overflow-hidden"}>
            <div
                className={cn("flex flex-col gap-2 w-full px-4 py-4 border-b border-zinc-700", scoreLabelStyle[label].bg)}>
                <div className={"w-full font-semibold text-md uppercase"}>Báo cáo bảo mật</div>
            </div>
            <div className={"w-full flex flex-col sm:flex-row justify-start gap-5"}>
                <div className={"flex flex-col justify-start items-center gap-5  p-5 pb-0"}>
                    <div
                        className={cn("w-28 h-28 aspect-square md:w-32 md:h-32 rounded-lg flex justify-center items-center", scoreLabelStyle[label].bg)}>
                        <span className={"text-8xl md:text-9xl font-semibold"}>{label}</span>
                    </div>
                    <div className={cn("flex flex-col justify-center items-start", scoreLabelStyle[label].color)}>
                        <span className={"text-xl md:text-2xl font-bold uppercase"}>{scoreLabel[label].label}</span>
                    </div>
                </div>

                <div className={"flex flex-col gap-2"}>
                    <table className={"w-full h-full p-0 border-spacing-0 table-fixed"}>
                        <colgroup>
                            <col className={"w-[30%]"}/>
                            <col className={"w-[70%]"}/>
                        </colgroup>
                        <tbody className={"w-full align-baseline"}>
                            <tr
                                className={"border-b dark:border-zinc-800 border-zinc-200 align-baseline text-left"}>
                                <th className={"text-xs md:text-sm py-3 px-2 md:pl-6 text-wrap hyphens-auto align-middle"}>Trang:</th>
                                <td className={"align-middle text-xs md:text-sm py-3 px-2 break-words hyphens-auto text-zinc-200"}>
                                    <Link href={clientStatus?.url || ""} passHref
                                          className={"text-xs md:text-sm text-blue-500 hover:underline"}>{clientStatus?.url}</Link>
                                </td>
                            </tr>
                            <tr
                                className={"border-b dark:border-zinc-800 border-zinc-200 align-baseline text-left"}>
                                <th className={"text-xs md:text-sm py-3 px-2 md:pl-6 text-wrap hyphens-auto align-middle"}>
                                    Địa chỉ IP:
                                </th>
                                <td className={"align-middle text-xs md:text-sm py-3 px-2 break-words hyphens-auto text-zinc-200"}>
                                    {/*<Link href={clientStatus?.url || ""} passHref*/}
                                    {/*      className={"text-xs md:text-medium text-blue-500 hover:underline"}>{dnsInfo?.address}</Link>*/}
                                    <div className={"flex flex-col justify-start items-start gap-1"}>
                                        {dnsInfo?.ips && (
                                            dnsInfo.ips.map((dns) => (
                                                <div key={genID()} className={"flex flex-wrap justify-start items-center gap-1"}>
                                                    <span>{dns.ip && `IP${dns.family}`}</span>
                                                    <div className={"flex flex-wrap gap-1"}>
                                                        {dns.ip && dns.ip.map((address) => (
                                                            <Link key={'link-' + genID()} href={`https://ipinfo.io/${address}`} passHref
                                                                  className={"text-xs md:text-sm text-blue-500 hover:underline"}>{address}</Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <tr
                                className={"border-b dark:border-zinc-800 border-zinc-200 align-baseline text-left"}>
                                <th className={"text-xs md:text-sm py-3 px-2 md:pl-6 text-wrap hyphens-auto align-middle"}>
                                    Thời gian tạo:
                                </th>
                                <td className={"align-middle text-xs md:text-sm py-3 px-2 break-words hyphens-autocursor-pointer md:text-medium text-blue-500 hover:underline"}>
                                    {clientStatus?.timestamp && new Date(clientStatus.timestamp).toLocaleString()}
                                </td>
                            </tr>
                            {dnsInfo?.geo && (
                                <tr className={"border-b dark:border-zinc-800 border-zinc-200 align-baseline text-left"}>
                                    <th className={"text-xs md:text-sm py-3 px-2 md:pl-6 text-wrap hyphens-auto align-middle"}>
                                        Vị trí:
                                    </th>
                                    <td className={"align-middle text-xs md:text-sm py-3 px-2 break-words hyphens-autocursor-pointer md:text-medium text-blue-500 hover:underline"}>
                                        <div className={"flex flex-row gap-1 items-center justify-start mb-2"}>
                                            <Image className={"w-8 h-8 lg:w-10 lg:h-10 object-contain"} src={resolveCountryFlag(dnsInfo.geo.country ?? "VN", 'flat', '64')} width={64} height={64}
                                                   alt={`${dnsInfo.geo.country ?? "Vietnam"}-flag`}/>

                                            <div className={"flex flex-row flex-wrap items-center justify-start"}>
                                                <span>{
                                                    dnsInfo?.geo?.country &&
                                                    // @ts-ignore
                                                    `${countries[dnsInfo?.geo?.country as TContinentCode].native},`
                                                }</span>
                                                <span>
                                                    {dnsInfo.geo.city && ` ${dnsInfo.geo.city},`}
                                                </span>
                                                <span>
                                                    {dnsInfo.geo.timezone && ` ${dnsInfo.geo.timezone}`}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <MapEmbed
                                                position={{
                                                    lat: dnsInfo.geo.latitude || 0,
                                                    lng: dnsInfo.geo.longitude || 0
                                                }}
                                                width={600}
                                                height={400}
                                                zoom={13}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {dnsInfo?.asn && (
                                <tr className={"border-b dark:border-zinc-800 border-zinc-200 align-baseline text-left"}>
                                    <th className={"text-xs md:text-sm py-3 px-2 md:pl-6 text-wrap hyphens-auto align-middle"}>
                                        Nhà cung cấp dịch vụ mạng:
                                    </th>
                                    <td className={"align-middle text-xs md:text-sm py-3 px-2 break-words hyphens-auto text-zinc-200"}>
                                        <div className={"flex flex-col gap-1"}>
                                            <table className={"w-full h-full p-0 border-spacing-0 table-fixed"}>
                                                <colgroup>
                                                    <col className={"w-[30%]"}/>
                                                    <col className={"w-[70%]"}/>
                                                </colgroup>
                                                <tbody>
                                                    <tr>
                                                        <th className={"text-xs md:text-sm py-3 px-2 md:pl-6 text-wrap hyphens-auto align-middle"}>
                                                            tên miền:
                                                        </th>
                                                        <td className={"align-middle text-xs md:text-sm py-3 px-2 break-words hyphens-auto text-zinc-200"}>
                                                            {dnsInfo.asn.as_domain}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th className={"text-xs md:text-sm py-3 px-2 md:pl-6 text-wrap hyphens-auto align-middle"}>
                                                            C.ty:
                                                        </th>
                                                        <td className={"align-middle text-xs md:text-sm py-3 px-2 break-words hyphens-auto text-zinc-200"}>
                                                            {dnsInfo.asn.as_name}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th className={"text-xs md:text-sm py-3 px-2 md:pl-6 text-wrap hyphens-auto align-middle"}>
                                                            Quốc gia:
                                                        </th>
                                                        <td className={"align-middle text-xs md:text-sm py-3 px-2 break-words hyphens-auto text-zinc-200"}>
                                                            {dnsInfo.asn.country_name}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className={"p-5"}>
                    <span
                        className={"text-xs md:text-xs text-zinc-600 dark:text-zinc-300"}>{scoreLabel[label].message}</span>
            </div>
        </div>
    );
}

export default Report;