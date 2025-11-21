import { ChangeEvent, FormEvent, useRef, useState } from "react";

type FileMeta = {
   name: string;
   size: number;
   type: string;
};

export default function DocumentationDashboard(): JSX.Element {
   const [activeTab, setActiveTab] = useState<string>("components");
   const [search, setSearch] = useState<string>("");

   const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([]);
   const [input, setInput] = useState<string>("");
   const [isSending, setIsSending] = useState<boolean>(false);

   const [selectedFiles, setSelectedFiles] = useState<FileMeta[]>([]);
   const fileInputRef = useRef<HTMLInputElement | null>(null);

   const componentsList = [
      { name: "Button.jsx", description: "Reusable button component" },
      { name: "Card.jsx", description: "UI card container" },
      { name: "Input.jsx", description: "Form input component" },
   ];

   const pagesList = [
      { name: "Home.jsx", description: "Landing page" },
      { name: "JobsPage.jsx", description: "Job listings" },
      { name: "MessagesPage.jsx", description: "User messages" },
   ];

   const filteredComponents = componentsList.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
   );

   const filteredPages = pagesList.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
   );

   const copyText = (text: string) => {
      navigator.clipboard.writeText(text).catch(() => { });
   };

   // Chat: send message to server-side AI endpoint
   async function sendMessage(e?: FormEvent) {
      e?.preventDefault();
      const text = input.trim();
      if (!text) return;

      const userMsg = { from: "user" as const, text };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setIsSending(true);

      try {
         const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text }),
         });

         if (!res.ok) throw new Error("AI endpoint not available");

         const data = await res.json();
         const botText = data?.reply || "(no reply)";
         setMessages((m) => [...m, { from: "bot", text: botText }]);
      } catch (err) {
         // fallback behaviour: simple echo or error message
         setMessages((m) => [...m, { from: "bot", text: "AI service not available. Try again later." }]);
      } finally {
         setIsSending(false);
      }
   }

   // Resume upload handler
   async function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
      const files = e.target.files;
      if (!files) return;

      const metas: FileMeta[] = Array.from(files).map((f) => ({ name: f.name, size: f.size, type: f.type }));
      setSelectedFiles(metas);
   }

   async function uploadResumes() {
      if (!fileInputRef.current || !fileInputRef.current.files || fileInputRef.current.files.length === 0) return;
      const form = new FormData();
      Array.from(fileInputRef.current.files).forEach((f) => form.append("files", f));

      try {
         const res = await fetch("/api/upload-resume", { method: "POST", body: form });
         if (!res.ok) throw new Error("Upload failed");
         const data = await res.json();
         alert("Upload successful: " + (data?.message || "ok"));
      } catch (err) {
         alert("Upload failed. Server may not provide an endpoint yet.");
      }
   }

   return (
      <div className="p-6 bg-gray-100 min-h-screen">
         <div className="max-w-5xl mx-auto bg-white rounded-xl p-6 shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Documentation Dashboard</h1>

            <input
               type="text"
               placeholder="Search files..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full p-2 border rounded-lg mb-4"
            />

            <div className="flex gap-4 mb-4">
               <button
                  onClick={() => setActiveTab("components")}
                  className={`px-4 py-2 rounded-lg ${activeTab === "components" ? "bg-blue-600 text-white" : "bg-gray-200"
                     }`}
               >
                  Components
               </button>

               <button
                  onClick={() => setActiveTab("pages")}
                  className={`px-4 py-2 rounded-lg ${activeTab === "pages" ? "bg-blue-600 text-white" : "bg-gray-200"
                     }`}
               >
                  Pages
               </button>

               <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-4 py-2 rounded-lg ${activeTab === "chat" ? "bg-blue-600 text-white" : "bg-gray-200"
                     }`}
               >
                  AI Chat
               </button>

               <button
                  onClick={() => setActiveTab("resume")}
                  className={`px-4 py-2 rounded-lg ${activeTab === "resume" ? "bg-blue-600 text-white" : "bg-gray-200"
                     }`}
               >
                  Resume Upload
               </button>
            </div>

            {activeTab === "components" && (
               <div className="space-y-3">
                  {filteredComponents.map((file, index) => (
                     <div
                        key={index}
                        className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center"
                     >
                        <div>
                           <p className="font-semibold">{file.name}</p>
                           <p className="text-sm text-gray-600">{file.description}</p>
                        </div>

                        <div className="flex gap-2">
                           <button
                              onClick={() => alert("Open " + file.name)}
                              className="px-3 py-1 bg-green-500 text-white rounded"
                           >
                              Open
                           </button>

                           <button
                              onClick={() => copyText(file.name)}
                              className="px-3 py-1 bg-blue-500 text-white rounded"
                           >
                              Copy
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {activeTab === "pages" && (
               <div className="space-y-3">
                  {filteredPages.map((file, index) => (
                     <div
                        key={index}
                        className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center"
                     >
                        <div>
                           <p className="font-semibold">{file.name}</p>
                           <p className="text-sm text-gray-600">{file.description}</p>
                        </div>

                        <div className="flex gap-2">
                           <button
                              onClick={() => alert("Open " + file.name)}
                              className="px-3 py-1 bg-green-500 text-white rounded"
                           >
                              Open
                           </button>

                           <button
                              onClick={() => copyText(file.name)}
                              className="px-3 py-1 bg-blue-500 text-white rounded"
                           >
                              Copy
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {activeTab === "chat" && (
               <div className="mt-4">
                  <div className="border rounded-lg p-4 mb-3 h-64 overflow-auto bg-gray-50">
                     {messages.length === 0 && <p className="text-sm text-gray-500">No messages yet. Ask something!</p>}
                     {messages.map((m, i) => (
                        <div key={i} className={`mb-2 ${m.from === "user" ? "text-right" : "text-left"}`}>
                           <div className={`inline-block p-2 rounded ${m.from === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"}`}>
                              {m.text}
                           </div>
                        </div>
                     ))}
                  </div>

                  <form onSubmit={(e) => sendMessage(e)} className="flex gap-2">
                     <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask the AI..."
                        className="flex-1 p-2 border rounded"
                        disabled={isSending}
                     />
                     <button type="submit" className="px-4 py-2 bg-primary text-white rounded" disabled={isSending}>
                        {isSending ? "Sending..." : "Send"}
                     </button>
                  </form>
               </div>
            )}

            {activeTab === "resume" && (
               <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-600">Upload one or more resume files (PDF, DOCX, TXT). Files will be sent to the server for parsing.</p>

                  <input ref={fileInputRef} type="file" multiple onChange={handleFilesChange} className="block" />

                  {selectedFiles.length > 0 && (
                     <div className="bg-gray-50 border rounded p-3">
                        <p className="font-medium mb-2">Selected files</p>
                        <ul className="list-disc ml-5 text-sm">
                           {selectedFiles.map((f, i) => (
                              <li key={i}>{f.name} ({Math.round(f.size / 1024)} KB)</li>
                           ))}
                        </ul>
                     </div>
                  )}

                  <div className="flex gap-2">
                     <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-200 rounded">Choose Files</button>
                     <button onClick={uploadResumes} className="px-4 py-2 bg-blue-600 text-white rounded">Upload to Server</button>
                  </div>
               </div>
            )}

         </div>
      </div>
   );
}
