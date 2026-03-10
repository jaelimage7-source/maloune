'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ============================================
// 📚 FAQ DATABASE — Ajoute/modifye kesyon isit
// ============================================
interface FAQEntry {
  keywords: string[];
  response: Record<string, string>;
  quickLabel?: Record<string, string>;
}

const FAQ_DATABASE: FAQEntry[] = [
  // --- LIVRAISON ---
  {
    keywords: ['livraison', 'livré', 'delivery', 'shipping', 'délai', 'combien temps', 'expédition', 'ship', 'deliver', 'livrezon', 'voye', 'konbyen tan'],
    response: {
      fr: '📦 **Délais de livraison :**\n\n• France métropolitaine : 3-7 jours ouvrés\n• DOM-TOM (Guadeloupe, Martinique, Guyane, Réunion, Mayotte) : 7-14 jours ouvrés\n• International : selon destination\n\nVous recevrez un email avec le numéro de suivi dès l\'expédition de votre commande.',
      en: '📦 **Delivery times:**\n\n• Metropolitan France: 3-7 business days\n• Overseas territories (DOM-TOM): 7-14 business days\n• International: depends on destination\n\nYou\'ll receive a tracking email once your order ships.',
      ht: '📦 **Delè livrezon :**\n\n• Frans metwopolitèn : 3-7 jou ouvrab\n• DOM-TOM (Gwadloup, Matinik, Giyan, Reyinyon) : 7-14 jou ouvrab\n• Entènasyonal : selon destinasyon\n\nW ap resevwa yon imèl ak nimewo swivi lè kòmand ou a ekspedye.',
    },
  },
  {
    keywords: ['frais livraison', 'coût livraison', 'prix livraison', 'shipping cost', 'free shipping', 'gratuit', 'livraison gratuite', 'gratis'],
    response: {
      fr: '🚚 La livraison est offerte en France métropolitaine à partir de 49€ d\'achat ! En dessous, les frais sont de 4.90€. Pour les DOM-TOM et l\'international, les frais sont calculés au panier.',
      en: '🚚 Free shipping in Metropolitan France for orders over €49! Below that, shipping is €4.90. DOM-TOM and international rates are calculated at checkout.',
      ht: '🚚 Livrezon gratis nan Frans metwopolitèn pou kòmand 49€ oswa plis! Anba sa, frè livrezon se 4.90€. Pou DOM-TOM ak entènasyonal, frè yo kalkile nan pànyè a.',
    },
  },
  {
    keywords: ['suivi', 'tracking', 'colis', 'où est', 'where is', 'track', 'parcel', 'koli', 'kote'],
    response: {
      fr: '📍 Pour suivre votre colis :\n\n1. Vérifiez votre email — vous avez reçu un lien de suivi\n2. Cliquez sur le lien pour voir le statut en temps réel\n\nSi vous ne trouvez pas l\'email, contactez-nous à contact@maloune.fr avec votre numéro de commande.',
      en: '📍 To track your package:\n\n1. Check your email — you received a tracking link\n2. Click the link to see real-time status\n\nCan\'t find the email? Contact us at contact@maloune.fr with your order number.',
      ht: '📍 Pou swiv koli w la :\n\n1. Tcheke imèl ou — ou te resevwa yon lyen swivi\n2. Klike sou lyen an pou wè estati an tan reyèl\n\nSi ou pa jwenn imèl la, kontakte nou nan contact@maloune.fr ak nimewo kòmand ou a.',
    },
  },

  // --- RETOUR / REMBOURSEMENT ---
  {
    keywords: ['retour', 'retourne', 'rembours', 'refund', 'return', 'échange', 'exchange', 'revoye', 'remèt', 'lajan'],
    response: {
      fr: '🔄 **Politique de retour :**\n\n• Vous avez **14 jours** après réception pour retourner un article\n• L\'article doit être non utilisé, dans son emballage d\'origine\n• Contactez contact@maloune.fr pour obtenir une étiquette de retour\n• Le remboursement est effectué sous 5-10 jours ouvrés après réception du retour',
      en: '🔄 **Return policy:**\n\n• You have **14 days** after delivery to return an item\n• Item must be unused, in original packaging\n• Contact contact@maloune.fr for a return label\n• Refund processed within 5-10 business days after we receive the return',
      ht: '🔄 **Politik retou :**\n\n• Ou gen **14 jou** apre ou resevwa l pou retounen yon atik\n• Atik la dwe pa itilize, nan anbalaj orijinal li\n• Kontakte contact@maloune.fr pou jwenn yon etikèt retou\n• Ranbousman an fèt nan 5-10 jou ouvrab apre nou resevwa retou a',
    },
  },

  // --- PAIEMENT ---
  {
    keywords: ['paiement', 'payer', 'carte', 'payment', 'pay', 'visa', 'mastercard', 'apple pay', 'google pay', 'paypal', 'peye', 'kat'],
    response: {
      fr: '💳 **Moyens de paiement acceptés :**\n\n• Carte bancaire (Visa, Mastercard)\n• Apple Pay\n• Google Pay\n\nTous les paiements sont sécurisés par cryptage SSL 256-bit.',
      en: '💳 **Accepted payment methods:**\n\n• Credit/debit card (Visa, Mastercard)\n• Apple Pay\n• Google Pay\n\nAll payments are secured with 256-bit SSL encryption.',
      ht: '💳 **Mwayen peman aksepte :**\n\n• Kat bankè (Visa, Mastercard)\n• Apple Pay\n• Google Pay\n\nTout peman yo sekirize ak kriptaj SSL 256-bit.',
    },
  },

  // --- PRODUITS ---
  {
    keywords: ['produit', 'product', 'catégorie', 'category', 'quoi', 'vendez', 'what sell', 'pwodwi', 'kisa', 'vann'],
    response: {
      fr: '🛍️ **Nos catégories :**\n\n• 💄 Beauté & Soins\n• 🏠 Maison & Déco\n• 📱 Électronique & Tech\n• 👗 Mode & Accessoires\n• 🧘 Bien-être & Santé\n\nDécouvrez toute notre sélection sur maloune.fr/fr/products !',
      en: '🛍️ **Our categories:**\n\n• 💄 Beauty & Care\n• 🏠 Home & Decor\n• 📱 Electronics & Tech\n• 👗 Fashion & Accessories\n• 🧘 Wellness & Health\n\nBrowse our full selection at maloune.fr/en/products!',
      ht: '🛍️ **Kategori nou yo :**\n\n• 💄 Bote & Swen\n• 🏠 Mezon & Deko\n• 📱 Elektwonik & Teknoloji\n• 👗 Mòd & Akseswa\n• 🧘 Byennèt & Sante\n\nDekouvri tout seleksyon nou sou maloune.fr/fr/products!',
    },
  },

  // --- COMMANDE ---
  {
    keywords: ['commande', 'commander', 'order', 'comment commander', 'how to order', 'kòmand', 'koman'],
    response: {
      fr: '🛒 **Comment commander :**\n\n1. Parcourez nos produits sur maloune.fr\n2. Ajoutez au panier\n3. Cliquez sur le panier → "Passer commande"\n4. Renseignez votre adresse de livraison\n5. Choisissez votre moyen de paiement\n6. Confirmez — c\'est fait !\n\nVous recevrez un email de confirmation immédiatement.',
      en: '🛒 **How to order:**\n\n1. Browse our products at maloune.fr\n2. Add to cart\n3. Click cart → "Checkout"\n4. Enter your shipping address\n5. Choose payment method\n6. Confirm — done!\n\nYou\'ll receive a confirmation email right away.',
      ht: '🛒 **Kijan pou kòmande :**\n\n1. Gade pwodwi nou yo sou maloune.fr\n2. Ajoute nan pànyè\n3. Klike sou pànyè a → "Pase kòmand"\n4. Mete adrès livrezon ou\n5. Chwazi mwayen peman\n6. Konfime — se fini!\n\nW ap resevwa yon imèl konfimasyon imedyatman.',
    },
  },

  // --- CONTACT ---
  {
    keywords: ['contact', 'email', 'téléphone', 'phone', 'joindre', 'reach', 'aide humaine', 'human', 'parler', 'speak', 'kontakte', 'rele', 'pale'],
    response: {
      fr: '📧 **Contactez-nous :**\n\n• Email : contact@maloune.fr\n• Réponse sous 24h en jours ouvrés\n\nNotre équipe est là pour vous aider !',
      en: '📧 **Contact us:**\n\n• Email: contact@maloune.fr\n• Response within 24h on business days\n\nOur team is here to help!',
      ht: '📧 **Kontakte nou :**\n\n• Imèl : contact@maloune.fr\n• Repons nan 24è nan jou ouvrab\n\nEkip nou la pou ede w!',
    },
  },

  // --- SÉCURITÉ ---
  {
    keywords: ['sécurité', 'sécurisé', 'secure', 'arnaque', 'scam', 'confiance', 'trust', 'fiable', 'reliable', 'sekirize', 'sekirite'],
    response: {
      fr: '🔒 **Maloune est 100% sécurisé :**\n\n• Paiements cryptés SSL 256-bit\n• Aucune donnée bancaire stockée\n• Politique de retour 14 jours\n• Entreprise enregistrée en France\n\nVotre confiance est notre priorité.',
      en: '🔒 **Maloune is 100% secure:**\n\n• 256-bit SSL encrypted payments\n• No banking data stored\n• 14-day return policy\n• Registered business in France\n\nYour trust is our priority.',
      ht: '🔒 **Maloune 100% sekirize :**\n\n• Peman kripte SSL 256-bit\n• Pa gen done bankè estoke\n• Politik retou 14 jou\n• Antrepriz anrejistre an Frans\n\nKonfyans ou se priyorite nou.',
    },
  },

  // --- DOM-TOM ---
  {
    keywords: ['guadeloupe', 'martinique', 'guyane', 'réunion', 'mayotte', 'dom-tom', 'dom tom', 'outre-mer', 'overseas', 'gwadloup', 'matinik', 'giyan'],
    response: {
      fr: '🌴 **Oui, nous livrons dans les DOM-TOM !**\n\n• Guadeloupe, Martinique, Guyane française, Réunion, Mayotte\n• Délai : 7-14 jours ouvrés\n• Frais calculés au panier selon le poids\n\nLa diaspora est au cœur de notre mission !',
      en: '🌴 **Yes, we deliver to French overseas territories!**\n\n• Guadeloupe, Martinique, French Guiana, Réunion, Mayotte\n• Delivery: 7-14 business days\n• Fees calculated at checkout by weight\n\nThe diaspora is at the heart of our mission!',
      ht: '🌴 **Wi, nou livre nan DOM-TOM yo !**\n\n• Gwadloup, Matinik, Giyan fransèz, Reyinyon, Mayòt\n• Delè : 7-14 jou ouvrab\n• Frè kalkile nan pànyè a selon pwa\n\nDyaspora a se kè misyon nou!',
    },
  },

  // --- PROMO / REDUCTION ---
  {
    keywords: ['promo', 'promotion', 'code', 'réduction', 'discount', 'coupon', 'solde', 'sale', 'rabais', 'pwomosyon', 'rabè'],
    response: {
      fr: '🏷️ **Promotions MALOUNE :**\n\n• Inscrivez-vous à notre newsletter pour recevoir des offres exclusives\n• Suivez-nous sur les réseaux sociaux pour les ventes flash\n• Livraison gratuite dès 49€ d\'achat\n\nEntrez votre code promo au moment du paiement dans le champ dédié.',
      en: '🏷️ **MALOUNE Promotions:**\n\n• Subscribe to our newsletter for exclusive deals\n• Follow us on social media for flash sales\n• Free shipping on orders over €49\n\nEnter your promo code at checkout in the dedicated field.',
      ht: '🏷️ **Pwomosyon MALOUNE :**\n\n• Enskri nan newsletter nou pou resevwa òf eksklizif\n• Swiv nou sou rezo sosyal pou vant flash\n• Livrezon gratis pou kòmand 49€ oswa plis\n\nAntre kòd pwomo w la nan moman peman an nan chan ki la pou sa a.',
    },
  },
];

