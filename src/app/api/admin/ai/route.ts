import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Note: For image generation or advanced editing, you might use 
// Gemini Pro Vision or other specialized tools. 
// For this MVP, we create an endpoint that takes a prompt and returns an enhanced description or mock data for an image request.

export async function POST(request: Request) {
  try {
    const { prompt, action } = await request.json(); // action could be 'generate', 'enhance', 'bg-remove-mock'
    
    // Auth Check
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'tahahussen100@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let aiPrompt = prompt;
    if (action === 'enhance') {
      aiPrompt = `Improve this product description for an e-commerce store (return ONLY the description in Arabic): ${prompt}`;
    }

    const result = await model.generateContent(aiPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ result: responseText });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
