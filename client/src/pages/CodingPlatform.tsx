import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { ProblemList } from "@/components/ProblemList";
import { CodeOutput } from "@/components/CodeOutput";
import { problems } from "@/data/problems";
import { Button } from "@/components/ui/button";
import { Loader2, Menu, X } from "lucide-react";
import { debounce } from "@/utils/debounce";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load heavy editor component
const CodeEditor = lazy(() => import("@/components/CodeEditor"));

export default function CodingPlatform() {
    const [selectedId, setSelectedId] = useState<number | null>(problems[0].id);
    const [language, setLanguage] = useState<string>("python");
    const [code, setCode] = useState<string>("");
    const [output, setOutput] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Memoize selected problem lookup
    const selectedProblem = useMemo(() => problems.find((p) => p.id === selectedId), [selectedId]);

    // Load starter code when problem or language changes
    useEffect(() => {
        if (selectedProblem) {
            const starter = selectedProblem.starterCode[language as keyof typeof selectedProblem.starterCode] || "";
            setCode(starter);
        }
    }, [selectedProblem, language]);

    // Debounced runCode to avoid rapid submissions
    const runCode = useCallback(
        debounce(async () => {
            if (!selectedProblem) return;
            setLoading(true);
            setOutput("");
            setError("");
            try {
                const res = await fetch("/api/code/execute", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code, language, input: "" }),
                });
                const data = await res.json();
                if (data.error) setError(data.error);
                else setOutput(data.output);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }, 300),
        [code, language, selectedProblem]
    );

    return (
        <div className="flex h-screen bg-background overflow-hidden relative">
            {/* Mobile Sidebar Toggle */}
            <div className="md:hidden absolute top-4 left-4 z-50">
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <X /> : <Menu />}
                </Button>
            </div>

            {/* Left panel – problem list */}
            <AnimatePresence mode="wait">
                {(isSidebarOpen || window.innerWidth >= 768) && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`fixed md:relative z-40 h-full w-3/4 md:w-1/3 border-r border-muted bg-background p-4 overflow-y-auto shadow-lg md:shadow-none ${isSidebarOpen ? "block" : "hidden md:block"}`}
                    >
                        <div className="mt-12 md:mt-0">
                            <h2 className="text-xl font-bold mb-4">Problems</h2>
                            <ProblemList selectedId={selectedId} onSelect={(id) => {
                                setSelectedId(id);
                                setIsSidebarOpen(false);
                            }} />
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Right panel – editor and output */}
            <main className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden w-full">
                <AnimatePresence mode="wait">
                    {selectedProblem && (
                        <motion.div
                            key={selectedProblem.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-2 pt-12 md:pt-0"
                        >
                            <h2 className="text-2xl font-bold">{selectedProblem.title}</h2>
                            <p className="text-muted-foreground">{selectedProblem.description}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Language selector */}
                <div className="flex items-center space-x-2">
                    <label className="font-medium">Language:</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="border rounded p-1 bg-background"
                    >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>
                </div>

                {/* Code editor with lazy loading */}
                <Suspense fallback={
                    <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded flex items-center justify-center">
                        <span className="text-muted-foreground">Loading Editor...</span>
                    </div>
                }>
                    <CodeEditor language={language} value={code} onChange={setCode} height="300px" />
                </Suspense>

                {/* Run button */}
                <div className="flex items-center space-x-2">
                    <Button onClick={runCode} disabled={loading} className="bg-primary text-primary-foreground">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Run / Test Code
                    </Button>
                </div>

                {/* Output console */}
                <CodeOutput output={output} error={error} />
            </main>
        </div>
    );
}