// Quick action buttons
const QUICK_ACTIONS: Record<string, { label: string; keyword: string }[]> = {
  fr: [
    { label: '📦 Livraison', keyword: 'livraison' },
    { label: '🔄 Retour', keyword: 'retour' },
    { label: '💳 Paiement', keyword: 'paiement' },
    { label: '📧 Contact', keyword: 'contact' },
  ],
  en: [
    { label: '📦 Shipping', keyword: 'delivery' },
    { label: '🔄 Returns', keyword: 'return' },
    { label: '💳 Payment', keyword: 'payment' },
    { label: '📧 Contact', keyword: 'contact' },
  ],
  ht: [
    { label: '📦 Livrezon', keyword: 'livrezon' },
    { label: '🔄 Retou', keyword: 'retour' },
    { label: '💳 Peman', keyword: 'paiement' },
    { label: '📧 Kontakte', keyword: 'contact' },
  ],
};

// ============================================
// 🧠 SMART MATCHING ENGINE
// ============================================
function detectLanguage(text: string): string {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  
  // Strong Creole-only indicators (not shared with French)
  const htStrong = ["mwen", "kisa", "koman", "poukisa", "konbyen", "tanpri", "souple", "bonswa", "bonjou", "mèsi", "kòmand", "kob", "eske", "kote", "kijan", "pou m", "m ka", "w ap", "ki jan", "pa gen", "ann", "ede m", "ki sa", "li ap", "nou", "yo", "poko", "deja"];
  const enStrong = ["the", "what", "where", "how", "when", "please", "thank", "can i", "want", "need", "order", "ship", "return", "help", "much", "long", "my", "is", "are", "this", "that", "have", "do", "does", "would", "could"];
  
  let htScore = 0;
  let enScore = 0;
  
  htStrong.forEach(w => { if (lower.includes(w)) htScore += 2; });
  enStrong.forEach(w => { if (lower.includes(w)) enScore += 2; });
  
  // French is default - only switch if strong evidence
  if (htScore >= 4 && htScore > enScore * 2) return "ht";
  if (enScore >= 4 && enScore > htScore * 2) return "en";
  return "fr";
}

