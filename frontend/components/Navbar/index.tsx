"use client"
import React from 'react';
import {cn} from "src/utils/tailwind";
import Logo from "src/components/Icon/logo";
import Link from "next/link";
import useUID from "src/hooks/useUID";
import {GoServer} from "react-icons/go";
import {AiOutlineScan} from "react-icons/ai";
import {IoNewspaperOutline} from "react-icons/io5";
import {usePathname} from "next/navigation";
import {TbDatabaseSearch} from "react-icons/tb";
import {BsDatabase} from "react-icons/bs";
import {SiMysql} from "react-icons/si";
interface NavigationBarProps {
    placement?: "top" | "bottom";
};

const navigateItems = [
    {
        group: "home",
        items: [
            {
                name: "home",
                url: "/",
                icon: Logo,
            },
            {
                name: "target",
                url: "/target",
                icon: GoServer
            },
            {
                name: "database",
                url: "/database/scan",
                icon: BsDatabase   ,
            },
            {
                name: "sql",
                url: "/sql",
                icon: SiMysql ,
            }
        ]
    },
]

function NavigationBar(props: NavigationBarProps) {
    const { placement } = props;
    const pathName = usePathname();
    const currentActive = "home:home";
    const [genID] = useUID()
    return (
        <div className={cn("fixed left-1/2 -translate-x-1/2 bottom-5 z-50 px-3 dark:bg-zinc-900 rounded-2xl max-w-xs overflow-hidden")}>
            <div
                className={cn("flex justify-between items-center g-opacity-[0.9] h-fit min-h-10 w-full overflow-auto")}>
                <div className={cn("flex items-center gap-2 my-3")}>
                    {navigateItems.map(({group, items}, index) => (
                        <div key={`nav-group-${genID()}`} className={cn("flex items-center gap-2")}>
                            <div className={cn("flex items-center justify-center gap-2 ")}>
                                {items.map(({icon: Icon, name, url}, index) => (
                                    <Link key={`nav-item-${genID()}`} href={url}
                                          className={cn("text-lg font-medium text-white dark:text-black relative")}
                                          passHref>
                                        <div
                                            className={cn(
                                                "flex flex-col justify-center items-center gap-2 p-3 rounded-lg dark:bg-zinc-800 dark:hover:bg-zinc-700 hover:bg-zinc-700 transition-colors",
                                                ((name === 'home' && pathName === '/') || pathName.includes(name)) && "dark:bg-zinc-700 after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1.5 after:h-1.5 dark:after:bg-zinc-400 after:rounded-full"
                                            )}>
                                            <Icon className={"h-5 w-5 dark:fill-zinc-100 fill-zinc-700 text-zinc-50"}/>
                                            {/*<span className={"text-xs font-bold dark:text-zinc-300 text-zinc-700"}>{name}</span>*/}
                                        </div>
                                    </Link>
                                ))}
                                {index < navigateItems.length - 1 && (
                                    <div className={cn("h-10 w-0.5 bg-zinc-400 dark:bg-zinc-700")}/>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NavigationBar;