import React from 'react';

interface DoctorFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  specialization: string;
  onSpecializationChange: (value: string) => void;
  feeRange: number;
  onFeeRangeChange: (value: number) => void;
  specializations: string[];
  maxFee?: number;
}

export const DoctorFilters: React.FC<DoctorFiltersProps> = ({
  searchQuery,
  onSearchChange,
  specialization,
  onSpecializationChange,
  feeRange,
  onFeeRangeChange,
  specializations,
  maxFee = 500,
}) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Search Doctors
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name or specialization..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-white placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Specialization Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Specialization
          </label>
          <select
            value={specialization}
            onChange={(e) => onSpecializationChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-white"
          >
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* Fee Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Fee: ${feeRange}
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">$10</span>
            <input
              type="range"
              min="10"
              max={maxFee}
              value={feeRange}
              onChange={(e) => onFeeRangeChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <span className="text-sm text-gray-500">${maxFee}</span>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || specialization !== 'All' || feeRange < maxFee) && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
          <span className="text-sm text-gray-400">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-xs font-medium border border-teal-500/30">
                Search: {searchQuery}
                <button onClick={() => onSearchChange('')} className="hover:text-teal-300">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {specialization !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/30">
                {specialization}
                <button onClick={() => onSpecializationChange('All')} className="hover:text-blue-300">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {feeRange < maxFee && (
              <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/30">
                Under ${feeRange}
                <button onClick={() => onFeeRangeChange(maxFee)} className="hover:text-green-300">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};