
import * as React from 'react';
import {CheckSSLResponse} from "src/types/services/api";
import {sslReportAtom} from "src/states/target-page";
import {useAtom} from "jotai";
import RotateLoader from "src/components/Loader/spinner";
import {AiOutlineSafetyCertificate} from "react-icons/ai";
import moment from "moment";
import 'moment/locale/vi';
import {cn} from "src/utils/tailwind";
import {useEffect} from "react";
moment.locale("vi");
export function SSLReport() {
    const [sslReport] = useAtom(sslReportAtom);
    const [isValidSSL, setIsValidSSL] = React.useState<boolean | null>(null);
    const transformCommonSSLData = (data: CheckSSLResponse) => {
        const sslInfo = data.results.checkSSL.certInfo;
        const statusStyle = data.results.checkSSLExpiry.valid ? "text-green-500" : "text-red-500";

        return [
            ["Trạng thái", <span className={cn("font-semibold", statusStyle)}>{data.results.checkSSLExpiry.valid ? "Xác thực": "Không xác thực"}</span>],
            ["Tên miền", sslInfo.san.dns.join("\n")],
            ["Nhà phát hành", sslInfo.issuer.organization],
            ["Ngày đăng ký", moment(sslInfo.validity.start).format("LLLL")],
            ["Ngày hết hạn", moment(sslInfo.validity.end).format("LLLL")],
            ["Còn lại", data.results.checkSSLExpiry.daysRemaining + " ngày"],
        ]
    }

    const transformSpecificationSSLData = (data: CheckSSLResponse) => {
        const sslInfo = data.results.checkSSL.certInfo;
        return [
            ["Thuật toán chữ ký", sslInfo.signatureAlgorithm],
            ["Kích thước khóa công khai", sslInfo.publicKeySize],
            ["Thuật toán khóa công khai", sslInfo.publicKeyAlgorithm],
        ]
    }

    useEffect(() => {
        if (sslReport) {
            setIsValidSSL(sslReport.results.checkSSLExpiry.valid);
        }
    }, [sslReport]);

    return (
        <div className={"flex flex-col bg-zinc-950 rounded-xl border border-zinc-700 overflow-hidden"}>
            <div className={cn("flex justify-between px-4 py-4 w-full border-b border-zinc-700", isValidSSL ? "bg-green-500/50" : "bg-red-500/50")}>
                <div className={"flex flex-col gap-2"}>
                    <div className={"w-full font-semibold uppercase flex items-center gap-1"}>
                        <AiOutlineSafetyCertificate size={26} className={"text-green-500"} /> <span>Kiểm tra chứng chỉ SSL</span>
                    </div>
                </div>
            </div>
            <div className={"sm:p-3"}>
                <div className={"flex flex-col gap-2"}>
                    <div></div>
                    <div>
                        <div className={"py-3 px-4 pl-2"}>
                            <span className={"font-semibold hover:underline hover:text-zinc-100 cursor-pointer"}>Thông tin chung</span>
                        </div>
                    </div>
                    {!sslReport && (
                        <RotateLoader />
                    )}
                    <table className={"w-full p-0 border-spacing-0 table-fixed"}>
                        <colgroup>
                            <col className={"w-[30%]"}/>
                            <col className={"w-[70%]"}/>
                        </colgroup>
                        <tbody className={"w-full align-baseline"}>
                        {sslReport && transformCommonSSLData(sslReport).map(([label, value], index) => (
                            <tr key={index}
                                className={"border-b dark:border-zinc-800 border-zinc-200 align-baseline text-left"}>
                                <th className={"text-xs md:text-sm py-3 px-2 md:pl-6 text-wrap hyphens-auto align-middle"}>{label}</th>
                                <td className={"text-xs md:text-sm py-3 px-2 break-words hyphens-auto text-zinc-200"}>{value}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <div>
                        <div className={"py-3 px-4 pl-2"}>
                            <span className={"font-semibold hover:underline hover:text-zinc-100 cursor-pointer"}>Thông số kỹ thuật</span>
                        </div>
                    </div>
                    {!sslReport && (
                        <RotateLoader />
                    )}
                    <table className={"w-full p-0 border-spacing-0 table-fixed"}>
                        <colgroup>
                            <col className={"w-[30%]"}/>
                            <col className={"w-[70%]"}/>
                        </colgroup>
                        <tbody className={"w-full align-baseline"}>
                        {sslReport && transformSpecificationSSLData(sslReport).map(([label, value], index) => (
                            <tr key={index}
                                className={"border-b dark:border-zinc-800 border-zinc-200 align-baseline text-left"}>
                                <th className={"text-xs md:text-sm py-3 px-2 md:pl-6 text-wrap hyphens-auto align-middle"}>{label}</th>
                                <td className={"text-xs md:text-sm py-3 px-2 break-words hyphens-auto text-zinc-200"}>{value}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};