import React, { useState, useEffect, useRef } from 'react';
import { NLPPipeline } from './MetricsPanel';

const QUICK_QUERIES = [
  "What is the current groundwater level in Coimbatore?",
  "Show rainfall data for 2024 monsoon season",
  "Which district has the lowest water availability?",
  "Water usage statistics for agricultural sector",
  "Compare groundwater levels: summer vs monsoon"
];

const PIPELINE_STEPS_COUNT = 7;

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center px-3 py-2">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  );
}

function WaveAnimation() {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="wave-bar" style={{ animationDelay: `${(i-1) * 0.15}s` }} />
      ))}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1"
          style={{ background: 'linear-gradient(135deg,#14b8a6,#06b6d4)', boxShadow: '0 0 12px rgba(20,184,166,0.4)' }}>
          <span className="text-xs">🌊</span>
        </div>
      )}
      <div className="flex flex-col" style={{ maxWidth: isUser ? '75%' : '85%' }}>
        {msg.isVoice && isUser && (
          <div className="flex justify-end mb-1">
            <span className="status-badge" style={{ background:'rgba(239,68,68,0.2)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)' }}>
              🎤 Voice → Text
            </span>
          </div>
        )}
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
          {isUser ? (
            <span>{msg.content}</span>
          ) : (
            <div className="prose-sm" dangerouslySetInnerHTML={{ __html: formatAIResponse(msg.content) }} />
          )}
        </div>
        {!isUser && msg.content && (
          <div className="source-tag mt-1">
            <span>🗄️</span>
            <span>Source: INGRESS Monitoring Station DB — Last updated: April 2026</span>
          </div>
        )}
        <span className="text-xs text-slate-600 mt-1 px-1">
          {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center ml-2 flex-shrink-0 mt-1"
          style={{ background: 'rgba(13,40,96,0.9)', border: '1px solid rgba(45,212,191,0.3)' }}>
          <span className="text-xs">👤</span>
        </div>
      )}
    </div>
  );
}

function formatAIResponse(text) {
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#2dd4bf">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(20,184,166,0.15);padding:1px 4px;border-radius:3px;font-size:11px;color:#7dd3fc">$1</code>')
    .replace(/🔴/g, '<span style="color:#f87171">🔴</span>')
    .replace(/🟠/g, '<span style="color:#fb923c">🟠</span>')
    .replace(/🟢/g, '<span style="color:#4ade80">🟢</span>');

  // Convert markdown table to HTML
  if (html.includes('|')) {
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '<table class="data-table">';
    let isHeader = true;
    const result = [];
    for (const line of lines) {
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (!inTable) { inTable = true; }
        if (line.includes('---')) { isHeader = false; continue; }
        const cells = line.split('|').filter(c => c.trim());
        const tag = isHeader ? 'th' : 'td';
        tableHtml += `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
        if (isHeader && !line.includes('---')) { tableHtml += '<thead>'; isHeader = false; }
      } else {
        if (inTable) { tableHtml += '</table>'; result.push(tableHtml); tableHtml = '<table class="data-table">'; inTable = false; isHeader = true; }
        result.push(line);
      }
    }
    if (inTable) { tableHtml += '</table>'; result.push(tableHtml); }
    html = result.join('\n');
  }

  html = html
    .replace(/\n\n/g, '</p><p style="margin-top:6px">')
    .replace(/\n/g, '<br/>');

  return `<p>${html}</p>`;
}

export function ChatWindow({ onQuery, isProcessing, pipelineStep }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hello! I'm the **INGRESS Groundwater Assistant** 🌊\n\nI can help you retrieve and analyze groundwater data across Tamil Nadu districts. You can ask about:\n- Current water levels by district\n- Rainfall records and seasonal trends\n- Water usage by sector\n- Monitoring station status\n\nTry a quick query below or type your own question!",
    ts: Date.now()
  }]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [pendingVoice, setPendingVoice] = useState(false);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [localPipeline, setLocalPipeline] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, localProcessing]);

  const handleSend = async (text, isVoice = false) => {
    const query = text || input.trim();
    if (!query || localProcessing) return;
    setInput('');
    setLocalProcessing(true);
    setLocalPipeline(0);

    const userMsg = { role: 'user', content: query, isVoice, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    // Animate pipeline
    for (let i = 1; i <= 6; i++) {
      await new Promise(r => setTimeout(r, 300));
      setLocalPipeline(i);
    }

    const start = Date.now();
    const reply = await onQuery(query);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }]);
    setLocalProcessing(false);
    setLocalPipeline(-1);
    return elapsed;
  };

  const handleVoice = () => {
    setIsListening(true);
    setPendingVoice(true);
    inputRef.current?.focus();
  };

  const handleVoiceSubmit = () => {
    if (pendingVoice && input.trim()) {
      handleSend(input.trim(), true);
      setPendingVoice(false);
      setIsListening(false);
    } else {
      setIsListening(false);
      setPendingVoice(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick Query Chips */}
      <div className="px-4 py-2 flex gap-2 flex-wrap border-b" style={{ borderColor: 'rgba(45,212,191,0.1)' }}>
        {QUICK_QUERIES.map((q, i) => (
          <button key={i} className="quick-chip" style={{ width: 'auto' }}
            onClick={() => handleSend(q)} disabled={localProcessing}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ minHeight: 0 }}>
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {localProcessing && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#14b8a6,#06b6d4)' }}>
              <span className="text-xs">🌊</span>
            </div>
            <div className="chat-bubble-ai">
              <TypingIndicator />
            </div>
          </div>
        )}
        {localProcessing && <NLPPipeline activeStep={localPipeline} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(45,212,191,0.1)' }}>
        {isListening && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <WaveAnimation />
            <span className="text-xs text-red-400 font-medium">Listening... Type your query and press Enter</span>
            <button onClick={handleVoiceSubmit} className="ml-auto text-xs text-red-400 hover:text-red-300">Submit ✓</button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <button
            onClick={isListening ? handleVoiceSubmit : handleVoice}
            className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all ${isListening ? 'mic-pulse' : ''}`}
            style={{
              background: isListening ? 'rgba(239,68,68,0.3)' : 'rgba(13,40,96,0.9)',
              border: `1px solid ${isListening ? 'rgba(239,68,68,0.6)' : 'rgba(45,212,191,0.3)'}`,
            }}
            title={isListening ? "Submit voice query" : "Voice input"}>
            <span className="text-lg">{isListening ? '⏹' : '🎤'}</span>
          </button>
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); pendingVoice ? handleVoiceSubmit() : handleSend(); }}}
              placeholder={isListening ? "Speak your query... (type it here)" : "Ask about groundwater data, rainfall, water usage..."}
              rows={1}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                background: 'rgba(10,31,74,0.8)',
                border: `1px solid ${isListening ? 'rgba(239,68,68,0.5)' : 'rgba(45,212,191,0.25)'}`,
                color: '#cbd5e1',
                maxHeight: '120px',
                transition: 'border-color 0.2s',
              }}
              disabled={localProcessing}
            />
          </div>
          <button
            onClick={() => pendingVoice ? handleVoiceSubmit() : handleSend()}
            disabled={!input.trim() || localProcessing}
            className="teal-btn w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
            <span className="text-lg">↑</span>
          </button>
        </div>
      </div>
    </div>
  );
}
