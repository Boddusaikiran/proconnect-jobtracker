import { FormEvent, useState } from "react";

export default function AIChat(): JSX.Element {
   const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([]);
   const [input, setInput] = useState("");
   const [sending, setSending] = useState(false);

   async function send(e?: FormEvent) {
      e?.preventDefault();
      const text = input.trim();
      if (!text) return;
      setMessages((m) => [...m, { from: "user", text }]);
      setInput("");
      setSending(true);
      try {
         const res = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
         if (!res.ok) {
            const txt = await res.text();
            setMessages((m) => [...m, { from: "bot", text: "(AI error) " + txt }]);
         } else {
            const j = await res.json();
            setMessages((m) => [...m, { from: "bot", text: j.reply || "(no reply)" }]);
         }
      } catch (err: any) {
         setMessages((m) => [...m, { from: "bot", text: "AI service unavailable" }]);
      } finally {
         setSending(false);
      }
   }

   return (
      <div className="mt-6 p-4 border rounded bg-white">
         <h2 className="text-lg font-semibold mb-2">AI Chat</h2>
         <div className="h-48 overflow-auto border rounded p-2 mb-3 bg-gray-50">
            {messages.length === 0 && <p className="text-sm text-gray-500">Ask the AI something about jobs or resumes.</p>}
            {messages.map((m, i) => (
               <div key={i} className={`mb-2 ${m.from === "user" ? "text-right" : "text-left"}`}>
                  <div className={`inline-block p-2 rounded ${m.from === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"}`}>
                     {m.text}
                  </div>
               </div>
            ))}
         </div>

         <form onSubmit={(e) => send(e)} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the AI..." className="flex-1 p-2 border rounded" disabled={sending} />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={sending}>{sending ? "Sending..." : "Send"}</button>
         </form>
      </div>
   );
}
