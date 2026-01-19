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

  const [clientSecret, setClientSecret] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<{doctorId: number, time: string} | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expandedDoctorId, setExpandedDoctorId] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

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
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Finding the best doctors for you...</p>
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
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Find Your Perfect Doctor
              </h1>
              <p className="text-xl text-teal-100">
                Book appointments with verified specialists across {specializations.length - 1} specializations
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
          
          {message && (
            <div className="mb-6 p-4 bg-teal-50 border-l-4 border-teal-600 rounded-lg shadow-sm">
              <p className="text-teal-900 font-medium">{message}</p>
            </div>
          )}

          {/* Filters Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
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
          </div>

          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Available
              </h2>
              <p className="text-gray-600 mt-1">Book instant video consultations</p>
            </div>
          </div>

          {/* Doctors Grid */}
          {filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
              <div className="w-32 h-32 bg-gradient-to-br from-teal-50 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No doctors found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Try adjusting your search filters to find more doctors
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSpecializationFilter('All');
                  setFeeFilter(500);
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition transform hover:scale-105"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.map((doc) => (
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
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