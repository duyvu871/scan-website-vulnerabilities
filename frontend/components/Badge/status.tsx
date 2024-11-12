import React from 'react';
import {cn} from "src/utils/tailwind";
import {FaCheck} from "react-icons/fa6";
import {PiWarning} from "react-icons/pi";
import {MdErrorOutline} from "react-icons/md";
import {IoInformationCircleOutline} from "react-icons/io5";

export interface StatusProps {
    children?: React.ReactNode | string;
    status?: 'success' | 'error' | 'warning' | 'info';
    className?: React.HTMLAttributes<HTMLDivElement>['className'];
};

const variants = {
    success: {
        wrapper: 'bg-green-500',
        text: 'text-green-700',
        icon: 'text-green-700',
    },
    error: {
        wrapper: 'bg-red-500',
        text: 'text-red-700',
        icon: 'text-red-700',
    },
    warning: {
        wrapper: 'bg-yellow-500',
        text: 'text-yellow-700',
        icon: 'text-yellow-700',
    },
    info: {
        wrapper: 'bg-blue-500',
        text: 'text-blue-700',
        icon: 'text-blue-700',
    }
};

const icons = {
    success: FaCheck,
    error: MdErrorOutline,
    warning: PiWarning,
    info: IoInformationCircleOutline
}


function Status({children, status = 'info', className}: StatusProps) {
    const Icon = icons[status];
    return (
        <div className={cn("flex justify-center items-center gap-2 w-fit px-2 pl-1 py-1 rounded-full bg-opacity-20",
            variants[status].wrapper,
            className)}>
            <span className={cn(`px-2 py-1 text-xs font-semibold text-white rounded-md`, variants[status].text)}>
                {children}
            </span>
            <Icon className={cn(`w-4 h-4`, variants[status].icon)} />
        </div>
    );
}

export default Status;