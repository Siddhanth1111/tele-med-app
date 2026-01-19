import React from 'react';

interface Appointment {
  id: number;
  startTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  reason?: string;
  doctor?: {
    name: string;
    doctorProfile?: {
      specialization: string;
    };
  };
  patient?: {
    name: string;
  };
}

interface AppointmentCardProps {
  appointment: Appointment;
  userRole: 'DOCTOR' | 'PATIENT';
  onJoinCall: (appointmentId: number) => void;
  onDownloadPrescription: (appointmentId: number) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  userRole,
  onJoinCall,
  onDownloadPrescription,
}) => {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      SCHEDULED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
      CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const otherPerson = userRole === 'DOCTOR' ? appointment.patient : appointment.doctor;
  const personName = otherPerson?.name || 'Unknown';

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6 hover:shadow-2xl hover:border-gray-600 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {getInitials(personName)}
            </div>
            
            {/* Info */}
            <div>
              <p className="font-bold text-white">{personName}</p>
              {userRole === 'PATIENT' && appointment.doctor?.doctorProfile?.specialization && (
                <p className="text-sm text-gray-400">{appointment.doctor.doctorProfile.specialization}</p>
              )}
              <p className="text-sm text-gray-500">
                {new Date(appointment.startTime).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })} • {new Date(appointment.startTime).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
            {appointment.reason && (
              <span className="text-xs text-gray-500">• {appointment.reason}</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div>
          {appointment.status === 'SCHEDULED' ? (
            <button 
              onClick={() => onJoinCall(appointment.id)} 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Join Call
            </button>
          ) : appointment.status === 'COMPLETED' ? (
            <button 
              onClick={() => onDownloadPrescription(appointment.id)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 border-2 border-gray-600 px-6 py-3 rounded-xl font-semibold transition hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Rx
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};