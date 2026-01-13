import React from 'react';
import { AppointmentCard } from './AppointmentCard';

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

interface AppointmentListProps {
  appointments: Appointment[];
  userRole: 'DOCTOR' | 'PATIENT';
  onJoinCall: (appointmentId: number) => void;
  onDownloadPrescription: (appointmentId: number) => void;
  emptyMessage?: string;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  userRole,
  onJoinCall,
  onDownloadPrescription,
  emptyMessage = 'No appointments found',
}) => {
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium mb-2">{emptyMessage}</p>
        <p className="text-sm text-gray-400">Your appointments will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          userRole={userRole}
          onJoinCall={onJoinCall}
          onDownloadPrescription={onDownloadPrescription}
        />
      ))}
    </div>
  );
};