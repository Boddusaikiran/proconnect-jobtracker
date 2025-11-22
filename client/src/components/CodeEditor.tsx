import React from "react";
import MonacoEditor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

export interface CodeEditorProps {
    language: string;
    value: string;
    onChange: (value: string) => void;
    height?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ language, value, onChange, height = "400px" }) => {
    return (
        <MonacoEditor
            height={height}
            language={language}
            theme="vs-dark"
            value={value}
            onChange={(val) => onChange(val ?? "")}
            loading={
                <div className="flex items-center justify-center h-full text-muted-foreground bg-[#1e1e1e]">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading Editor...</span>
                </div>
            }
            options={{
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
            }}
        />
    );
};

export default CodeEditor;
