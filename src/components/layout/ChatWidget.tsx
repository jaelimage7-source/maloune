'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ============================================
// 📚 FAQ FALLBACK (si API pa disponib)
// ============================================
interface FAQEntry {
  keywords: string[];
  response: string;
}

const FAQ_FALLBACK: FAQEntry[] = [
  { keywords: ['livraison', 'delivery', 'shipping', 'délai', 'livrezon'], response: '📦 Livraison France : 3-7 jours ouvrés. DOM-TOM : 7-14 jours. Gratuite dès 49€ en France métropolitaine !' },
  { keywords: ['retour', 'return', 'rembours', 'refund', 'retounen'], response: '🔄 Retour sous 14 jours, article non utilisé. Contactez contact@maloune.fr pour une étiquette retour.' },
  { keywords: ['paiement', 'payment', 'carte', 'pay', 'peye'], response: '💳 Visa, Mastercard, Apple Pay, Google Pay. Paiements sécurisés SSL.' },
  { keywords: ['contact', 'email', 'aide', 'help', 'kontakte'], response: '📧 Contactez-nous : contact@maloune.fr — Réponse sous 24h !' },
  { keywords: ['suivi', 'tracking', 'colis', 'track', 'koli'], response: '📍 Vérifiez votre email pour le lien de suivi. Pas trouvé ? Écrivez à contact@maloune.fr.' },
];

function faqFallback(text: string): string | null {
  const lower = text.toLowerCase();
  for (const entry of FAQ_FALLBACK) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) return entry.response;
    }
  }
  return null;
}

