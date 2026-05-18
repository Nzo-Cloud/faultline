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
  const [lastError, setLastError] = useState('');

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
      setLastError(errorInput);
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
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* Topbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          borderBottom: '0.5px solid var(--border-subtle)',
          marginBottom: '48px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px',
              background: 'var(--vermillion)',
              borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconBolt size={16} color="#fff" />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Faultline
            </span>
          </div>
          <span style={{
            fontSize: '11px',
            color: 'var(--vermillion)',
            background: 'var(--vermillion-dim)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '0.5px solid var(--vermillion-border)',
          }}>
            Beta
          </span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', color: 'var(--vermillion)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Debug · Document · Ship
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.5px', marginBottom: '12px' }}>
            Turn every bug into<br />
            <span style={{ color: 'var(--vermillion)' }}>portfolio content.</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '480px' }}>
            Paste your error. Five AI agents analyze, document, and format it into a Debug Log entry — automatically.
          </p>
        </div>

        {/* Input */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '16px',
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '0.5px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <IconTerminal2 size={15} color="var(--text-muted)" />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Paste your error or stack trace</span>
            <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
              {['#ff5f57','#ffbd2e','#28c840'].map(c => (
                <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
              ))}
            </div>
          </div>

          <textarea
            style={{
              width: '100%',
              minHeight: '140px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '16px',
              fontSize: '13px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.6,
              resize: 'vertical',
            }}
            placeholder="NullReferenceException: Object reference not set to an instance of an object..."
            value={errorInput}
            onChange={e => setErrorInput(e.target.value)}
            disabled={isRunning}
          />

          <div style={{
            padding: '10px 16px',
            borderTop: '0.5px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: '12px',
              color: errorInput.length > 3000 ? '#E8572A' : 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
            }}>
              {errorInput.length} / 3000
            </span>
            <button
              onClick={handleSubmit}
              disabled={isRunning || !errorInput.trim() || errorInput.length > 3000}
              style={{
                background: isRunning || !errorInput.trim() ? 'var(--bg-elevated)' : 'var(--vermillion)',
                color: isRunning || !errorInput.trim() ? 'var(--text-muted)' : '#fff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: isRunning || !errorInput.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {isRunning ? 'Analyzing...' : 'Analyze →'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div style={{
            background: 'rgba(232,87,42,0.08)',
            border: '0.5px solid var(--vermillion-border)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '13px',
            color: 'var(--vermillion)',
            marginBottom: '16px',
          }}>
            {errorMessage}
          </div>
        )}

        {/* Agent progress */}
        {(isRunning || result || waitingForUser) && (
          <div style={{ marginBottom: '16px' }}>
            <AgentProgress agents={agents} />
          </div>
        )}

        {/* Clarifier */}
        {waitingForUser && clarifyQuestions.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <ClarifierDialog
              questions={clarifyQuestions}
              onConfirm={(ctx) => { setWaitingForUser(false); runAnalysis(ctx); }}
            />
          </div>
        )}

        {/* Output */}
        {result && (
          <DebugLogOutput
            title={result.formatted.title}
            markdown={result.formatted.markdown}
            errorType={result.classification.errorType}
            language={result.classification.summary}
            onRetry={handleRetry}
            shareUrl={shareUrl}
          />
        )}

      </div>
    </main>
  );
}
