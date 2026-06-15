import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { BookOpen, CheckCircle, ArrowRight, ExternalLink, Download, GraduationCap, X, FileText, Terminal, Save, ImagePlus, Trash2, Bot, SendHorizontal } from "lucide-react";
import { api, type Paper } from "../lib/api.ts";
import { useDaily } from "../hooks/useDaily.ts";
import LoadingSpinner from "../components/LoadingSpinner.tsx";
import { useState, useRef, useEffect } from "react";

interface NoteImage {
  id: string;
  dataUrl: string;
  name: string;
}

function NotesTab({ paperId }: { paperId: string }) {
  const storageKey = `notes-${paperId}`;
  const imagesKey = `notes-images-${paperId}`;

  const [notes, setNotes] = useState(() => localStorage.getItem(storageKey) ?? "");
  const [saved, setSaved] = useState(true);
  const [images, setImages] = useState<NoteImage[]>(() => {
    try { return JSON.parse(localStorage.getItem(imagesKey) ?? "[]"); }
    catch { return []; }
  });
  const [dragging, setDragging] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChange(val: string) {
    setNotes(val);
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(storageKey, val);
      setSaved(true);
    }, 800);
  }

  function handleSaveNow() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    localStorage.setItem(storageKey, notes);
    setSaved(true);
    textareaRef.current?.focus();
  }

  function insertAtCursor(text: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newVal = notes.slice(0, start) + text + notes.slice(end);
    const newCursor = start + text.length;
    handleChange(newVal);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursor;
        textareaRef.current.selectionEnd = newCursor;
        textareaRef.current.focus();
      }
    });
  }

  function saveImages(imgs: NoteImage[]) {
    setImages(imgs);
    try { localStorage.setItem(imagesKey, JSON.stringify(imgs)); }
    catch { /* localStorage quota exceeded */ }
  }

  function addImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const id = `img-${Date.now()}`;
      const newImages = [...images, { id, dataUrl, name: file.name }];
      saveImages(newImages);
      insertAtCursor(`![${file.name}](${id})\n`);
    };
    reader.readAsDataURL(file);
  }

  function removeImage(id: string) {
    saveImages(images.filter((img) => img.id !== id));
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) addImage(file);
    e.target.value = "";
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) addImage(file);
        return;
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) addImage(file);
  }

  function handleDownload() {
    let content = notes;
    for (const img of images) {
      content = content.replace(new RegExp(`\\(${img.id}\\)`, "g"), `(${img.dataUrl})`);
    }
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-${paperId.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const lineCount = notes.split("\n").length;

  return (
    <div
      className={`font-mono rounded-xl overflow-hidden border shadow-sm transition-colors ${
        dragging
          ? "border-green-400 dark:border-green-500"
          : "border-gray-200 dark:border-gray-700"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-500" />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 tracking-wide">notes.md</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            title="Add image (or paste / drag-drop)"
          >
            <ImagePlus className="w-3 h-3" />
            image
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            title="Download as .md"
          >
            <Download className="w-3 h-3" />
            export
          </button>
          <button
            onClick={handleSaveNow}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            title="Save (Ctrl+S)"
          >
            <Save className="w-3 h-3" />
            {saved
              ? <span className="text-green-600 dark:text-green-400">saved</span>
              : <span className="text-amber-600 dark:text-amber-400">unsaved</span>}
          </button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />

      {/* Editor */}
      <div className="flex bg-gray-50 dark:bg-gray-950 min-h-[320px]">
        <div className="select-none w-10 pt-4 pb-4 text-right pr-3 text-gray-300 dark:text-gray-700 text-xs leading-6 border-r border-gray-200 dark:border-gray-800 shrink-0">
          {Array.from({ length: Math.max(lineCount, 16) }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <div className="flex-1 pl-3 pr-4 pt-4 pb-4">
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={(e) => handleChange(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                handleSaveNow();
              }
            }}
            placeholder={"// Start typing your notes here...\n// Ctrl+S to save  •  paste or drag images directly"}
            spellCheck={false}
            className="w-full bg-transparent resize-none outline-none text-sm leading-6 text-gray-800 dark:text-green-300 placeholder:text-gray-300 dark:placeholder:text-gray-700 caret-green-600 dark:caret-green-400"
            style={{ minHeight: `${Math.max(lineCount, 16) * 24}px` }}
          />
        </div>
      </div>

      {/* Attachments panel */}
      {images.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3">
          <p className="text-xs text-gray-400 dark:text-gray-600 mb-2 font-mono">{"// attachments"}</p>
          <div className="flex flex-wrap gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:ring-2 hover:ring-green-400 dark:hover:ring-green-500 transition-all"
                  onClick={() => insertAtCursor(`![${img.name}](${img.id})\n`)}
                  title={`Click to insert • ${img.name}`}
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  title="Remove image"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1 w-24 truncate text-center font-mono">{img.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
        <span>Ln {lineCount}, Col {notes.length > 0 ? notes.length - notes.lastIndexOf("\n") : 1}</span>
        <span>{notes.length} chars · {images.length} image{images.length !== 1 ? "s" : ""}</span>
        <span className="flex items-center gap-1">
          <Terminal className="w-3 h-3" /> Markdown
        </span>
      </div>
    </div>
  );
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function AskAI({ paper, onClose }: { paper: Paper; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const systemPrompt = `You are a concise research assistant helping the user understand a paper.
Title: "${paper.title}"
Authors: ${paper.authors.slice(0, 3).join(", ")}
Summary: ${paper.summary}
Answer questions about the paper, define technical terms, and explain concepts clearly. Keep responses brief and focused.`;

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function send() {
    const query = input.trim();
    if (!query || streaming) return;
    setInput("");

    const history: ChatMessage[] = [...messages, { role: "user", content: query }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama2",
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            ...history.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!res.ok || !res.body) throw new Error("Ollama unreachable");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n").filter(Boolean)) {
          try {
            const data = JSON.parse(line);
            const token: string = data.message?.content ?? "";
            if (token) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: updated[updated.length - 1].content + token,
                };
                return updated;
              });
            }
          } catch { /* partial chunk */ }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "⚠ Could not reach Ollama. Make sure it's running:\n`ollama serve`",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="font-mono flex flex-col flex-1 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500 cursor-pointer" onClick={onClose} title="Close" />
          <span className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-500" />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 tracking-wide">llama2 · paper context</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 bg-gray-50 dark:bg-gray-950">
        {messages.length === 0 && (
          <div className="text-xs text-gray-400 dark:text-gray-600 space-y-1 pt-1">
            <p>{"// Ask anything about this paper"}</p>
            <p>{"// e.g. 'What does X mean?'"}</p>
            <p>{"//      'Explain the methodology'"}</p>
            <p>{"//      'Summarize the key findings'"}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "flex justify-end" : ""}>
            {msg.role === "user" ? (
              <span className="inline-block text-xs bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-1.5 max-w-[90%]">
                <span className="text-green-600 dark:text-green-400 mr-1.5">{">"}</span>
                {msg.content}
              </span>
            ) : (
              <p className="text-xs text-gray-700 dark:text-green-300 leading-relaxed whitespace-pre-wrap">
                {msg.content}
                {streaming && i === messages.length - 1 && (
                  <span className="inline-block w-1.5 h-3 bg-green-500 dark:bg-green-400 ml-0.5 animate-pulse align-middle" />
                )}
              </p>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 px-3 py-2 flex items-center gap-2">
        <span className="text-green-600 dark:text-green-400 text-xs shrink-0">{">"}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={streaming ? "generating..." : "ask anything..."}
          disabled={streaming}
          className="flex-1 bg-transparent text-xs text-gray-800 dark:text-green-300 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={streaming || !input.trim()}
          className="text-gray-400 hover:text-gray-700 dark:hover:text-green-400 disabled:opacity-30 transition-colors"
        >
          <SendHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { daily, loading, error, noTopics } = useDaily();
  const [completing, setCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"paper" | "notes">("paper");
  const [aiOpen, setAiOpen] = useState(false);
  const [tipDismissed, setTipDismissed] = useState(
    () => localStorage.getItem("guide-tip-dismissed") === "true"
  );

  function dismissTip() {
    localStorage.setItem("guide-tip-dismissed", "true");
    setTipDismissed(true);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500 text-sm">Fetching your paper for today…</p>
        </div>
      </div>
    );
  }

  if (noTopics) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <BookOpen className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Choose your topics first</h2>
          <p className="text-gray-500 mb-6">
            Tell us what you're interested in and we'll find you a great paper.
          </p>
          <button
            onClick={() => navigate("/onboarding")}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
          >
            Pick Topics
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!daily) return null;

  const alreadyDone = daily.score !== null;
  const awaitingQuiz = daily.completed && daily.score === null;

  async function handleDone() {
    setCompleting(true);
    try {
      const token = await getToken();
      if (!token) return;
      await api.completeReading(token);
      navigate("/quiz");
    } catch {
      navigate("/quiz");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className={`mx-auto px-4 py-8 transition-all duration-300 ${aiOpen ? "max-w-6xl" : "max-w-3xl"}`}>
      {/* Top bar */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {(() => {
            const s = (daily.date as string).slice(0, 10);
            const [y, mo, d] = s.split("-").map(Number);
            return new Date(y, mo - 1, d).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            });
          })()}
        </p>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Today's Paper</h1>
      </div>

      {/* Guide tip */}
      {!tipDismissed && (
        <div className="flex items-center gap-3 px-4 py-3 mb-5 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl">
          <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300 flex-1">
            New to reading research papers?{" "}
            <a href="/resources" className="font-semibold underline underline-offset-2 hover:no-underline">
              Check out our guide
            </a>{" "}
            to get the most out of DailyPaper.
          </p>
          <button
            onClick={dismissTip}
            className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main layout — splits into two columns when AI panel is open */}
      <div className={aiOpen ? "flex gap-5 items-stretch" : ""}>

        {/* Left column: tabs + content + CTA */}
        <div className={aiOpen ? "flex-1 min-w-0" : ""}>

          {/* Tabs row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl">
              <button
                onClick={() => setActiveTab("paper")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "paper"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Paper
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "notes"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Notes
              </button>
            </div>

            {/* Ask AI toggle */}
            <button
              onClick={() => setAiOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                aiOpen
                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
                  : "text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Ask AI
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "notes" && (
            <div className="mb-6">
              <NotesTab paperId={daily.paper.id} />
            </div>
          )}

          {activeTab === "paper" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug mb-3">
                  {daily.paper.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {daily.paper.authors.slice(0, 3).join(", ")}
                  {daily.paper.authors.length > 3 && ` +${daily.paper.authors.length - 3} more`}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Published{" "}
                    {new Date(daily.paper.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-gray-200 dark:text-gray-700">·</span>
                  <a
                    href={daily.paper.arxivUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                  >
                    View on arXiv <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-gray-200 dark:text-gray-700">·</span>
                  <a
                    href={daily.paper.arxivUrl.replace("/abs/", "/pdf/")}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                  >
                    Download PDF <Download className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                  Summary
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                  {daily.paper.summary.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          {alreadyDone ? (
            <div className="flex items-center justify-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 dark:border-green-900">
              <span className="text-green-600 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Completed today — Score: {daily.score}/5
              </span>
              <button
                onClick={() => navigate("/history")}
                className="text-sm text-brand-600 hover:underline"
              >
                View history
              </button>
            </div>
          ) : awaitingQuiz ? (
            <button
              onClick={() => navigate("/quiz")}
              className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors text-lg"
            >
              Take the Quiz <ArrowRight className="inline w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleDone}
              disabled={completing}
              className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-lg"
            >
              {completing ? "Loading quiz…" : <span className="flex items-center justify-center gap-2">I'm Done Reading <ArrowRight className="w-5 h-5" /></span>}
            </button>
          )}
        </div>

        {/* Right column: AI panel (sticky, full viewport height) */}
        {aiOpen && (
          <div className="w-[460px] shrink-0 flex flex-col">
            <AskAI paper={daily.paper} onClose={() => setAiOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
