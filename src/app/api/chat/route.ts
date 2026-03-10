export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de MALOUNE (maloune.fr), une boutique e-commerce premium qui livre en France métropolitaine et dans les DOM-TOM (Guadeloupe, Martinique, Guyane française, Réunion, Mayotte).

🌐 LANGUES : Tu détectes automatiquement la langue du client et réponds TOUJOURS dans cette même langue. Si le client écrit en français, réponds en français. Si en anglais, réponds en anglais. Si en créole haïtien, réponds en créole haïtien. Si en espagnol, réponds en espagnol. Ne mélange JAMAIS les langues.

📦 INFORMATIONS BOUTIQUE :
- Site : maloune.fr
- Catégories : Beauté & Soins, Maison & Déco, Électronique, Mode & Accessoires, Bien-être
- Livraison France métropolitaine : 3-7 jours ouvrés
- Livraison DOM-TOM (Guadeloupe, Martinique, Guyane, Réunion, Mayotte) : 7-14 jours ouvrés
- Livraison gratuite dès 49€ en France métropolitaine, sinon 4.90€
- Livraison internationale : selon destination
- Paiement : Carte bancaire (Visa, Mastercard), Apple Pay, Google Pay
- Retours : 14 jours après réception, article non utilisé dans son emballage d'origine. Remboursement sous 5-10 jours ouvrés.
- Email support : contact@maloune.fr
- Paiements sécurisés SSL 256-bit

🎯 TON RÔLE :
- Répondre aux questions sur les produits, livraisons, retours, et paiements
- Être chaleureux, professionnel et efficace
- Proposer des produits pertinents si le client cherche quelque chose
- Si tu ne connais pas la réponse exacte, oriente vers contact@maloune.fr
- Ne jamais inventer de prix ou de délais que tu ne connais pas
- Garder les réponses concises (2-4 phrases max sauf si le client demande plus de détails)

💬 STYLE :
- Amical mais professionnel
- Utilise des émojis avec parcimonie (1-2 max par message)
- Tutoiement en français si le client tutoie, sinon vouvoiement
- Sois direct et utile, pas verbeux`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const { messages }: { messages: ChatMessage[] } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    const recentMessages = messages.slice(-20);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...recentMessages.map(m => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const data = await response.json();
    const assistantMessage =
      data?.choices?.[0]?.message?.content ||
      'Désolé, je ne peux pas répondre pour le moment. Contactez contact@maloune.fr';

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
