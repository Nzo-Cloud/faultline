'use client';

import { useState } from 'react';
import { analyzeError, AnalysisResponse } from '@/lib/api';
import AgentProgress from './components/AgentProgress';
import ClarifierDialog from './components/ClarifierDialog';
import DebugLogOutput from './components/DebugLogOutput';

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

  const setAgentStatus = (index: number, status: AgentStatus, label?: string) => {
    setAgents(prev => prev.map((a, i) =>
      i === index ? { ...a, status, label: label ?? a.label } : a
    ));
  };

  const resetAgents = () => setAgents(DEFAULT_AGENTS.map(a => ({ ...a, status: 'pending' })));

  const runAnalysis = async (userContext?: string) => {
    if (!userContext) {
      resetAgents();
      setResult(null);
      setErrorMessage('');
      setWaitingForUser(false);
    }

    setIsRunning(true);

    if (!userContext) {
      setAgentStatus(0, 'running', 'Identifying error type...');
    }

    try {
      const response = await analyzeError({
        error: errorInput,
        userContext,
      });

      // Animate agent completions
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
      const msg = err?.response?.data?.error || 'Something went wrong. Please try again.';
      setErrorMessage(msg);
      resetAgents();
    } finally {
      setIsRunning(false);
    }
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleSubmit = () => {
    if (!errorInput.trim()) return;
    if (errorInput.length > 3000) {
      setErrorMessage('Input too long. Maximum 3,000 characters.');
      return;
    }
    runAnalysis();
  };

  const handleClarify = (context: string) => {
    setWaitingForUser(false);
    runAnalysis(context);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            ⚡ Faultline
          </h1>
          <p className="text-gray-500 mt-1">
            Turn every bug you fix into portfolio content, automatically.
          </p>
        </div>

        {/* Input */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste your error or stack trace
          </label>
          <textarea
            className="w-full h-40 font-mono text-sm border border-gray-200 rounded p-3 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            placeholder="NullReferenceException: Object reference not set to an instance of an object..."
            value={errorInput}
            onChange={(e) => setErrorInput(e.target.value)}
            disabled={isRunning}
          />
          <div className="flex items-center justify-between mt-3">
            <span className={`text-xs ${errorInput.length > 3000 ? 'text-red-500' : 'text-gray-400'}`}>
              {errorInput.length}/3000
            </span>
            <button
              onClick={handleSubmit}
              disabled={isRunning || !errorInput.trim() || errorInput.length > 3000}
              className="bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded text-sm font-medium transition-colors"
            >
              {isRunning ? 'Analyzing...' : 'Analyze →'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Agent Progress */}
        {(isRunning || result || waitingForUser) && (
          <AgentProgress agents={agents} />
        )}

        {/* Clarifier Dialog */}
        {waitingForUser && clarifyQuestions.length > 0 && (
          <ClarifierDialog
            questions={clarifyQuestions}
            onConfirm={handleClarify}
          />
        )}

        {/* Output */}
        {result && (
          <DebugLogOutput
            title={result.formatted.title}
            markdown={result.formatted.markdown}
          />
        )}

      </div>
    </main>
  );
}
