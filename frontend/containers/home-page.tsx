"use client"
import React from 'react';
import {cn} from "src/utils/tailwind";
import {FaArrowRightLong} from "react-icons/fa6";
import SponsorBanner from "src/components/Banner/sponsor";
import {FieldErrors, useForm} from "react-hook-form";
import {useToast} from "src/hooks/useToast";
import {z} from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import axios from "src/lib/axios";
import {useRouter} from "next/navigation";
import {useAtom} from "jotai";
import {isShowFullScreenLoader as isShowFullScreenLoaderAtom} from "src/states/global";

const urlSchema = z.object({
   url: z.string().min(1, "Please enter a URL").url('Invalid URL')
});

function HomePage() {
    const router = useRouter();
    const [, setFullScreenLoader] = useAtom(isShowFullScreenLoaderAtom);
    const { getValues, handleSubmit, formState, setValue, setError } = useForm({
        resolver: zodResolver(urlSchema)
    });
    const {error: showError} = useToast();
    const onSubmit = async (data: {url: string}) => {
        setFullScreenLoader(true);
        const response = await axios.v1.initScan(data.url, (error, data) => {
            console.log(error, data);
        });
        setFullScreenLoader(false);
        // if (response?.error) {
        //     showError(response.error);
        // }
        // localStorage.setItem('clientId', response?.clientId || '');
        // console.logs(response);
        if (!response?.clientId) {
            showError(`Failed to initiate scan, Reason: ${response?.error}`);
        } else {
            const storedHistory = localStorage.getItem('scanHistory');
            const history = storedHistory ? JSON.parse(storedHistory) : [];
            history.push(response);
            localStorage.setItem('scanHistory', JSON.stringify(history));
            router.push('/target/' + response?.clientId);
        }
    };
    const onError = (errors: FieldErrors<{url: string}>) => {
        showError(errors.url?.message || 'Invalid URL');
    }
    return (
        <div className={"h-full w-full flex flex-col items-center "}>
            <div className="w-full flex flex-col justify-center items-start max-w-2xl">
                <span className="flex flex-col gap-2">
                    <p className={"text-3xl md:text-5xl font-semibold"}>Quét trang web, địa chỉ ip</p>
                    <p className={"text-xl md:text-3xl text-zinc-500"}>Với không rắc rối phát sinh</p>
                </span>
                <span className="py-2" />
                <span className="text-sm md:text-lg text-zinc-500 dark:text-zinc-400 mb-2">
                    Nhập URL, địa chỉ IP hoặc tên máy chủ để bắt đầu quét
                </span>
                <div
                    className={cn(
                        "w-full flex flex-col sm:flex-row justify-between items-center gap-2 rounded-2xl p-1 sm:border-[1px] sm:border-zinc-200 dark:sm:border-zinc-700 outline-none",
                        `sm:bg-zinc-100 dark:sm:bg-zinc-900`
                    )}
                >
                    <input
                        className={cn(
                            "w-full px-1 outline-none bg-opacity-0",
                            `bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg sm:border-0 border border-zinc-700 sm:py-0`
                        )}
                        placeholder="Nhập URL, địa chỉ IP hoặc tên miền"
                        type="text"
                        onChange={(e) => {
                            setValue('url', e.target.value)
                        }}
                    />
                    <button
                        className="w-full whitespace-nowrap flex justify-center items-center gap-2 sm:w-fit p-3 sm:p-2 bg-zinc-300 dark:bg-zinc-700 transition-all rounded-lg sm:rounded-xl text-zinc-300 dark:text-white font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-600"
                        type="button"
                        // @ts-ignore
                        onClick={handleSubmit(onSubmit, onError)}
                    >
                        <span>Scan Now</span>
                        <FaArrowRightLong/>
                    </button>
                </div>
            </div>
            <div className={"py-6 sm:py-10"}></div>
            <SponsorBanner />
        </div>
    );
}

export default HomePage;