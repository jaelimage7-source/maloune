import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de MALOUNE (maloune.fr), une boutique e-commerce premium qui livre en France métropolitaine et dans les DOM-TOM (Guadeloupe, Martinique, Guyane française, Réunion, Mayotte).

🌐 LANGUES : Tu détectes automatiquement la langue du client et réponds dans cette même langue. Tu parles français, anglais, créole haïtien, espagnol, et toute autre langue courante. Si le client écrit en créole, réponds en créole.

📦 INFORMATIONS BOUTIQUE :
- Site : maloune.fr
- Catégories : Beauté & Soins, Maison & Déco, Électronique, Mode & Accessoires, Bien-être
- Livraison France métropolitaine : 3-7 jours ouvrés
- Livraison DOM-TOM : 7-14 jours ouvrés
- Livraison internationale : selon destination
- Paiement : Carte bancaire (Visa, Mastercard), Apple Pay, Google Pay
- Retours : 14 jours après réception, article non utilisé dans son emballage d'origine
- Email support : contact@maloune.fr

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
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { messages }: { messages: ChatMessage[] } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages required' },
        { status: 400 }
      );
    }

    // Limit conversation history to last 20 messages to control costs
    const recentMessages = messages.slice(-20);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: recentMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const assistantMessage =
      data.content?.[0]?.text || 'Désolé, je ne peux pas répondre pour le moment.';

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
