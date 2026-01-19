import React from 'react';

interface DateFilterProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  appointmentCount?: number;
  showQuickFilters?: boolean;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  selectedDate,
  onDateChange,
  appointmentCount,
  showQuickFilters = true,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const getWeekStart = () => {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).toISOString().split('T')[0];
  };

  const quickFilters = [
    { label: 'Today', value: today },
    { label: 'Tomorrow', value: tomorrow },
    { label: 'This Week', value: getWeekStart() },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-white"
          />
        </div>
        {appointmentCount !== undefined && (
          <div className="bg-teal-500/20 text-teal-400 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap border border-teal-500/30">
            {appointmentCount} {appointmentCount === 1 ? 'Appointment' : 'Appointments'}
          </div>
        )}
      </div>

      {showQuickFilters && (
        <div className="flex gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => onDateChange(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedDate === filter.value
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};