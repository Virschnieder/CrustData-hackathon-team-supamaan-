import React from 'react';

interface PromptFormProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerateCurls: () => void;
  onRunSearch: () => void;
  loading: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({
  prompt,
  onPromptChange,
  onGenerateCurls,
  onRunSearch,
  loading
}) => {
  const examplePrompt = "AI infra startups in India, 11–200 employees, founded after 2019, seed to Series A, headcount growth last 6 months > 10%. Limit 25.";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Natural Language Query</h2>
      
      <div className="mb-4">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          Describe your investment/search criteria:
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={examplePrompt}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={loading}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onGenerateCurls}
          disabled={loading || !prompt.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Generate cURLs'}
        </button>
        
        <button
          onClick={onRunSearch}
          disabled={loading || !prompt.trim()}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Run Search + Enrich + People'}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Example queries:</strong></p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>European fintechs 1000–5000 HC, founded before 2016, show fast headcount growth; top 50.</li>
          <li>US cybersecurity companies 200+ employees, Series B–D.</li>
          <li>AI startups in Singapore, 50-200 employees, Series A funding.</li>
        </ul>
      </div>
    </div>
  );
};

export default PromptForm;
