"use client"
import React from 'react';
import { motion } from 'framer-motion';

interface TransitionProps {
    children: React.ReactNode;
};

function Transition({children}: TransitionProps) {
    return (
        <motion.div
            className={"w-full"}
            initial={{y: 40, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.1, ease: "easeInOut"}}
        >
            {children}
        </motion.div>
    );
}

export default Transition;