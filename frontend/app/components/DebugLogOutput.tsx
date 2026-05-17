import { useState } from 'react';

interface Props {
  title: string;
  markdown: string;
}

export default function DebugLogOutput({ title, markdown }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mt-6">
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Debug Log</span>
          {title && <h2 className="text-sm font-semibold mt-0.5">{title}</h2>}
        </div>
        <button
          onClick={handleCopy}
          className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy Markdown'}
        </button>
      </div>
      <div className="p-6 bg-white">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
          {markdown}
        </pre>
      </div>
    </div>
  );
}
