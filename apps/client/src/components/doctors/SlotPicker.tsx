import React from 'react';

interface TimeSlot {
  time: string;
  displayTime: string;
  available: boolean;
}

interface SlotPickerProps {
  slots: TimeSlot[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSlotSelect: (time: string) => void;
  minDate?: string;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  slots,
  selectedDate,
  onDateChange,
  onSlotSelect,
  minDate,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const minimumDate = minDate || today;

  return (
    <div className="space-y-4">
      {/* Date Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Date
        </label>
        <input 
          type="date" 
          value={selectedDate}
          min={minimumDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-white"
        />
      </div>

      {/* Time Slots */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Available Time Slots
        </label>
        
        {slots.length === 0 ? (
          <div className="text-center py-8 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-500">No slots available for this date</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {slots.map((slot, index) => (
              <button
                key={index}
                disabled={!slot.available}
                onClick={() => slot.available && onSlotSelect(slot.time)}
                className={`p-3 rounded-lg text-sm font-medium transition transform hover:scale-105 ${
                  slot.available 
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border-2 border-green-500/30 shadow-sm" 
                    : "bg-gray-800/50 text-gray-600 cursor-not-allowed border-2 border-gray-700"
                }`}
              >
                {slot.displayTime}
                {!slot.available && (
                  <span className="block text-xs mt-1">Booked</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/20 border-2 border-green-500/30 rounded"></div>
          <span className="text-xs text-gray-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800/50 border-2 border-gray-700 rounded"></div>
          <span className="text-xs text-gray-400">Booked</span>
        </div>
      </div>
    </div>
  );
};