function findBestMatch(input: string): { response: string; lang: string } | null {
  const lower = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const lang = detectLanguage(input);
  
  let bestMatch: FAQEntry | null = null;
  let bestScore = 0;
  
  for (const entry of FAQ_DATABASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      if (lower.includes(normalizedKeyword)) {
        // Longer keyword matches score higher
        score += normalizedKeyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  
  if (bestMatch && bestScore >= 3) {
    const response = bestMatch.response[lang] || bestMatch.response['fr'];
    return { response, lang };
  }
  
  return { response: '', lang };
}

function getDefaultResponse(lang: string): string {
  const responses: Record<string, string> = {
    fr: "Je n'ai pas trouvé de réponse exacte à votre question. 🤔\n\nVoici ce que je peux vous aider avec :\n• 📦 Livraison et suivi\n• 🔄 Retours et remboursements\n• 💳 Paiement\n• 🛍️ Nos produits\n• 📧 Contact\n\nOu contactez-nous directement à **contact@maloune.fr** — nous répondons sous 24h !",
    en: "I couldn't find an exact answer to your question. 🤔\n\nHere's what I can help with:\n• 📦 Shipping & tracking\n• 🔄 Returns & refunds\n• 💳 Payment\n• 🛍️ Our products\n• 📧 Contact\n\nOr reach us directly at **contact@maloune.fr** — we respond within 24h!",
    ht: "Mwen pa jwenn yon repons egzak pou kesyon w la. 🤔\n\nMen sa m ka ede w ak:\n• 📦 Livrezon ak swivi\n• 🔄 Retou ak ranbousman\n• 💳 Peman\n• 🛍️ Pwodwi nou yo\n• 📧 Kontak\n\nOswa kontakte nou dirèkteman nan **contact@maloune.fr** — nou reponn nan 24è!",
  };
  return responses[lang] || responses['fr'];
}

function getWelcomeMessage(lang: string): string {
  const msgs: Record<string, string> = {
    fr: "Bonjour ! 👋 Je suis l'assistant MALOUNE.\n\nComment puis-je vous aider aujourd'hui ?",
    en: "Hello! 👋 I'm the MALOUNE assistant.\n\nHow can I help you today?",
    ht: "Bonjou! 👋 Mwen se asistan MALOUNE.\n\nKijan m ka ede w jodi a?",
    es: "¡Hola! 👋 Soy el asistente de MALOUNE.\n\n¿Cómo puedo ayudarte?",
  };
  return msgs[lang] || msgs['fr'];
}

// ============================================
// 💬 CHAT WIDGET COMPONENT
// ============================================
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [userLang, setUserLang] = useState('fr');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const lang = typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2) || 'fr' : 'fr';
      const detectedLang = ['en', 'ht', 'es'].includes(lang) ? lang : 'fr';
      setUserLang(detectedLang);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(detectedLang),
      }]);
    }
  }, [isOpen, messages.length]);

  const processMessage = (text: string) => {
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Small delay for natural feel
    setTimeout(() => {
      const match = findBestMatch(text);
      const lang = match?.lang || userLang;
      setUserLang(lang);

      const response = match?.response || getDefaultResponse(lang);
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response || getDefaultResponse(lang),
      }]);
    }, 400 + Math.random() * 600);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    processMessage(text);
  };

  const handleQuickAction = (keyword: string) => {
    processMessage(keyword);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    setHasNewMessage(false);
  };

  const quickActions = QUICK_ACTIONS[userLang] || QUICK_ACTIONS['fr'];

  // Simple markdown bold rendering
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .mlc-btn {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
          background: linear-gradient(135deg, #C49B3C 0%, #A67C2E 50%, #D4AF37 100%);
          box-shadow: 0 4px 20px rgba(196,155,60,0.4), 0 2px 8px rgba(0,0,0,0.15);
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
        }
        .mlc-btn:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(196,155,60,0.5); }
        .mlc-btn svg { width: 28px; height: 28px; fill: white; transition: transform 0.3s; }
        .mlc-btn.open svg { transform: rotate(90deg); }
        .mlc-badge {
          position: absolute; top: -2px; right: -2px; width: 18px; height: 18px;
          background: #E53935; border-radius: 50%; border: 2px solid white;
          animation: mlc-pulse 1.5s infinite;
        }
        @keyframes mlc-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }

        .mlc-win {
          position: fixed; bottom: 96px; right: 24px; z-index: 9998;
          width: 380px; max-width: calc(100vw - 32px); height: 540px; max-height: calc(100vh - 140px);
          background: #FAFAF8; border-radius: 20px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08);
          display: flex; flex-direction: column; overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          opacity: 0; transform: translateY(20px) scale(0.95); pointer-events: none;
          transition: opacity 0.3s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .mlc-win.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }

        .mlc-hdr {
          background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
          padding: 16px 20px; display: flex; align-items: center; gap: 12px; flex-shrink: 0;
        }
        .mlc-av {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #C49B3C, #D4AF37);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 18px; color: white; flex-shrink: 0;
        }
        .mlc-hdr-info h3 { margin: 0; color: white; font-size: 15px; font-weight: 600; }
        .mlc-hdr-info p { margin: 2px 0 0; color: rgba(255,255,255,0.6); font-size: 12px; }
        .mlc-dot { display: inline-block; width: 8px; height: 8px; background: #4CAF50; border-radius: 50%; margin-right: 4px; }

        .mlc-msgs {
          flex: 1; overflow-y: auto; padding: 16px; display: flex;
          flex-direction: column; gap: 10px; scroll-behavior: smooth;
        }
        .mlc-msgs::-webkit-scrollbar { width: 4px; }
        .mlc-msgs::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 4px; }

        .mlc-msg {
          max-width: 85%; padding: 10px 14px; border-radius: 16px;
          font-size: 13.5px; line-height: 1.55; word-wrap: break-word;
          animation: mlc-fadeIn 0.3s ease;
        }
        @keyframes mlc-fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .mlc-msg.user {
          align-self: flex-end; background: linear-gradient(135deg, #C49B3C, #A67C2E);
          color: white; border-bottom-right-radius: 4px;
        }
        .mlc-msg.assistant {
          align-self: flex-start; background: white; color: #1A1A1A;
          border: 1px solid #EBEBEB; border-bottom-left-radius: 4px;
        }

        .mlc-quick {
          display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 8px;
        }
        .mlc-quick button {
          padding: 6px 12px; border-radius: 20px; border: 1px solid #E0D5B8;
          background: white; font-size: 12px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; color: #8B7230;
          transition: all 0.2s;
        }
        .mlc-quick button:hover { background: #FDF6E3; border-color: #C49B3C; }

        .mlc-input {
          padding: 12px 16px; border-top: 1px solid #EBEBEB; background: white;
          display: flex; align-items: flex-end; gap: 8px; flex-shrink: 0;
        }
        .mlc-input textarea {
          flex: 1; border: 1px solid #E0E0E0; border-radius: 12px;
          padding: 10px 14px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          resize: none; max-height: 80px; outline: none; background: #F9F9F7;
          transition: border-color 0.2s; line-height: 1.4;
        }
        .mlc-input textarea:focus { border-color: #C49B3C; }
        .mlc-input textarea::placeholder { color: #999; }
        .mlc-send {
          width: 40px; height: 40px; border-radius: 50%; border: none;
          background: linear-gradient(135deg, #C49B3C, #D4AF37);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: transform 0.2s, opacity 0.2s;
        }
        .mlc-send:hover { transform: scale(1.05); }
        .mlc-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .mlc-send svg { width: 18px; height: 18px; fill: white; }

        .mlc-foot {
          text-align: center; padding: 6px; font-size: 11px; color: #AAA;
          background: white; flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .mlc-win { bottom: 0; right: 0; width: 100vw; height: 100vh; max-height: 100vh; border-radius: 0; }
          .mlc-btn { bottom: 16px; right: 16px; }
        }
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
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="mlc-quick">
            {quickActions.map(qa => (
              <button key={qa.keyword} onClick={() => handleQuickAction(qa.keyword)}>
                {qa.label}
              </button>
            ))}
          </div>
        )}

        <div className="mlc-input">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={userLang === 'en' ? 'Type your message...' : userLang === 'ht' ? 'Ekri mesaj ou...' : 'Écrivez votre message...'}
            rows={1}
          />
          <button className="mlc-send" onClick={handleSend} disabled={!input.trim()} aria-label="Envoyer">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>

        <div className="mlc-foot">MALOUNE — Support Client</div>
      </div>
    </>
  );
}
