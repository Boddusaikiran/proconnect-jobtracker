import { useEffect, useState } from "react";

export default function JobButler() {
   const [jobDescription, setJobDescription] = useState("");
   const [tone, setTone] = useState("professional");
   const [draft, setDraft] = useState<string | null>(null);
   const [userId, setUserId] = useState<string>("");
   const [users, setUsers] = useState<Array<{ id: string; fullName: string }>>([]);

   useEffect(() => {
      fetch("/api/users").then((r) => r.json()).then((data) => {
         setUsers(data || []);
         if (data && data.length > 0) setUserId(data[0].id);
      });
   }, []);

   async function generate() {
      setDraft(null);
      const res = await fetch("/api/ai/generate-message", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ userId, jobDescription, tone }),
      });
      const body = await res.json();
      setDraft(body.draft || "");
   }

   async function send() {
      if (!draft) return;
      // For MVP, send to a placeholder receiver id 'recruiter'
      const res = await fetch("/api/ai/send-message", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ senderId: userId || "anonymous", receiverId: "recruiter", content: draft }),
      });
      if (res.ok) {
         alert("Message saved/sent (mock)");
         setDraft(null);
         setJobDescription("");
      } else {
         const b = await res.json();
         alert("Send failed: " + (b.error || "unknown"));
      }
   }

   return (
      <div className="p-6">
         <h1 className="text-2xl mb-4">AI Job Butler (MVP)</h1>

         <label className="block mb-2">Select user</label>
         <select value={userId} onChange={(e) => setUserId(e.target.value)} className="mb-4">
            {users.map((u) => (
               <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
         </select>

         <label className="block mb-2">Job description / posting</label>
         <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={8} className="w-full mb-4 p-2 border rounded" />

         <label className="block mb-2">Tone</label>
         <input value={tone} onChange={(e) => setTone(e.target.value)} className="mb-4" />

         <div className="space-x-2">
            <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded">Generate Draft</button>
            {draft && <button onClick={send} className="px-4 py-2 bg-green-600 text-white rounded">Send (mock)</button>}
         </div>

         {draft && (
            <div className="mt-6 p-4 border rounded bg-gray-50">
               <h3 className="font-semibold">Draft</h3>
               <p className="whitespace-pre-wrap">{draft}</p>
            </div>
         )}
      </div>
   );
}
