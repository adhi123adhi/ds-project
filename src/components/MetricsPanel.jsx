import React, { useState, useEffect } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

const PIPELINE_STEPS = [
  "User Input",
  "Preprocessing",
  "Intent Recognition",
  "Query Mapping",
  "Data Retrieval",
  "Filtering",
  "Response"
];

// --- NLP Pipeline Visualizer ---
export function NLPPipeline({ activeStep }) {
  return (
    <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(5,16,42,0.8)', border: '1px solid rgba(45,212,191,0.15)' }}>
      <p className="text-xs font-semibold text-teal-400 mb-2 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" style={{ boxShadow: '0 0 6px #14b8a6' }}></span>
        NLP Processing Pipeline
      </p>
      <div className="flex flex-wrap gap-1 items-center">
        {PIPELINE_STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <div className={`pipeline-step ${i < activeStep ? 'completed' : ''} ${i === activeStep ? 'active' : ''}`}>
              {i < activeStep && <span>✓</span>}
              {i === activeStep && <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block animate-pulse"></span>}
              {step}
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div className="pipeline-connector" style={{ opacity: i < activeStep ? 0.8 : 0.3 }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// --- Performance Metrics Sidebar Panel ---
export function MetricsPanel({ queryCount, lastResponseTime, isProcessing }) {
  const [accuracy, setAccuracy] = useState(67);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (queryCount > 0 && !animating) {
      setAnimating(true);
      setAccuracy(67);
      const timer = setTimeout(() => setAccuracy(92), 100);
      return () => clearTimeout(timer);
    }
  }, [queryCount]);

  const radialData = [{ name: 'Accuracy', value: accuracy, fill: accuracy > 85 ? '#14b8a6' : '#fb923c' }];

  return (
    <div className="space-y-4">
      {/* Accuracy Gauge */}
      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Retrieval Accuracy</p>
        <div className="flex items-center gap-3">
          <div style={{ width: 80, height: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="85%" data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" background={{ fill: 'rgba(10,31,74,0.8)' }} cornerRadius={4} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: accuracy > 85 ? '#2dd4bf' : '#fb923c' }}>
              {accuracy}%
            </p>
            <p className="text-xs text-slate-500">
              <span className="line-through text-red-400">67%</span>
              <span className="text-green-400 ml-1">↑ {accuracy - 67}%</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">vs. Baseline</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Proposed System</span>
            <span className="text-teal-400">{accuracy}%</span>
          </div>
          <div className="metric-bar">
            <div className="metric-bar-fill" style={{ width: `${accuracy}%`, background: 'linear-gradient(90deg,#14b8a6,#06b6d4)' }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2 mb-1">
            <span>Existing System</span>
            <span className="text-red-400">67%</span>
          </div>
          <div className="metric-bar">
            <div className="metric-bar-fill" style={{ width: '67%', background: 'linear-gradient(90deg,#ef4444,#f87171)' }} />
          </div>
        </div>
      </div>

      {/* Response Time */}
      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Response Time</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-teal-300">AI System</span>
              <span className="text-teal-400 font-mono">{lastResponseTime > 0 ? `${lastResponseTime}s` : '—'}</span>
            </div>
            <div className="metric-bar">
              <div className="metric-bar-fill" style={{
                width: lastResponseTime > 0 ? `${(lastResponseTime / 3.5) * 100}%` : '0%',
                background: 'linear-gradient(90deg,#14b8a6,#06b6d4)',
                transition: 'width 0.8s ease'
              }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Legacy System</span>
              <span className="text-red-400 font-mono">3.2–3.5s</span>
            </div>
            <div className="metric-bar">
              <div className="metric-bar-fill" style={{ width: '92%', background: 'linear-gradient(90deg,#ef4444,#f97316)' }} />
            </div>
          </div>
        </div>
        <p className="text-xs text-green-400 mt-3 font-medium">
          ↓ ~{lastResponseTime > 0 ? (3.35 - lastResponseTime).toFixed(1) : '2.0'}s faster than legacy
        </p>
      </div>

      {/* Query Counter */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Queries</p>
          <p className="text-3xl font-bold text-teal-400 mt-1">{queryCount}</p>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)' }}>
          <span className="text-xl">🔍</span>
        </div>
      </div>

      {/* System Status */}
      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">System Status</p>
        {[
          { label: 'NLP Engine', status: true },
          { label: 'Intent Recognition', status: true },
          { label: 'Data Retrieval API', status: true },
          { label: 'Voice Module', status: true },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-1.5">
            <span className="text-xs text-slate-400">{item.label}</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'animate-pulse bg-yellow-400' : 'bg-green-400'}`}
                style={{ boxShadow: isProcessing ? '0 0 6px #facc15' : '0 0 6px #4ade80' }} />
              <span className={`text-xs ${isProcessing ? 'text-yellow-400' : 'text-green-400'}`}>
                {isProcessing ? 'Processing' : 'Online'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
