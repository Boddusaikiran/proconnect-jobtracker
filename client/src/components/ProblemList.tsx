import React, { useCallback } from "react";
import { problems } from "@/data/problems";
import { CheckCircle2, XCircle } from "lucide-react";

export interface ProblemListProps {
    selectedId: number | null;
    onSelect: (id: number) => void;
}

export const ProblemList: React.FC<ProblemListProps> = React.memo(({ selectedId, onSelect }) => {
    const handleSelect = useCallback((id: number) => {
        onSelect(id);
    }, [onSelect]);

    return (
        <div className="space-y-2 p-4 overflow-y-auto h-full">
            {problems.map((p) => (
                <div
                    key={p.id}
                    className={`p-2 rounded cursor-pointer flex justify-between items-center ${selectedId === p.id ? "bg-primary/10" : "hover:bg-muted/30"}`}
                    onClick={() => handleSelect(p.id)}
                >
                    <span className="font-medium">{p.title}</span>
                    <span className={`text-sm ${p.difficulty === "easy" ? "text-success" : p.difficulty === "medium" ? "text-warning" : "text-destructive"}`}>[{p.difficulty}]</span>
                </div>
            ))}
        </div>
    );
});
