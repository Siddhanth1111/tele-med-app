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

  const upcomingAppointments = appointments.filter(a => a.status === 'SCHEDULED');
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your health dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name}! 👋
                </h1>
                <p className="text-teal-100 text-lg">
                  {user?.role === 'PATIENT' 
                    ? 'Manage your health journey all in one place' 
                    : 'Your patients are waiting for expert care'}
                </p>
              </div>
              {user?.role === 'PATIENT' && (
                <button
                  onClick={() => navigate('/book-appointment')}
                  className="bg-white text-teal-600 hover:bg-teal-50 px-8 py-4 rounded-xl font-bold shadow-lg transition transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Book New Appointment
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
          
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            
            {/* Book Appointment Card */}
            {user?.role === 'PATIENT' && (
              <div 
                onClick={() => navigate('/book-appointment')}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition cursor-pointer transform hover:-translate-y-2 border-2 border-transparent hover:border-teal-200 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Find Doctors</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Browse specialists and book instant consultations</p>
                <div className="mt-4 flex items-center text-teal-600 font-medium text-sm">
                  <span>Explore now</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )}

            {/* AI Assistant Card */}
            <div 
              onClick={() => navigate('/ai-assistant')}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition cursor-pointer transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-200 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Health Assistant</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Get instant symptom analysis and health guidance</p>
              <div className="mt-4 flex items-center text-purple-600 font-medium text-sm">
                <span>Chat now</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Health Records Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Health Summary</h3>
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Total Consultations</span>
                  <span className="font-bold text-gray-900">{appointments.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Upcoming</span>
                  <span className="font-bold text-teal-600">{upcomingAppointments.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 text-sm">Completed</span>
                  <span className="font-bold text-gray-900">{completedCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {user?.role === 'DOCTOR' ? 'Patient Consultations' : 'Your Appointments'}
                </h2>
                <p className="text-gray-600">
                  {user?.role === 'DOCTOR' 
                    ? 'Manage and track your patient appointments' 
                    : 'View and manage your upcoming consultations'}
                </p>
              </div>
              
              {appointments.length > 0 && (
                <div className="flex-shrink-0">
                  <DateFilter
                    selectedDate={appointmentDateFilter}
                    onDateChange={setAppointmentDateFilter}
                    appointmentCount={filteredAppointments.length}
                    showQuickFilters={false}
                  />
                </div>
              )}
            </div>

            {/* Quick Date Filters */}
            {appointments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setAppointmentDateFilter(new Date().toISOString().split('T')[0])}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    appointmentDateFilter === new Date().toISOString().split('T')[0]
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setAppointmentDateFilter(tomorrow.toISOString().split('T')[0]);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    appointmentDateFilter === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => setAppointmentDateFilter('')}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  View All
                </button>
              </div>
            )}

            {/* Appointments List */}
            {filteredAppointments.length === 0 && appointments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-gradient-to-br from-teal-50 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-16 h-16 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No appointments scheduled</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {user?.role === 'PATIENT' 
                    ? 'Start your health journey by booking your first consultation with our expert doctors' 
                    : 'Your upcoming patient consultations will appear here'}
                </p>
                {user?.role === 'PATIENT' && (
                  <button
                    onClick={() => navigate('/book-appointment')}
                    className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition transform hover:scale-105"
                  >
                    Find a Doctor
                  </button>
                )}
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 font-medium">No appointments on {new Date(appointmentDateFilter).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
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