import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutForm } from '../components/CheckoutForm';
import { DoctorCard } from '../components/doctors/DoctorCard';
import { DoctorFilters } from '../components/doctors/DoctorFilters';
import { SlotPicker } from '../components/doctors/SlotPicker';

const stripePromise = loadStripe("pk_test_51SnyIpC0ejVuckXrCCwSy7577ZKUdOlAW4SfuAyLvCZqS5zNq542ldnOK829xYGyjbwd3EVGvFNf1LjeZLCbg03S00A8Hj8RIx");

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Payment Modal State
  const [clientSecret, setClientSecret] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<{doctorId: number, time: string} | null>(null);

  // Slot Management
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expandedDoctorId, setExpandedDoctorId] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [feeFilter, setFeeFilter] = useState<number>(500);

  const gatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const docRes = await axios.get(`${gatewayUrl}/api/auth/doctors`);
        setDoctors(docRes.data);
      } catch (err) {
        console.error("Failed to load doctors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const fetchSlots = async (doctorId: number, date: string) => {
    try {
      const res = await axios.get(`${gatewayUrl}/api/appointments/availability?doctorId=${doctorId}&date=${date}`);
      setAvailableSlots(res.data);
    } catch (err) {
      console.error("Failed to fetch slots");
    }
  };

  const handleViewSlots = (doctorId: number) => {
    if (expandedDoctorId === doctorId) {
      setExpandedDoctorId(null);
    } else {
      setExpandedDoctorId(doctorId);
      fetchSlots(doctorId, selectedDate);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (expandedDoctorId) fetchSlots(expandedDoctorId, date);
  };

  const handleBook = async (doctorId: number, startTime: string) => {
    setPendingBooking({ doctorId, time: startTime });

    try {
      const res = await axios.post(`${gatewayUrl}/api/payments/create-payment-intent`, { 
        amount: 50,
        currency: 'usd' 
      });

      setClientSecret(res.data.clientSecret);
      setShowPayment(true);
    } catch (err) {
      alert("Failed to initialize payment. Please try again.");
    }
  };

  const finalizeBooking = async () => {
    if (!pendingBooking) return;
    try {
      await axios.post(`${gatewayUrl}/api/appointments/book`, {
        patientId: user?.id,
        doctorId: pendingBooking.doctorId,
        startTime: pendingBooking.time,
        reason: "Regular Checkup (Paid)"
      });
      setMessage(`✅ Booking Successful!`);
      setShowPayment(false);
      setTimeout(() => navigate('/dashboard'), 2000); 
    } catch (err: any) {
      setMessage("❌ Booking Failed. Please contact support.");
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.doctorProfile?.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization = specializationFilter === 'All' || 
                                  doc.doctorProfile?.specialization === specializationFilter;
    const matchesFee = doc.doctorProfile?.consultationFee <= feeFilter;
    
    return matchesSearch && matchesSpecialization && matchesFee;
  });

  const specializations = ['All', ...new Set(doctors.map(d => d.doctorProfile?.specialization).filter(Boolean))];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Finding doctors for you...</p>
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
          
          {/* Page Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
            <p className="text-gray-600">Find and consult with our qualified doctors</p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg">
              {message}
            </div>
          )}

          {/* Filters */}
          <DoctorFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            specialization={specializationFilter}
            onSpecializationChange={setSpecializationFilter}
            feeRange={feeFilter}
            onFeeRangeChange={setFeeFilter}
            specializations={specializations}
            maxFee={500}
          />

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredDoctors.length}</span> doctors available
            </p>
          </div>

          {/* Doctors List */}
          <div className="space-y-4">
            {filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSpecializationFilter('All');
                    setFeeFilter(500);
                  }}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredDoctors.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  onViewSlots={handleViewSlots}
                  isExpanded={expandedDoctorId === doc.id}
                >
                  <SlotPicker
                    slots={availableSlots}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                    onSlotSelect={(time) => handleBook(doc.id, time)}
                    minDate={new Date().toISOString().split('T')[0]}
                  />
                </DoctorCard>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPayment && clientSecret && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <CheckoutForm 
              amount={50} 
              onSuccess={finalizeBooking}
              onCancel={() => setShowPayment(false)}
            />
          </Elements>
        </div>
      )}
    </>
  );
}