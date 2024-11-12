"use client"
import * as React from 'react';

const services = [
    {
        id: '1',
        name: 'Scan lỗ hổng SQL Injection',
        description: 'Scan lỗ hổng SQL Injection trên cơ sở dữ liệu',
        href: 'database/scan/sql',
    }
];

export function DatabaseScanPage() {
    return (
        <div className={"w-full h-full flex flex-col gap-10 pb-24"}>
            <div className={'w-full flex flex-col items-center gap-5'}>
                 <span className="flex flex-col gap-2">
                    <p className={"text-3xl font-semibold"}>Quét lỗ hổng bảo mật injection</p>
                </span>
            </div>
            <div className={'w-full flex flex-col items-center gap-5'}>
                <h2 className="text-xl text-zinc-900 font-normal">Dịch vụ</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((service) => (
                        <a
                            key={service.id}
                            href={service.href}
                            className="relative flex flex-col justify-between p-4 bg-zinc-100 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-semibold">{service.name}</h3>
                                <p className="text-sm text-zinc-500">{service.description}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};