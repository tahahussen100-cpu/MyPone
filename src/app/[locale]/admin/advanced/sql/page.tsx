"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, AlertTriangle } from 'lucide-react';

export default function SQLEditor() {
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/admin/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Execution failed');
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col font-cairo">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-tajawal text-destructive flex items-center gap-3">
            <Database className="w-8 h-8" />
            Advanced SQL Editor
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent" />
            Warning: This executes queries directly on the production database. Run with EXTREME caution.
          </p>
        </div>
        <Button 
          variant="destructive" 
          onClick={executeQuery} 
          disabled={loading || !query}
          className="gap-2 px-8"
        >
          <Play className="w-4 h-4" /> {loading ? 'Executing...' : 'Run Query'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[600px]">
        <div className="flex flex-col">
          <label className="font-bold mb-2">Query Editor</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 w-full bg-[#1E1E1E] text-[#D4D4D4] p-4 font-mono rounded-lg outline-none focus:ring-2 focus:ring-destructive resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-bold mb-2">Results Console</label>
          <div className="flex-1 bg-card border border-border rounded-lg p-4 overflow-auto font-mono text-sm relative">
            {error ? (
              <div className="text-destructive whitespace-pre-wrap">{error}</div>
            ) : result ? (
              <pre className="text-primary">{JSON.stringify(result, null, 2)}</pre>
            ) : (
              <div className="text-muted-foreground absolute inset-0 flex items-center justify-center opacity-50">
                Awaiting Query Execution
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Needed local icon
function Database(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
  );
}