// ============================================
// 💬 CHAT WIDGET
// ============================================
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  { label: '📦 Livraison', text: 'Quels sont vos délais de livraison ?' },
  { label: '🔄 Retours', text: 'Quelle est votre politique de retour ?' },
  { label: '💳 Paiement', text: 'Quels moyens de paiement acceptez-vous ?' },
  { label: '📧 Contact', text: 'Comment vous contacter ?' },
];

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

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Bonjour ! 👋 Je suis l\'assistant MALOUNE. Comment puis-je vous aider ?',
      }]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMsg]
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.message,
      }]);
    } catch {
      // Fallback to FAQ if API fails
      const fallback = faqFallback(text);
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: fallback || 'Désolé, une erreur est survenue. Contactez-nous à contact@maloune.fr pour une aide immédiate ! 📧',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    setHasNewMessage(false);
  };

  // Simple markdown bold
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .mlc-btn{position:fixed;bottom:24px;right:24px;z-index:9999;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#C49B3C 0%,#A67C2E 50%,#D4AF37 100%);box-shadow:0 4px 20px rgba(196,155,60,.4),0 2px 8px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s}
        .mlc-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(196,155,60,.5)}
        .mlc-btn svg{width:28px;height:28px;fill:#fff;transition:transform .3s}
        .mlc-btn.open svg{transform:rotate(90deg)}
        .mlc-badge{position:absolute;top:-2px;right:-2px;width:18px;height:18px;background:#E53935;border-radius:50%;border:2px solid #fff;animation:mlc-p 1.5s infinite}
        @keyframes mlc-p{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
        .mlc-win{position:fixed;bottom:96px;right:24px;z-index:9998;width:380px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 140px);background:#FAFAF8;border-radius:20px;box-shadow:0 12px 48px rgba(0,0,0,.15),0 4px 16px rgba(0,0,0,.08);display:flex;flex-direction:column;overflow:hidden;font-family:'DM Sans',sans-serif;opacity:0;transform:translateY(20px) scale(.95);pointer-events:none;transition:opacity .3s,transform .3s cubic-bezier(.34,1.56,.64,1)}
        .mlc-win.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all}
        .mlc-hdr{background:linear-gradient(135deg,#1A1A1A,#2D2D2D);padding:16px 20px;display:flex;align-items:center;gap:12px;flex-shrink:0}
        .mlc-av{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#C49B3C,#D4AF37);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:#fff;flex-shrink:0}
        .mlc-hdr-info h3{margin:0;color:#fff;font-size:15px;font-weight:600}
        .mlc-hdr-info p{margin:2px 0 0;color:rgba(255,255,255,.6);font-size:12px}
        .mlc-dot{display:inline-block;width:8px;height:8px;background:#4CAF50;border-radius:50%;margin-right:4px}
        .mlc-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
        .mlc-msgs::-webkit-scrollbar{width:4px}
        .mlc-msgs::-webkit-scrollbar-thumb{background:#D4AF37;border-radius:4px}
        .mlc-msg{max-width:85%;padding:10px 14px;border-radius:16px;font-size:13.5px;line-height:1.55;word-wrap:break-word;animation:mlc-fi .3s ease}
        @keyframes mlc-fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .mlc-msg.user{align-self:flex-end;background:linear-gradient(135deg,#C49B3C,#A67C2E);color:#fff;border-bottom-right-radius:4px}
        .mlc-msg.assistant{align-self:flex-start;background:#fff;color:#1A1A1A;border:1px solid #EBEBEB;border-bottom-left-radius:4px}
        .mlc-typing{display:flex;gap:4px;padding:12px 16px;align-self:flex-start}
        .mlc-typing span{width:8px;height:8px;background:#C49B3C;border-radius:50%;animation:mlc-b 1.4s infinite}
        .mlc-typing span:nth-child(2){animation-delay:.2s}
        .mlc-typing span:nth-child(3){animation-delay:.4s}
        @keyframes mlc-b{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}
        .mlc-quick{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 8px}
        .mlc-quick button{padding:6px 12px;border-radius:20px;border:1px solid #E0D5B8;background:#fff;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;color:#8B7230;transition:all .2s}
        .mlc-quick button:hover{background:#FDF6E3;border-color:#C49B3C}
        .mlc-input{padding:12px 16px;border-top:1px solid #EBEBEB;background:#fff;display:flex;align-items:flex-end;gap:8px;flex-shrink:0}
        .mlc-input textarea{flex:1;border:1px solid #E0E0E0;border-radius:12px;padding:10px 14px;font-size:14px;font-family:'DM Sans',sans-serif;resize:none;max-height:80px;outline:none;background:#F9F9F7;transition:border-color .2s;line-height:1.4}
        .mlc-input textarea:focus{border-color:#C49B3C}
        .mlc-input textarea::placeholder{color:#999}
        .mlc-send{width:40px;height:40px;border-radius:50%;border:none;background:linear-gradient(135deg,#C49B3C,#D4AF37);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .2s,opacity .2s}
        .mlc-send:hover{transform:scale(1.05)}
        .mlc-send:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .mlc-send svg{width:18px;height:18px;fill:#fff}
        .mlc-foot{text-align:center;padding:6px;font-size:11px;color:#AAA;background:#fff;flex-shrink:0}
        @media(max-width:480px){.mlc-win{bottom:0;right:0;width:100vw;height:100vh;max-height:100vh;border-radius:0}.mlc-btn{bottom:16px;right:16px}}
      `}</style>

      <button className={`mlc-btn ${isOpen ? 'open' : ''}`} onClick={toggleChat} aria-label={isOpen ? 'Fermer' : 'Support'}>
        {!isOpen ? (
          <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
        ) : (
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        )}
        {hasNewMessage && !isOpen && <span className="mlc-badge" />}
      </button>

      <div className={`mlc-win ${isOpen ? 'open' : ''}`}>
        <div className="mlc-hdr">
          <div className="mlc-av">M</div>
          <div className="mlc-hdr-info">
            <h3>MALOUNE Support</h3>
            <p><span className="mlc-dot" /> En ligne</p>
          </div>
        </div>

        <div className="mlc-msgs">
          {messages.map(msg => (
            <div key={msg.id} className={`mlc-msg ${msg.role}`}>
              {renderText(msg.content)}
            </div>
          ))}
          {isLoading && (
            <div className="mlc-typing"><span /><span /><span /></div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="mlc-quick">
            {QUICK_ACTIONS.map(qa => (
              <button key={qa.label} onClick={() => sendMessage(qa.text)}>{qa.label}</button>
            ))}
          </div>
        )}

        <div className="mlc-input">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            rows={1}
            disabled={isLoading}
          />
          <button className="mlc-send" onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} aria-label="Envoyer">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>

        <div className="mlc-foot">Propulsé par MALOUNE AI</div>
      </div>
    </>
  );
}
