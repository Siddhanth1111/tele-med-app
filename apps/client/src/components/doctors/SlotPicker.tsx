import React from 'react';

interface TimeSlot {
  time: string;         // ISO String (e.g., "2023-10-27T10:00:00.000Z")
  displayTime: string;  // Formatted Time (e.g., "10:00 AM")
  available: boolean;
}

interface SlotPickerProps {
  slots: TimeSlot[];
  selectedDate: string; // YYYY-MM-DD format
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
  // 1. Get Current Time in IST
  // We create a date object and shift it to IST for accurate day comparison
  const now = new Date();
  const utcOffset = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60 * 1000; // +5:30
  const istDate = new Date(utcOffset + istOffset);

  // Format IST Today as YYYY-MM-DD
  const todayIST = istDate.toISOString().split('T')[0];
  
  const minimumDate = minDate || todayIST;

  // 2. Logic to disable past slots
  const processedSlots = slots.map(slot => {
    // If the slot is already booked, keep it unavailable
    if (!slot.available) return slot;

    // Check if the selected date is today
    if (selectedDate === todayIST) {
      // Parse the slot time
      // Assuming 'slot.time' is a full ISO string. 
      // If it is just "10:00", we need to construct a date object.
      // Based on your previous context, slot.time is likely an ISO string from the backend.
      const slotTime = new Date(slot.time);
      
      // Compare timestamps
      if (slotTime.getTime() < new Date().getTime()) {
        return { ...slot, available: false, isPast: true }; 
      }
    }

    return { ...slot, isPast: false };
  });

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
          Available Time Slots (IST)
        </label>
        
        {processedSlots.length === 0 ? (
          <div className="text-center py-8 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-500">No slots available for this date</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {processedSlots.map((slot: any, index) => {
              // Determine status for styling
              const isBooked = !slot.available && !slot.isPast;
              const isPast = slot.isPast;
              const isAvailable = slot.available;

              return (
                <button
                  key={index}
                  disabled={!isAvailable}
                  onClick={() => isAvailable && onSlotSelect(slot.time)}
                  className={`p-3 rounded-lg text-sm font-medium transition transform ${
                    isAvailable 
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border-2 border-green-500/30 shadow-sm hover:scale-105" 
                      : "bg-gray-800/50 text-gray-600 cursor-not-allowed border-2 border-gray-700"
                  }`}
                >
                  {slot.displayTime}
                  {isBooked && <span className="block text-xs mt-1 text-red-400/70">Booked</span>}
                  {isPast && <span className="block text-xs mt-1 text-gray-500">Expired</span>}
                </button>
              );
            })}
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
          <span className="text-xs text-gray-400">Unavailable</span>
        </div>
      </div>
    </div>
  );
};