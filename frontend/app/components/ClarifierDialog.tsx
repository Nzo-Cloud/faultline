import { useState } from 'react';

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
    <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-5 my-4">
      <h3 className="font-semibold text-yellow-800 mb-3">
        🤔 A few quick questions before we analyze:
      </h3>
      <div className="flex flex-col gap-4">
        {questions.map((question, i) => (
          <div key={i}>
            <label className="block text-sm text-yellow-900 mb-1">{question}</label>
            <input
              type="text"
              className="w-full border border-yellow-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Your answer..."
              value={answers[i]}
              onChange={(e) => {
                const updated = [...answers];
                updated[i] = e.target.value;
                setAnswers(updated);
              }}
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleConfirm}
        className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
      >
        Continue Analysis →
      </button>
    </div>
  );
}
