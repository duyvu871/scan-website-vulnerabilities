"use client"
import * as React from 'react';
import Link from "next/link";
import useUID from "src/hooks/useUID";
import Image from "next/image";

const services = [
    // {
    //     id: '1',
    //     name: 'Scan lỗ hổng SQL Injection',
    //     description: 'Scan lỗ hổng SQL Injection trên cơ sở dữ liệu',
    //     href: 'sql',
    //     icon: {
    //         src: '/mysql.png',
    //         alt: 'MySQL',
    //         width: 64,
    //         height: 64
    //     }
    // },
    {
        id: '2',
        name: 'Scan bản đồ mạng',
        description: 'Quét tất cả các cổng mạng trên địa chỉ ip',
        href: 'nmap',
        icon: {
            src: '/network-map.png',
            alt: 'scan network map',
            width: 64,
            height: 64
        }
    }
];

export function DatabaseScanTargetPage( {clientId}: {clientId: string} ) {
    const [genUID] = useUID();
    return (
        <div className={"w-full h-full flex flex-col gap-10 pb-24"}>
            <div className={'w-full flex flex-col items-center gap-5'}>
                 <span className="flex flex-col gap-2">
                    <p className={"text-3xl font-semibold"}>Quét lỗ hổng bảo mật injection</p>
                </span>
            </div>
            <div className={'w-full flex flex-col items-center gap-5'}>
                <h2 className="text-xl text-zinc-700 dark:text-zinc-100 font-normal">Dịch vụ</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((service) => (
                       <Link href={`/database/scan/${clientId}/${service.href}`} key={genUID()}>
                            <div
                                className=" max-h-[150px] relative flex flex-col justify-between p-4 bg-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 dark:bg-zinc-900 rounded-lg shadow-md hover:shadow-lg transition-colors transition-shadow"
                            >
                                <div className="flex flex-row justify-center items-center gap-5">
                                    <div className="flex-grow relative object-contain flex justify-center items-center aspect-square min-w-[50px]">
                                        <Image
                                            className={"aspect-square w-[50px]"}
                                            src={service.icon.src}
                                            alt={service.icon.alt}
                                            width={service.icon.width}
                                            height={service.icon.height} />
                                    </div>
                                    <div className={"flex flex-col gap-2"}>
                                        <h3 className="text-sm font-semibold">{service.name}</h3>
                                        <p className="text-xs text-zinc-500">{service.description}</p>
                                    </div>
                                </div>
                            </div>
                       </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};