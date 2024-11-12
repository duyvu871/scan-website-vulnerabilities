'use client';
import React, { useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import shell from 'highlight.js/lib/languages/shell';
import 'highlight.js/styles/github.css'; // Hoặc style khác

hljs.registerLanguage('shell', shell);

interface CodeBlockShellProps {
    code: string;
    language?: string; // Optional: Cho phép chỉ định ngôn ngữ khác
}

const CodeBlockShell: React.FC<CodeBlockShellProps> = ({ code, language = 'shell' }) => {
    useEffect(() => {
        hljs.highlightAll();
    }, []);

    return (
        <pre>
          <code className={`language-${language}`}>{code}</code>
        </pre>
    );
};

export default CodeBlockShell;