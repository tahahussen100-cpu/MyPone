"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wand2, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function AIToolPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAIRequest = async (action: string) => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setResult(data.result);
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-tajawal text-primary flex items-center gap-3">
          <Wand2 className="w-8 h-8" />
          AI Enhancement Tools
        </h1>
        <p className="text-muted-foreground mt-2 font-cairo">
          Leverage Gemini AI to generate product descriptions or process images.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-8">
        <div className="space-y-6">
          <div>
            <label className="font-bold mb-2 block font-cairo">Input Prompt / Text</label>
            <textarea
              className="w-full min-h-[120px] rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y font-cairo"
              placeholder="Enter product specs or describe what you need..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <Button 
              onClick={() => handleAIRequest('enhance')} 
              disabled={loading || !prompt}
              className="gap-2 bg-gradient-to-r from-primary to-accent text-white border-0"
            >
              <Sparkles className="w-4 h-4" /> Enhance Arabic Description
            </Button>
            
            <Button 
              onClick={() => handleAIRequest('generate')} 
              disabled={loading || !prompt}
              variant="outline"
              className="gap-2"
            >
              <Wand2 className="w-4 h-4" /> General AI Prompt
            </Button>

            <Button 
              disabled={true} // Placeholder for UI
              variant="secondary"
              className="gap-2"
              title="Requires Google Cloud Vision API integration"
            >
              <ImageIcon className="w-4 h-4" /> Remove Background (Coming Soon)
            </Button>
          </div>
        </div>
      </div>

      {(result || loading) && (
        <div className="bg-secondary border border-border rounded-xl p-6">
          <h3 className="font-bold mb-4 font-cairo flex items-center gap-2">
            <Sparkles className="text-primary w-5 h-5" /> 
            AI Response
          </h3>
          <div className="bg-background rounded-md p-4 min-h-[100px] whitespace-pre-wrap font-cairo leading-relaxed">
            {loading ? <span className="animate-pulse">Gemini is thinking...</span> : result}
          </div>
        </div>
      )}
    </div>
  );
}
