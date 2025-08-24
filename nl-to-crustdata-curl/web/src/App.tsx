import React, { useState, useEffect } from 'react';
import { AppState } from './types';
import { api } from './api';
import SearchInterface from './components/SearchInterface';
import ResultsTable from './components/ResultsTable';

function App() {
  const [state, setState] = useState<AppState>({
    prompt: '',
    loading: false
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('investforme-app-state');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        setState(prev => ({ ...prev, ...parsedState, loading: false }));
      } catch (err) {
        console.error('Failed to load saved state:', err);
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    const { loading, ...stateToSave } = state;
    localStorage.setItem('investforme-app-state', JSON.stringify(stateToSave));
  }, [state]);

  const handlePromptChange = (prompt: string) => {
    setState(prev => ({ ...prev, prompt }));
  };

  const handleFindCompanies = async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined, run: undefined }));
    
    try {
      const run = await api.run(state.prompt);
      setState(prev => ({ ...prev, run, loading: false }));
    } catch (error) {
      console.error('Search error:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to find companies. Please try again or refine your search criteria.' 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                InvestForMe
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              AI-powered startup discovery for venture capitalists
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Display */}
        {state.error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-300">Search Failed</h3>
                <div className="mt-2 text-sm text-red-200">
                  {state.error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Interface */}
        <SearchInterface
          prompt={state.prompt}
          onPromptChange={handlePromptChange}
          onFindCompanies={handleFindCompanies}
          loading={state.loading}
        />

        {/* Results */}
        {state.run && !state.loading && (
          <div className="mt-12">
            <ResultsTable
              companies={state.run.companiesEnriched}
              peopleMatched={state.run.peopleMatched}
            />

            {/* Parsed Filters Summary */}
            {state.run.canonical && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-8 max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold mb-4 text-white">Search Criteria Applied</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {state.run.canonical.industry && (
                    <div>
                      <span className="font-medium text-blue-400">Industries:</span>
                      <div className="text-gray-300">{state.run.canonical.industry.join(', ')}</div>
                    </div>
                  )}
                  {state.run.canonical.countries && (
                    <div>
                      <span className="font-medium text-blue-400">Countries:</span>
                      <div className="text-gray-300">{state.run.canonical.countries.join(', ')}</div>
                    </div>
                  )}
                  {state.run.canonical.headcountRange && (
                    <div>
                      <span className="font-medium text-blue-400">Team Size:</span>
                      <div className="text-gray-300">
                        {state.run.canonical.headcountRange[0].toLocaleString()}–{state.run.canonical.headcountRange[1].toLocaleString()}
                      </div>
                    </div>
                  )}
                  {state.run.canonical.fundingStages && (
                    <div>
                      <span className="font-medium text-blue-400">Funding Stages:</span>
                      <div className="text-gray-300">{state.run.canonical.fundingStages.join(', ')}</div>
                    </div>
                  )}
                  {state.run.canonical.foundedAfter && (
                    <div>
                      <span className="font-medium text-blue-400">Founded After:</span>
                      <div className="text-gray-300">{state.run.canonical.foundedAfter}</div>
                    </div>
                  )}
                  {state.run.canonical.hcGrowth6mPctMin !== undefined && (
                    <div>
                      <span className="font-medium text-blue-400">Growth Rate:</span>
                      <div className="text-gray-300">{state.run.canonical.hcGrowth6mPctMin}%+ (6 months)</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
