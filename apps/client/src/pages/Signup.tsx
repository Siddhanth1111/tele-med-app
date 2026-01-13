import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const navigate = useNavigate();
  
  // Toggle Role State
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    // Doctor specific fields
    specialization: 'General',
    licenseNumber: '',
    consultationFee: 50
  });

  const gatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Prepare Payload
      const payload = {
        ...formData,
        role: role,
        consultationFee: role === 'DOCTOR' ? Number(formData.consultationFee) : undefined
      };

      // 2. Call API
      await axios.post(`${gatewayUrl}/api/auth/signup`, payload);
      
      // 3. Success
      alert("✅ Account created successfully! Please login.");
      navigate('/login');
      
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Signup failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-blue-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
            <span className="text-3xl font-bold text-white">TeleMed</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Join Our Healthcare<br />Community
          </h1>
          <p className="text-teal-100 text-lg mb-8">
            Whether you're a patient seeking care or a doctor ready to serve, TeleMed provides the platform you need.
          </p>
          
          {/* Benefits */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">🩺</span> For Patients
              </h3>
              <ul className="text-teal-100 text-sm space-y-1 ml-8">
                <li>• Book appointments instantly</li>
                <li>• Connect via HD video calls</li>
                <li>• Get digital prescriptions</li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">👨‍⚕️</span> For Doctors
              </h3>
              <ul className="text-teal-100 text-sm space-y-1 ml-8">
                <li>• Manage your schedule flexibly</li>
                <li>• Reach patients anywhere</li>
                <li>• Secure & HIPAA compliant</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-teal-100 text-sm">
          © 2026 TeleMed. Empowering Healthcare
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md my-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">TeleMed</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Join our telemedicine platform</p>
            </div>

            {/* Role Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6 shadow-inner">
              <button
                type="button"
                onClick={() => setRole('PATIENT')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  role === 'PATIENT' 
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🩺 Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('DOCTOR')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  role === 'DOCTOR' 
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👨‍⚕️ Doctor
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <span className="text-sm flex-1">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input 
                  name="name"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input 
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input 
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* DOCTOR SPECIFIC FIELDS */}
              {role === 'DOCTOR' && (
                <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center gap-2 text-teal-700 font-semibold mb-2">
                    <span className="text-xl">👨‍⚕️</span>
                    <span className="text-sm">Professional Details</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <select 
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                      >
                        <option>General</option>
                        <option>Cardiology</option>
                        <option>Dermatology</option>
                        <option>Neurology</option>
                        <option>Pediatrics</option>
                        <option>Psychiatry</option>
                        <option>Orthopedics</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fee ($)
                      </label>
                      <input 
                        name="consultationFee"
                        type="number"
                        min="10"
                        max="500"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical License ID
                    </label>
                    <input 
                      name="licenseNumber"
                      required
                      placeholder="LIC-123456"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  `Create ${role === 'PATIENT' ? 'Patient' : 'Doctor'} Account`
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 font-semibold transition"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-6 px-4">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}