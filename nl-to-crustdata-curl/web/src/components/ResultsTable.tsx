import React, { useState } from 'react';
import { PersonLite } from '../types';

interface ResultsTableProps {
  companies: any[];
  peopleMatched: Record<string, PersonLite[]>;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ companies, peopleMatched }) => {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  const toggleCompanyExpansion = (companyName: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyName.toLowerCase())) {
      newExpanded.delete(companyName.toLowerCase());
    } else {
      newExpanded.add(companyName.toLowerCase());
    }
    setExpandedCompanies(newExpanded);
  };

  const formatCurrency = (value: number | null | undefined): string => {
    if (!value) return 'N/A';
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  const formatHeadcount = (value: number | null | undefined): string => {
    if (!value) return 'N/A';
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
  };

  if (companies.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No companies found</h3>
        <p className="text-gray-400">Try adjusting your search criteria or check your API configuration.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-semibold mb-6 text-white">
        🎯 Investment Opportunities ({companies.length})
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Company</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Website</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Industry</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Team Size</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Growth</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Funding</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Key People</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => {
              const companyNameLower = company.company_name?.toLowerCase() || '';
              const hasPeople = peopleMatched[companyNameLower]?.length > 0;
              const isExpanded = expandedCompanies.has(companyNameLower);
              
              return (
                <React.Fragment key={index}>
                  <tr className="border-t border-gray-600 hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-4 text-sm">
                      <div className="font-medium text-white">
                        {company.company_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      {company.company_website_domain ? (
                        <a 
                          href={`https://${company.company_website_domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                        >
                          {company.company_website_domain}
                        </a>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      {Array.isArray(company.taxonomy?.industries) 
                        ? company.taxonomy.industries.slice(0, 2).join(', ')
                        : <span className="text-gray-500">N/A</span>}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      <span className="font-medium">
                        {formatHeadcount(company.headcount?.headcount)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {(() => {
                        const growth = company.headcount?.headcount_total_growth_percent?.six_months;
                        if (growth === null || growth === undefined) return <span className="text-gray-500">N/A</span>;
                        const isPositive = growth > 0;
                        return (
                          <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{formatPercentage(growth)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="font-medium text-purple-400">
                        {formatCurrency(company.FundingAndInvestment?.total_investment_usd)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {hasPeople ? (
                        <button
                          onClick={() => toggleCompanyExpansion(company.company_name)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        >
                          {isExpanded ? '👥 Hide' : '👥 Show'} ({peopleMatched[companyNameLower].length})
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">No data</span>
                      )}
                    </td>
                  </tr>
                  
                  {isExpanded && hasPeople && (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 bg-gray-700/30">
                        <div className="space-y-3">
                          <h4 className="font-medium text-blue-400 text-sm">🔑 Key Decision Makers:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {peopleMatched[companyNameLower].map((person, personIndex) => (
                              <div key={personIndex} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                                <div className="font-medium text-sm text-white mb-1">
                                  {person.linkedin ? (
                                    <a 
                                      href={person.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                    >
                                      {person.name}
                                    </a>
                                  ) : person.name}
                                </div>
                                <div className="text-xs text-gray-300 mb-1">{person.title}</div>
                                {person.location && (
                                  <div className="text-xs text-gray-400 mb-1">📍 {person.location}</div>
                                )}
                                {person.start_date && (
                                  <div className="text-xs text-gray-400">
                                    Since {new Date(person.start_date).getFullYear()}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
