import { IconCheck, IconLoader2, IconCircle } from '@tabler/icons-react';

type AgentStatus = 'pending' | 'running' | 'done';

interface Agent {
  name: string;
  label: string;
  status: AgentStatus;
}

interface Props {
  agents: Agent[];
}

export default function AgentProgress({ agents }: Props) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '0.5px solid var(--border)',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {agents.map((agent) => (
        <div key={agent.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Status icon */}
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: agent.status === 'done'
              ? 'rgba(232,87,42,0.15)'
              : agent.status === 'running'
              ? 'rgba(232,165,42,0.1)'
              : 'var(--bg-elevated)',
          }}>
            {agent.status === 'done' && <IconCheck size={12} color="var(--vermillion)" />}
            {agent.status === 'running' && (
              <IconLoader2
                size={12}
                color="#E8A52A"
                style={{ animation: 'spin 1s linear infinite' }}
              />
            )}
            {agent.status === 'pending' && <IconCircle size={12} color="var(--text-dim)" />}
          </div>

          {/* Agent name */}
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            width: '88px',
            flexShrink: 0,
          }}>
            [{agent.name.toLowerCase()}]
          </span>

          {/* Label */}
          <span style={{
            fontSize: '13px',
            color: agent.status === 'done'
              ? 'var(--vermillion)'
              : agent.status === 'running'
              ? '#E8A52A'
              : 'var(--text-dim)',
          }}>
            {agent.label}
          </span>
        </div>
      ))}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
