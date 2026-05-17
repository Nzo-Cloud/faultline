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
    <div className="flex flex-col gap-2 my-6">
      {agents.map((agent) => (
        <div key={agent.name} className="flex items-center gap-3 text-sm">
          <span className="w-6 text-center">
            {agent.status === 'done' && '✅'}
            {agent.status === 'running' && '⏳'}
            {agent.status === 'pending' && '○'}
          </span>
          <span className="font-mono text-xs uppercase tracking-wider w-24 text-gray-500">
            [{agent.name}]
          </span>
          <span className={
            agent.status === 'done' ? 'text-green-600' :
            agent.status === 'running' ? 'text-yellow-600 animate-pulse' :
            'text-gray-400'
          }>
            {agent.label}
          </span>
        </div>
      ))}
    </div>
  );
}
