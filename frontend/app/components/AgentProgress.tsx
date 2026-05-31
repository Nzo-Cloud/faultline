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
    <div className="paper-panel">
      {agents.map((agent) => (
        <div key={agent.name} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: agent.status === 'done'
              ? 'rgba(79,111,74,0.16)'
              : agent.status === 'running'
              ? 'rgba(217,105,61,0.15)'
              : 'rgba(173,149,120,0.12)',
          }}>
            {agent.status === 'done' && <IconCheck size={12} color="#4f6f4a" />}
            {agent.status === 'running' && (
              <IconLoader2
                size={12}
                color="#d9693d"
                style={{ animation: 'spin 1s linear infinite' }}
              />
            )}
            {agent.status === 'pending' && <IconCircle size={12} color="var(--text-dim)" />}
          </div>

          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            minWidth: '94px',
            flexShrink: 0,
          }}>
            [{agent.name.toLowerCase()}]
          </span>

          <span style={{
            fontSize: '14px',
            color: agent.status === 'done'
              ? '#4f6f4a'
              : agent.status === 'running'
              ? '#d9693d'
              : 'var(--text-muted)',
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
