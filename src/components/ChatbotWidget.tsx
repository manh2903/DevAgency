import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, Sparkles, Loader2, X, MessageSquareCode } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Xin chào! Tôi là Trợ lý AI Tư vấn Kỹ thuật tại DevAgency. Hãy chia sẻ cho tôi biết về dự án của bạn (ví dụ: web bán hàng, app SaaS, tính năng...), tôi sẽ phân tích tech-stack tối tân và đưa ra ước tính thời gian & ngân sách tham khảo sơ bộ ngay lập tức nhé!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest messages
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Hide notification once opened
  useEffect(() => {
    if (isOpen) {
      setShowNotification(false);
    }
  }, [isOpen]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    setInput("");

    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: userMsgText
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const response = await fetch("/api/quote-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          history: messages.map((m) => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const modelMsg: ChatMessage = {
          id: `model-${Date.now()}`,
          role: "model",
          text: data.reply
        };
        setMessages((prev) => [...prev, modelMsg]);
      } else {
        const errData = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "model",
            text: errData.error || "Có lỗi xảy ra trong quá trình tính toán. Xin vui lòng thử lại."
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          text: "Không thể kết nối với trí tuệ nhân tạo. Hãy kiểm tra kết nối mạng của bạn."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Dynamic AI Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50, x: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-[360px] sm:w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl border border-primary/5 flex flex-col overflow-hidden mb-4 select-text relative"
            id="chatbot-widget-window"
          >
            {/* Header section with deep brand color */}
            <div className="bg-primary text-white px-5 py-4 flex items-center justify-between relative bg-grid-pattern-dark select-none">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white/10 border border-white/15">
                  <Bot className="h-5 w-5 text-accent-cyan" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Kỹ sư Tư vấn AI 
                    <span className="inline-flex items-center gap-0.5 rounded bg-accent-cyan/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent-cyan border border-accent-cyan/20">
                      <Sparkles className="h-2 w-2 animate-pulse" /> Active
                    </span>
                  </h4>
                  <p className="text-[10px] text-white/60 flex items-center gap-1.5 font-medium">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                    </span>
                    Hỗ trợ giải pháp & báo giá tức thì
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all cursor-pointer"
                id="btn-chatbot-widget-minimize"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-light/20" id="chatbot-messages-scroll-area">
              {messages.map((m) => {
                const isModel = m.role === "model";
                return (
                  <div
                    key={m.id}
                    className={`flex ${isModel ? "justify-start" : "justify-end"} items-start gap-2.5`}
                  >
                    {isModel && (
                      <div className="p-1 bg-accent-blue/5 rounded border border-accent-blue/10 text-accent-blue mt-0.5 flex-shrink-0 select-none">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed whitespace-pre-wrap ${
                        isModel
                          ? "bg-white border border-primary/5 text-primary shadow-sm"
                          : "bg-primary text-white shadow-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start items-center gap-2.5">
                  <div className="p-1 bg-accent-blue/5 rounded border border-accent-blue/10 text-accent-blue flex-shrink-0">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-white border border-primary/5 text-primary font-medium text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-sm">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-blue" />
                    <span className="text-primary/55">AI đang phân tích yêu cầu...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-primary/5 bg-white flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập yêu cầu dự án (Ví dụ: web bán quần áo...)"
                className="flex-1 rounded-xl border border-primary/10 bg-bg-light/30 px-4 py-2.5 text-xs font-medium focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/5 transition-all text-primary"
                id="chatbot-widget-input"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-cyan hover:brightness-110 text-white disabled:opacity-40 transition-all cursor-pointer flex-shrink-0"
                id="btn-chatbot-widget-send"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleek Floating Chatbot Action Button */}
      <div className="relative flex items-center">
        {/* Pulsing prompt bubble for attention */}
        <AnimatePresence>
          {showNotification && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              onClick={() => setIsOpen(true)}
              className="mr-3 bg-white border border-primary/5 px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 cursor-pointer whitespace-nowrap select-none group"
              id="chatbot-widget-notification"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-primary group-hover:text-accent-blue transition-colors">
                Bạn cần tư vấn giải pháp/báo giá?
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotification(false);
                }}
                className="text-primary/40 hover:text-primary p-0.5 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular Floating Icon */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-accent-blue to-accent-cyan text-white shadow-lg shadow-accent-cyan/25 flex items-center justify-center border border-white/10 relative cursor-pointer group"
          id="btn-chatbot-floating-toggle"
          aria-label="Toggle AI Chat Advisor"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <>
              <MessageSquareCode className="h-6 w-6 text-white group-hover:scale-105 transition-transform" />
              
              {/* Outer pulsing ring for premium micro-interaction */}
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
