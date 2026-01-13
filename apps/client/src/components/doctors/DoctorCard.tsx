import React from 'react';

interface DoctorProfile {
  specialization: string;
  consultationFee: number;
  licenseNumber: string;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  doctorProfile: DoctorProfile;
}

interface DoctorCardProps {
  doctor: Doctor;
  onViewSlots: (doctorId: number) => void;
  isExpanded: boolean;
  children?: React.ReactNode;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onViewSlots,
  isExpanded,
  children,
}) => {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {getInitials(doctor.name)}
          </div>
          
          {/* Info */}
          <div>
            <h3 className="font-bold text-xl text-gray-900">{doctor.name}</h3>
            <p className="text-gray-600">{doctor.doctorProfile?.specialization || 'General'}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm text-gray-600">4.8</span>
              </div>
              <span className="text-sm text-green-600 font-semibold">
                ${doctor.doctorProfile?.consultationFee} / session
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <button 
          onClick={() => onViewSlots(doctor.id)}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition transform hover:scale-105 shadow-lg"
        >
          {isExpanded ? "Hide Slots" : "View Slots"}
        </button>
      </div>

      {/* Expanded Content (Slots) */}
      {isExpanded && children && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};