import React from 'react';
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'src/components/ui/tooltip';

interface TooltipProps {
    children: React.ReactNode;
    title: string;
};

function Tooltip({ children, title }: TooltipProps) {
    const [open, setOpen] = React.useState(false);

    const onnHover = () => {
        // setTimeout(() => {
        setOpen(true);
        // }, 1000);
    };

    return (
        <TooltipProvider>
            <ShadcnTooltip delayDuration={1000} onOpenChange={(openState) => setOpen(openState)} open={open}>
                <TooltipTrigger asChild>
                    {/*<div>*/}
                    {children}
                    {/*</div>*/}
                </TooltipTrigger>
                <TooltipContent className="z-[200] text-white bg-zinc-700">
                    {title}
                </TooltipContent>
            </ShadcnTooltip>
        </TooltipProvider>
    );
}

export default Tooltip;