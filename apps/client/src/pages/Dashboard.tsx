import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header';
import { AppointmentCard } from '../components/appointments/AppointmentCard';
import { DateFilter } from '../components/appointments/DateFilter';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentDateFilter, setAppointmentDateFilter] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const gatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appRes = await axios.get(`${gatewayUrl}/api/appointments/my-appointments/${user?.id}`);
        setAppointments(appRes.data);
      } catch (err) {
        console.error("Failed to load appointments", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchAppointments();
  }, [user]);

  const downloadPrescription = async (appointmentId: number) => {
    try {
      const res = await axios.get(`${gatewayUrl}/api/appointments/prescription/${appointmentId}`);
      const rx = res.data;

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(41, 128, 185);
      doc.text("TeleMed Health Clinic", 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("123 Digital Health Way, Cloud City", 105, 26, { align: 'center' });
      doc.line(20, 30, 190, 30);

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Prescription ID: #${rx.id}`, 20, 40);
      doc.text(`Date: ${new Date(rx.createdAt).toLocaleDateString()}`, 140, 40);
      
      doc.setFontSize(14);
      doc.text(`Diagnosis: ${rx.diagnosis}`, 20, 55);

      const tableData = rx.medicines.map((m: any) => [m.name, m.quantity, m.instructions]);
      
      autoTable(doc, {
        startY: 65,
        head: [['Medicine Name', 'Quantity', 'Instructions']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text("Doctor's Remarks:", 20, finalY);
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(rx.remarks || "No additional remarks.", 20, finalY + 7);

      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("This is a digitally generated prescription.", 105, 280, { align: 'center' });

      doc.save(`Prescription_${appointmentId}.pdf`);
    } catch (err) {
      alert("Prescription not found or not ready yet.");
    }
  };

  const joinCall = (appointmentId: number) => {
    navigate(`/room/appointment-${appointmentId}`);
  };

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
    return aptDate === appointmentDateFilter;
  });

  const upcomingCount = appointments.filter(a => a.status === 'SCHEDULED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-600">Here's what's happening with your health today</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Book Appointment Card */}
            <div 
              onClick={() => user?.role === 'PATIENT' && navigate('/book-appointment')}
              className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-3xl">📅</span>
                </div>
                <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-1">Book Appointment</h3>
              <p className="text-white/80 text-sm">Find and consult with doctors</p>
            </div>

            {/* AI Assistant Card */}
            <div 
              onClick={() => navigate('/ai-assistant')}
              className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-3xl">🤖</span>
                </div>
                <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-1">AI Symptom Checker</h3>
              <p className="text-white/80 text-sm">Get instant health guidance</p>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upcoming</span>
                  <span className="font-semibold text-teal-600">{upcomingCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-gray-900">{completedCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Appointments</h2>
                <p className="text-gray-600 text-sm mt-1">Manage and track your consultations</p>
              </div>
            </div>

            {appointments.length > 0 && (
              <div className="mb-6">
                <DateFilter
                  selectedDate={appointmentDateFilter}
                  onDateChange={setAppointmentDateFilter}
                  appointmentCount={filteredAppointments.length}
                  showQuickFilters={true}
                />
              </div>
            )}

            {filteredAppointments.length === 0 && appointments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments yet</h3>
                <p className="text-gray-600 mb-6">Book your first consultation to get started</p>
                {user?.role === 'PATIENT' && (
                  <button
                    onClick={() => navigate('/book-appointment')}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg transition transform hover:scale-105"
                  >
                    Book Appointment
                  </button>
                )}
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No appointments on {new Date(appointmentDateFilter).toLocaleDateString()}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    userRole={user?.role || 'PATIENT'}
                    onJoinCall={joinCall}
                    onDownloadPrescription={downloadPrescription}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}