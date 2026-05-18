import { useState } from 'react';
import { IconAlertTriangle, IconArrowRight } from '@tabler/icons-react';

interface Props {
  questions: string[];
  onConfirm: (context: string) => void;
}

export default function ClarifierDialog({ questions, onConfirm }: Props) {
  const [answers, setAnswers] = useState<string[]>(questions.map(() => ''));

  const handleConfirm = () => {
    const context = questions
      .map((q, i) => `${q}: ${answers[i]}`)
      .join('. ');
    onConfirm(context);
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '0.5px solid var(--vermillion-border)',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <IconAlertTriangle size={16} color="var(--vermillion)" />
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--vermillion)' }}>
          A few quick questions before we continue
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {questions.map((question, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {question}
            </label>
            <input
              type="text"
              placeholder="Your answer..."
              value={answers[i]}
              onChange={(e) => {
                const updated = [...answers];
                updated[i] = e.target.value;
                setAnswers(updated);
              }}
              style={{
                background: 'var(--bg-elevated)',
                border: '0.5px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'inherit',
                width: '100%',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--vermillion)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        style={{
          background: 'var(--vermillion)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          alignSelf: 'flex-start',
        }}
      >
        Continue Analysis
        <IconArrowRight size={14} />
      </button>
    </div>
  );
}
