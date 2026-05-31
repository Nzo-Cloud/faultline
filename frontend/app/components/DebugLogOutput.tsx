import { useState } from 'react';
import { IconCopy, IconCheck, IconRefresh, IconShare } from '@tabler/icons-react';

interface Props {
  title: string;
  markdown: string;
  errorType: string;
  language: string;
  onRetry: () => void;
  shareUrl: string;
}

const errorTypeColors: Record<string, string> = {
  runtime_exception: '#d9693d',
  syntax_error: '#e6a032',
  missing_config: '#4a9ee8',
  network_timeout: '#9b59b6',
  permission_denied: '#e84393',
  dependency_missing: '#1db584',
  unknown: '#888888',
};

export default function DebugLogOutput({ title, markdown, errorType, language, onRetry, shareUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(shareUrl);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const accentColor = errorTypeColors[errorType] || '#888888';
  const sections = markdown.split(/(?=## )/).filter(Boolean);

  return (
    <div className="paper-panel" style={{ overflow: 'hidden' }}>
      <div style={{
        padding: '20px 22px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Debug Log
          </span>
          {title && (
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {title}
            </span>
          )}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {errorType && (
              <span style={{
                fontSize: '12px',
                padding: '6px 10px',
                borderRadius: '999px',
                fontWeight: 700,
                background: `${accentColor}20`,
                color: accentColor,
                border: `1px solid ${accentColor}40`,
              }}>
                {errorType.replace(/_/g, ' ')}
              </span>
            )}
            {language && (
              <span style={{
                fontSize: '12px',
                padding: '6px 10px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.9)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}>
                {language}
              </span>
            )}
          </div>
        </div>

        <div className="output-actions">
          <button onClick={onRetry}>
            <IconRefresh size={14} /> Retry
          </button>
          <button onClick={handleShare} style={{ color: shared ? '#6757ff' : undefined }}>
            <IconShare size={14} /> {shared ? 'Copied!' : 'Share'}
          </button>
          <button onClick={handleCopy} style={{ color: copied ? '#fff' : undefined, background: copied ? '#6757ff' : undefined, borderColor: copied ? '#6757ff' : undefined }}>
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />} {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {sections.map((section, i) => {
          const lines = section.trim().split('\n');
          const heading = lines[0].replace('## ', '');
          const body = lines.slice(1).join('\n').trim();
          return (
            <div key={i}>
              {i > 0 && <div style={{ height: '1px', background: 'var(--border-subtle)', marginBottom: '16px' }} />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{
                  fontSize: '11px',
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 700,
                }}>
                  {heading}
                </span>
                <span className="code-section">
                  {body}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
