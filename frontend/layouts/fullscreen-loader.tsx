"use client"
import React from 'react';
import {useAtom} from "jotai/index";
import {isShowFullScreenLoader as isShowFullScreenLoaderAtom} from "src/states/global";
import RotateLoader from "src/components/Loader/spinner";

interface FullscreenLoaderProps {
    children?: React.ReactNode;
};

function FullscreenLoader({children}: FullscreenLoaderProps) {
    const [isShowFullScreenLoader, ] = useAtom(isShowFullScreenLoaderAtom);

    return (
        <>
            {children}
            {isShowFullScreenLoader && (
                <div className={"fixed z-[999] w-screen h-screen bg-black bg-opacity-30 backdrop-blur flex justify-center items-center"}>
                    <RotateLoader />
                </div>
            )}
        </>
    );
}

export default FullscreenLoader;