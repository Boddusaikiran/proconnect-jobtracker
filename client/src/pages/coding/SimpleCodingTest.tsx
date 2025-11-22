import React from "react";
import { useQuery } from "@tanstack/react-query";

export default function SimpleCodingTest() {
    const { data: problems, isLoading, error } = useQuery({
        queryKey: ["/api/coding/problems"],
        queryFn: async () => {
            const res = await fetch("/api/coding/problems");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        },
    });

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h1>🔧 Coding Platform Debug Page</h1>

            <div style={{ marginTop: "20px", padding: "15px", background: "#f0f0f0", borderRadius: "8px" }}>
                <h2>Status Check:</h2>
                <p>✅ React is working</p>
                <p>✅ This page loaded successfully</p>

                <h3 style={{ marginTop: "20px" }}>API Test:</h3>
                {isLoading && <p>⏳ Loading problems...</p>}
                {error && (
                    <div style={{ color: "red", padding: "10px", background: "#ffe0e0", borderRadius: "4px" }}>
                        <strong>❌ Error:</strong> {error.message}
                        <br />
                        <small>Check if server is running on port 5000</small>
                    </div>
                )}
                {problems && (
                    <div style={{ color: "green", padding: "10px", background: "#e0ffe0", borderRadius: "4px" }}>
                        <strong>✅ Success!</strong> Loaded {problems.length} problems
                        <ul style={{ marginTop: "10px" }}>
                            {problems.slice(0, 5).map((p: any) => (
                                <li key={p.id}>{p.title} ({p.difficulty})</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div style={{ marginTop: "20px", padding: "15px", background: "#fff3cd", borderRadius: "8px" }}>
                <h3>📝 Simple Code Editor Test:</h3>
                <textarea
                    style={{
                        width: "100%",
                        height: "200px",
                        fontFamily: "monospace",
                        padding: "10px",
                        fontSize: "14px",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                    }}
                    defaultValue="// Type your code here\nfunction twoSum(nums, target) {\n    // Your solution\n}"
                />
                <button
                    style={{
                        marginTop: "10px",
                        padding: "10px 20px",
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}
                    onClick={() => alert("Button works! ✅")}
                >
                    Test Button Click
                </button>
            </div>

            <div style={{ marginTop: "20px", padding: "15px", background: "#e0f7ff", borderRadius: "8px" }}>
                <h3>🔗 Navigation:</h3>
                <p>Current URL: {window.location.href}</p>
                <p>If you can see this page, React Router is working!</p>
            </div>
        </div>
    );
}
