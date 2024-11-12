import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import "src/lib/markdownParser.css"

import React, { useEffect } from 'react';


interface MarkdownProps {
    children: string;
    isTyping?: boolean;
};

function CursorSVG() {
    return (
        <svg
            className="cursor"
            viewBox="8 4 8 16"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect fill="#fff" height="12" width="4" x="10" y="6" />
        </svg>
    );
}

function Markdown({ children, isTyping }: MarkdownProps) {
    const [displayResponse, setDisplayResponse] = React.useState('');
    const [completedTyping, setCompletedTyping] = React.useState(false);

    useEffect(() => {
        if (!isTyping) {
            setCompletedTyping(true);
            setDisplayResponse(children);
            return;
        }

        setCompletedTyping(false);

        let i = 0;
        const stringResponse = children;

        const intervalId = setInterval(() => {
            setDisplayResponse(stringResponse.slice(0, i));

            i++;

            if (i > stringResponse.length) {
                clearInterval(intervalId);
                setCompletedTyping(true);
            }
        }, 20);

        return () => clearInterval(intervalId);
    }, [isTyping, children]);
    return (
        <ReactMarkdown className="markdown-body bg-opacity-0 text-zinc-600 text-sm md:text-base"
                       remarkPlugins={[remarkGfm]}>
            {displayResponse}
        </ReactMarkdown>
    );
}

export default Markdown;