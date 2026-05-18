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
  runtime_exception: '#E8572A',
  syntax_error: '#E8A52A',
  missing_config: '#4A9EE8',
  network_timeout: '#9B59B6',
  permission_denied: '#E84393',
  dependency_missing: '#1DB584',
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
    <div style={{
      background: 'var(--bg-surface)',
      border: '0.5px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '0.5px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Debug Log
          </span>
          {title && (
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {title}
            </span>
          )}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {errorType && (
              <span style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '4px',
                fontWeight: 500,
                background: `${accentColor}20`,
                color: accentColor,
                border: `0.5px solid ${accentColor}40`,
              }}>
                {errorType.replace(/_/g, ' ')}
              </span>
            )}
            {language && (
              <span style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '4px',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                border: '0.5px solid var(--border)',
              }}>
                {language}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button onClick={onRetry} style={{
            background: 'var(--bg-elevated)',
            border: '0.5px solid var(--border)',
            color: 'var(--text-secondary)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}>
            <IconRefresh size={13} /> Retry
          </button>
          <button onClick={handleShare} style={{
            background: 'var(--bg-elevated)',
            border: '0.5px solid var(--border)',
            color: shared ? 'var(--vermillion)' : 'var(--text-secondary)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}>
            <IconShare size={13} /> {shared ? 'Copied!' : 'Share'}
          </button>
          <button onClick={handleCopy} style={{
            background: copied ? 'var(--vermillion)' : 'var(--bg-elevated)',
            border: `0.5px solid ${copied ? 'var(--vermillion)' : 'var(--border)'}`,
            color: copied ? '#fff' : 'var(--text-secondary)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s',
          }}>
            {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {sections.map((section, i) => {
          const lines = section.trim().split('\n');
          const heading = lines[0].replace('## ', '');
          const body = lines.slice(1).join('\n').trim();
          return (
            <div key={i}>
              {i > 0 && <div style={{ height: '0.5px', background: 'var(--border-subtle)', marginBottom: '14px' }} />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{
                  fontSize: '10px',
                  color: 'var(--vermillion)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 500,
                }}>
                  {heading}
                </span>
                <span style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.7',
                  fontFamily: 'var(--font-mono)',
                }}>
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
