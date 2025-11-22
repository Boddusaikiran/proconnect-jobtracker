import React from "react";
import { motion } from "framer-motion";

export interface CodeOutputProps {
    output: string;
    error?: string;
}

export const CodeOutput: React.FC<CodeOutputProps> = ({ output, error }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-muted p-4 rounded h-48 overflow-auto font-mono text-sm"
        >
            {error ? (
                <pre className="text-destructive">{error}</pre>
            ) : (
                <pre>{output}</pre>
            )}
        </motion.div>
    );
};
