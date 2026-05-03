import React, { useState, useCallback } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { MetricsPanel } from './components/MetricsPanel';
import { SYSTEM_PROMPT } from './data/groundwaterData';



export default function App() {
  const [queryCount, setQueryCount] = useState(0);
  const [lastResponseTime, setLastResponseTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleQuery = useCallback(async (userQuery) => {
    setIsProcessing(true);
    const start = Date.now();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userQuery },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content || 'No response received.';
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      setLastResponseTime(parseFloat(elapsed));
      setQueryCount(c => c + 1);
      return reply;
    } catch (e) {
      return `⚠️ **Error:** ${e.message}\n\nPlease check your API key and try again.`;
    } finally {
      setIsProcessing(false);
    }
  }, []);


  return (
    <div className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top left, #051428 0%, #020818 60%)' }}>

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: 'rgba(45,212,191,0.15)', background: 'rgba(5,16,42,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#14b8a6,#0891b2)', boxShadow: '0 0 15px rgba(20,184,166,0.4)' }}>
            <span className="text-lg">🌊</span>
          </div>
          <div>
            <h1 className="text-base font-bold header-glow" style={{ color: '#2dd4bf', lineHeight: 1.2 }}>
              INGRESS Groundwater Assistant
            </h1>
            <p className="text-xs text-slate-500">NVIDIA Llama 3.1 70B · NLP Data Retrieval Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 6px #4ade80' }} />
            <span className="text-xs text-green-400 font-medium">System Online</span>
          </div>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="text-xs text-slate-400 hover:text-teal-400 transition-colors px-2 py-1 rounded-lg"
            style={{ border: '1px solid rgba(45,212,191,0.2)' }}>
            {sidebarOpen ? '⟩ Hide Metrics' : '⟨ Show Metrics'}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Chat area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatWindow
            onQuery={handleQuery}
            isProcessing={isProcessing}
            pipelineStep={pipelineStep}
          />
        </main>

        {/* Metrics Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 flex-shrink-0 overflow-y-auto p-3 border-l"
            style={{ borderColor: 'rgba(45,212,191,0.1)', background: 'rgba(5,16,42,0.6)' }}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
              📊 Performance Metrics
            </p>
            <MetricsPanel
              queryCount={queryCount}
              lastResponseTime={lastResponseTime}
              isProcessing={isProcessing}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
