import React from 'react';
import { DoctorCard } from './DoctorCard';

interface Doctor {
  id: number;
  name: string;
  email: string;
  doctorProfile: {
    specialization: string;
    consultationFee: number;
    licenseNumber: string;
  };
}

interface DoctorListProps {
  doctors: Doctor[];
  expandedDoctorId: number | null;
  onViewSlots: (doctorId: number) => void;
  renderSlots?: (doctor: Doctor) => React.ReactNode;
  emptyMessage?: string;
}

export const DoctorList: React.FC<DoctorListProps> = ({
  doctors,
  expandedDoctorId,
  onViewSlots,
  renderSlots,
  emptyMessage = 'No doctors found',
}) => {
  if (doctors.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium mb-2">{emptyMessage}</p>
        <p className="text-sm text-gray-400">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {doctors.map((doctor) => (
        <DoctorCard
          key={doctor.id}
          doctor={doctor}
          onViewSlots={onViewSlots}
          isExpanded={expandedDoctorId === doctor.id}
        >
          {renderSlots && renderSlots(doctor)}
        </DoctorCard>
      ))}
    </div>
  );
};