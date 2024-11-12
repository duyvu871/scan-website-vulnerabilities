import type { ToastOptions} from 'react-toastify';
import {Bounce, toast} from 'react-toastify';
import {useState} from "react";

export function useToast() {
    const [toastOptions, setToastOptions] = useState<ToastOptions>({
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        transition: Bounce,
    });

    const error = (message: string) => {
        toast.error(message, toastOptions);
    }
    const success = (message: string) => {
        toast.success(message, toastOptions);
    }
    const info = (message: string) => {
        toast.info(message, toastOptions);
    }
    const warning = (message: string) => {
        toast.warning(message, toastOptions);
    }

    return {
        error,
        success,
        info,
        warning,
        toastOptions,
        setToastOptions
    }
}