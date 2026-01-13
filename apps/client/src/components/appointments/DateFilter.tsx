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
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        {appointmentCount !== undefined && (
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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