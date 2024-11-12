import React from 'react';
import { SiIbm, SiNetflix, SiTencentqq, SiTesla } from 'react-icons/si';
import { GrGoogle } from 'react-icons/gr';
import { FaAmazon, FaFacebook } from 'react-icons/fa';
import { TfiMicrosoftAlt } from 'react-icons/tfi';
import { FaMeta } from 'react-icons/fa6';
import { BsNvidia } from 'react-icons/bs';
import Image from 'next/image';

function SponsorBanner() {

    const sponsorsList = [
        {
            title: 'Trường Đại học Kỹ thuật – Hậu cần Công an nhân dân',
            icon: "/logo.png",
        },
        // {
        //     title: 'Google',
        //     icon: <GrGoogle />,
        // }, {
        //     title: 'Facebook',
        //     icon: <FaFacebook />,
        // },
    //     {
    //     title: 'Amazon',
    //     icon: <FaAmazon />,
    // }, {
    //     title: 'Tesla',
    //     icon: <SiTesla />,
    // }, {
    //     title: 'Tencent',
    //     icon: <SiTencentqq />,
    // }, {
    //     title: 'Microsoft',
    //     icon: <TfiMicrosoftAlt />,
    // }, {
    //     title: 'Meta',
    //     icon: <FaMeta />,
    // }, {
    //     title: 'IBM',
    //     icon: <SiIbm />,
    // }, {
    //     title: 'Nvidia',
    //     icon: <BsNvidia />,
    // }
    ];


    return (
        <section className={"w-full max-w-[1400px] relative z-10 pb-16 sm:pb-24"}>
            <div className={"flex flex-col items-center justify-center rounded-xl bg-zinc-900 py-10 sm:py-14"}>
                <p className={"flex flex-row items-center rounded-full border-[0.5px] border-zinc-700 px-2 py-1 text-[10px] uppercase leading-3 tracking-normal mb-6"}>OUR
                    Nhà tài trợ</p>
                <h3 className={"mb-14 text-center text-3xl font-semibold"}>
                   Tin tưởng và sử dụng bởi các nhà phát triển, bảo mật
                </h3>
                <div className="relative w-full overflow-hidden px-10 md:p-0 inline-flex flex-nowrap gap-10">
                    <div
                        className="absolute right-0 bg-gradient-to-l from-zinc-100 dark:from-[#16181b] hidden md:block w-32 h-8"/>
                    <div
                        className="infinite-scroll flex whitespace-nowrap justify-between flex-nowrap gap-10 mx-10"
                    >
                        {sponsorsList.map((item, index) => (
                            <div className="flex justify-center items-center gap-1 dark:text-zinc-50 text-zinc-700"
                                 key={`sponsor-${index}`}>
                                {typeof item.icon === 'string' ? (
                                    <Image src={item.icon} alt={item.title} width={256} height={256} className="w-10 h-10"/>
                                ) : (
                                    item.icon
                                )}
                                <span>{item.title}</span>
                            </div>
                        ))}
                    </div>
                    <div
                        aria-hidden="true"
                        className="infinite-scroll flex whitespace-nowrap justify-between flex-nowrap gap-10"
                    >
                        {sponsorsList.map((item, index) => (
                            <div className="flex justify-center items-center gap-1 dark:text-zinc-50 text-zinc-700"
                                 key={`sponsor-2-${index}`}>
                                {typeof item.icon === 'string' ? (
                                    <Image src={item.icon} alt={item.title} width={256} height={256} className="w-10 h-10"/>
                                ) : (
                                    item.icon
                                )}
                                <span>{item.title}</span>
                            </div>
                        ))}
                    </div>
                    <div
                        className="absolute left-0 top-0 bg-gradient-to-r from-zinc-100 dark:from-[#16181b] hidden md:block w-32 h-8"/>
                </div>
            </div>
        </section>
    );
}

export default SponsorBanner;