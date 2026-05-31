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
    <div className="clarifier-panel" style={{ gap: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <IconAlertTriangle size={18} color="#d9693d" />
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#d9693d' }}>
          A few quick questions before we continue
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {questions.map((question, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
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
                background: 'rgba(255,255,255,0.94)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '14px 16px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'inherit',
                width: '100%',
                transition: 'border-color 0.18s ease',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(103,87,255,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        className="action-button primary"
        style={{ alignSelf: 'flex-start', padding: '12px 22px' }}
      >
        Continue Analysis
        <IconArrowRight size={16} />
      </button>
    </div>
  );
}
