'use client';

import { useState, useEffect } from 'react';
import { analyzeError, AnalysisResponse } from '@/lib/api';
import AgentProgress from './components/AgentProgress';
import ClarifierDialog from './components/ClarifierDialog';
import DebugLogOutput from './components/DebugLogOutput';
import { IconBolt, IconTerminal2 } from '@tabler/icons-react';

const DEFAULT_AGENTS = [
  { name: 'Classifier', label: 'Identifying error type...', status: 'pending' as const },
  { name: 'Clarifier', label: 'Checking for ambiguities...', status: 'pending' as const },
  { name: 'Analyzer', label: 'Analyzing root cause...', status: 'pending' as const },
  { name: 'Researcher', label: 'Finding known patterns...', status: 'pending' as const },
  { name: 'Formatter', label: 'Generating Debug Log...', status: 'pending' as const },
];

type AgentStatus = 'pending' | 'running' | 'done';

export default function Home() {
  const [errorInput, setErrorInput] = useState('');
  const [agents, setAgents] = useState<{ name: string; label: string; status: AgentStatus }[]>(DEFAULT_AGENTS);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [waitingForUser, setWaitingForUser] = useState(false);
  const [clarifyQuestions, setClarifyQuestions] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedError = params.get('error');
    if (sharedError) setErrorInput(decodeURIComponent(sharedError));
  }, []);

  const setAgentStatus = (index: number, status: AgentStatus, label?: string) => {
    setAgents(prev => prev.map((a, i) =>
      i === index ? { ...a, status, label: label ?? a.label } : a
    ));
  };

  const resetAgents = () => setAgents(DEFAULT_AGENTS.map(a => ({ ...a, status: 'pending' as AgentStatus })));
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const runAnalysis = async (userContext?: string) => {
    if (!userContext) {
      resetAgents();
      setResult(null);
      setErrorMessage('');
      setWaitingForUser(false);
    }

    setIsRunning(true);
    setAgentStatus(0, 'running', 'Identifying error type...');

    try {
      const response = await analyzeError({ error: errorInput, userContext });

      setAgentStatus(0, 'done', 'Error identified');
      await delay(300);
      setAgentStatus(1, 'done', 'Confirmed');
      await delay(300);
      setAgentStatus(2, 'done', 'Root cause found');
      await delay(300);
      setAgentStatus(3, 'done', 'Patterns found');
      await delay(300);
      setAgentStatus(4, 'done', 'Debug Log ready');

      if (response.needsUserInput && !userContext) {
        setClarifyQuestions(response.clarification.questions);
        setWaitingForUser(true);
        setIsRunning(false);
        return;
      }

      setResult(response);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Backend is waking up ☕ Please wait 30 seconds and try again.';
      setErrorMessage(msg);
      resetAgents();
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = () => {
    if (!errorInput.trim() || errorInput.length > 3000) return;
    runAnalysis();
  };

  const handleRetry = () => {
    setResult(null);
    runAnalysis();
  };

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?error=${encodeURIComponent(errorInput)}`
    : '';

  return (
    <main className="app-shell">
      <div className="app-container">
        <header className="topbar">
          <div className="brand-pill">
            <IconBolt size={18} color="#5d4eb6" />
            <span>Faultline</span>
          </div>
          <span className="beta-badge">Beta</span>
        </header>

        <section className="hero-panel" style={{ marginBottom: '40px' }}>
          <div className="hero-eyebrow">Debug · Document · Ship</div>
          <h1 className="hero-title">
            Turn every bug into a <span className="accent">crafted artifact</span>.
          </h1>
          <p className="hero-copy">
            Paste your error and let the system transform it into a structured debug story with agent-driven insight, context, and formatting.
          </p>
        </section>

        <section className="input-panel" style={{ marginBottom: '20px' }}>
          <div className="glass-note" style={{ marginBottom: '20px' }}>
            <IconTerminal2 size={16} color="#6757ff" />
            Paste the stack trace, exception, or console dump.
          </div>

          <div className="textarea-panel">
            <textarea
              placeholder="NullReferenceException: Object reference not set to an instance of an object..."
              value={errorInput}
              onChange={e => setErrorInput(e.target.value)}
              disabled={isRunning}
            />
          </div>

          <div className="input-actions" style={{ marginTop: '18px' }}>
            <span className="mini-label">{errorInput.length} / 3000</span>
            <button
              className="action-button primary"
              onClick={handleSubmit}
              disabled={isRunning || !errorInput.trim() || errorInput.length > 3000}
              style={{ opacity: isRunning || !errorInput.trim() ? 0.65 : 1 }}
            >
              {isRunning ? 'Analyzing...' : 'Analyze →'}
            </button>
          </div>
        </section>

        {errorMessage && (
          <div className="output-panel" style={{ marginBottom: '16px', borderColor: 'rgba(230,120,47,0.25)', background: 'rgba(230,120,47,0.08)', color: '#a04620' }}>
            {errorMessage}
          </div>
        )}

        {(isRunning || result || waitingForUser) && (
          <div className="status-panel" style={{ marginBottom: '16px' }}>
            <AgentProgress agents={agents} />
          </div>
        )}

        {waitingForUser && clarifyQuestions.length > 0 && (
          <div className="clarifier-panel" style={{ marginBottom: '16px' }}>
            <ClarifierDialog
              questions={clarifyQuestions}
              onConfirm={(ctx) => { setWaitingForUser(false); runAnalysis(ctx); }}
            />
          </div>
        )}

        {result && (
          <div className="output-panel">
            <DebugLogOutput
              title={result.formatted.title}
              markdown={result.formatted.markdown}
              errorType={result.classification.errorType}
              language={result.classification.summary}
              onRetry={handleRetry}
              shareUrl={shareUrl}
            />
          </div>
        )}
      </div>
    </main>
  );
}
