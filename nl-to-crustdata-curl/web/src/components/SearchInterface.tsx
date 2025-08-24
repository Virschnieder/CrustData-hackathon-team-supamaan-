import React from 'react';

interface SearchInterfaceProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onFindCompanies: () => void;
  loading: boolean;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({
  prompt,
  onPromptChange,
  onFindCompanies,
  loading
}) => {
  const examplePrompts = [
    "AI startups in India with 50-200 employees, Series A funding",
    "European fintech companies, 1000+ employees, fast growth",
    "US cybersecurity companies, Series B to D, founded after 2018"
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Search Box */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Describe your ideal investment opportunity
          </h2>
          <p className="text-gray-400">
            Use natural language to find startups that match your criteria
          </p>
        </div>

        <div className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="e.g., AI infrastructure startups in India, 11–200 employees, founded after 2019, seed to Series A funding, showing strong growth..."
              className="w-full h-32 px-6 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
              disabled={loading}
            />
            {loading && (
              <div className="absolute inset-0 bg-gray-700/50 rounded-xl flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                  <span className="text-blue-400 font-medium">Analyzing your criteria...</span>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="text-center">
            <button
              onClick={onFindCompanies}
              disabled={loading || !prompt.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg text-lg"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Finding Companies...</span>
                </div>
              ) : (
                '🔍 Find Investment Opportunities'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Example Prompts */}
      {!loading && !prompt && (
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Try these examples:</p>
          <div className="space-y-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => onPromptChange(example)}
                className="block w-full max-w-2xl mx-auto px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors text-left"
              >
                <span className="text-blue-400">💡</span> {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Progress */}
      {loading && (
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-white mb-2">Processing Your Search</h3>
              <p className="text-gray-400 text-sm">This may take a few moments...</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                <span className="text-gray-300">Parsing natural language criteria</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="animate-pulse h-4 w-4 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">Searching company database</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="animate-pulse h-4 w-4 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Enriching company data</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="animate-pulse h-4 w-4 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Finding key people</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInterface;
