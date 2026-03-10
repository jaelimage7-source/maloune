'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGES: Record<string, string> = {
  fr: 'Bonjour ! 👋 Je suis l\'assistant MALOUNE. Comment puis-je vous aider ?',
  en: 'Hello! 👋 I\'m the MALOUNE assistant. How can I help you?',
  ht: 'Bonjou! 👋 Mwen se asistan MALOUNE. Kijan m ka ede w?',
  es: '¡Hola! 👋 Soy el asistente de MALOUNE. ¿Cómo puedo ayudarte?',
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const lang = typeof navigator !== 'undefined'
        ? navigator.language?.slice(0, 2) || 'fr'
        : 'fr';
      const welcome = WELCOME_MESSAGES[lang] || WELCOME_MESSAGES.fr;
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: welcome,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMsg]
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.message || data.error || 'Erreur de connexion.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (!isOpen) setHasNewMessage(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: 'Connexion interrompue. Réessayez ou contactez contact@maloune.fr',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    setHasNewMessage(false);
  };

  return (
    <>
      {/* ===== STYLES ===== */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .maloune-chat-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #C49B3C 0%, #A67C2E 50%, #D4AF37 100%);
          box-shadow: 0 4px 20px rgba(196, 155, 60, 0.4), 0 2px 8px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        .maloune-chat-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(196, 155, 60, 0.5), 0 4px 12px rgba(0,0,0,0.2);
        }
        .maloune-chat-btn svg {
          width: 28px;
          height: 28px;
          fill: white;
          transition: transform 0.3s ease;
        }
        .maloune-chat-btn.is-open svg {
          transform: rotate(90deg);
        }

        .maloune-chat-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 18px;
          height: 18px;
          background: #E53935;
          border-radius: 50%;
          border: 2px solid white;
          animation: maloune-pulse 1.5s infinite;
        }

        @keyframes maloune-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        /* Chat Window */
        .maloune-chat-window {
          position: fixed;
          bottom: 96px;
          right: 24px;
          z-index: 9998;
          width: 380px;
          max-width: calc(100vw - 32px);
          height: 520px;
          max-height: calc(100vh - 140px);
          background: #FAFAF8;
          border-radius: 20px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          pointer-events: none;
          transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .maloune-chat-window.is-open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }

        /* Header */
        .maloune-chat-header {
          background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .maloune-chat-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C49B3C, #D4AF37);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          color: white;
          flex-shrink: 0;
        }
        .maloune-chat-header-info h3 {
          margin: 0;
          color: white;
          font-size: 15px;
          font-weight: 600;
        }
        .maloune-chat-header-info p {
          margin: 2px 0 0;
          color: rgba(255,255,255,0.6);
          font-size: 12px;
        }
        .maloune-chat-status {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #4CAF50;
          border-radius: 50%;
          margin-right: 4px;
          vertical-align: middle;
        }

        /* Messages */
        .maloune-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scroll-behavior: smooth;
        }
        .maloune-chat-messages::-webkit-scrollbar {
          width: 4px;
        }
        .maloune-chat-messages::-webkit-scrollbar-thumb {
          background: #D4AF37;
          border-radius: 4px;
        }

        .maloune-msg {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          animation: maloune-fadeIn 0.3s ease;
        }
        @keyframes maloune-fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .maloune-msg.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #C49B3C, #A67C2E);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .maloune-msg.assistant {
          align-self: flex-start;
          background: white;
          color: #1A1A1A;
          border: 1px solid #EBEBEB;
          border-bottom-left-radius: 4px;
        }

        /* Typing indicator */
        .maloune-typing {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          align-self: flex-start;
        }
        .maloune-typing span {
          width: 8px;
          height: 8px;
          background: #C49B3C;
          border-radius: 50%;
          animation: maloune-bounce 1.4s infinite;
        }
        .maloune-typing span:nth-child(2) { animation-delay: 0.2s; }
        .maloune-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes maloune-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }

        /* Input */
        .maloune-chat-input-area {
          padding: 12px 16px;
          border-top: 1px solid #EBEBEB;
          background: white;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          flex-shrink: 0;
        }
        .maloune-chat-input-area textarea {
          flex: 1;
          border: 1px solid #E0E0E0;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          resize: none;
          max-height: 80px;
          outline: none;
          background: #F9F9F7;
          transition: border-color 0.2s;
          line-height: 1.4;
        }
        .maloune-chat-input-area textarea:focus {
          border-color: #C49B3C;
        }
        .maloune-chat-input-area textarea::placeholder {
          color: #999;
        }
        .maloune-chat-send {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #C49B3C, #D4AF37);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s, opacity 0.2s;
        }
        .maloune-chat-send:hover { transform: scale(1.05); }
        .maloune-chat-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .maloune-chat-send svg {
          width: 18px;
          height: 18px;
          fill: white;
        }

        .maloune-chat-footer {
          text-align: center;
          padding: 6px;
          font-size: 11px;
          color: #AAA;
          background: white;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .maloune-chat-window {
            bottom: 0;
            right: 0;
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
          .maloune-chat-btn {
            bottom: 16px;
            right: 16px;
          }
        }
      `}</style>

      {/* ===== CHAT BUTTON ===== */}
      <button
        className={`maloune-chat-btn ${isOpen ? 'is-open' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le support'}
      >
        {!isOpen ? (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
            <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        )}
        {hasNewMessage && !isOpen && <span className="maloune-chat-badge" />}
      </button>

      {/* ===== CHAT WINDOW ===== */}
      <div className={`maloune-chat-window ${isOpen ? 'is-open' : ''}`}>
        {/* Header */}
        <div className="maloune-chat-header">
          <div className="maloune-chat-avatar">M</div>
          <div className="maloune-chat-header-info">
            <h3>MALOUNE Support</h3>
            <p><span className="maloune-chat-status" /> En ligne — répond en quelques secondes</p>
          </div>
        </div>

        {/* Messages */}
        <div className="maloune-chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`maloune-msg ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="maloune-typing">
              <span /><span /><span />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="maloune-chat-input-area">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            rows={1}
            disabled={isLoading}
          />
          <button
            className="maloune-chat-send"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            aria-label="Envoyer"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

        <div className="maloune-chat-footer">
          Propulsé par MALOUNE AI
        </div>
      </div>
    </>
  );
}
