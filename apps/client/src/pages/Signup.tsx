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
    <div className="min-h-screen flex bg-gray-950 text-white selection:bg-teal-500 selection:text-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 p-12 flex-col justify-between relative overflow-hidden border-r border-gray-800">
        {/* Decorative glows */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-600/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <span className="text-2xl">🏥</span>
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">TeleMed</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Join Our Healthcare<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Community</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-md leading-relaxed">
            Whether you're a patient seeking care or a doctor ready to serve, TeleMed provides the platform you need.
          </p>
          
          {/* Benefits */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-teal-500/30 transition duration-300">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-lg">
                <span className="text-2xl">🩺</span> For Patients
              </h3>
              <ul className="text-gray-400 text-sm space-y-2 ml-1">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div> Book appointments instantly</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div> Connect via HD video calls</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div> Get digital prescriptions</li>
              </ul>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500/30 transition duration-300">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-lg">
                <span className="text-2xl">👨‍⚕️</span> For Doctors
              </h3>
              <ul className="text-gray-400 text-sm space-y-2 ml-1">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Manage your schedule flexibly</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Reach patients anywhere</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Secure & HIPAA compliant</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-gray-500 text-sm">
          © 2026 TeleMed. Empowering Healthcare
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto bg-gray-950">
        <div className="w-full max-w-md my-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏥</span>
            </div>
            <span className="text-3xl font-bold text-white">TeleMed</span>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-gray-400">Join our telemedicine platform today</p>
            </div>

            {/* Role Toggle */}
            <div className="flex bg-gray-800 rounded-xl p-1 mb-6 shadow-inner border border-gray-700">
              <button
                type="button"
                onClick={() => setRole('PATIENT')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  role === 'PATIENT' 
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg transform scale-[1.02]' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                🩺 Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('DOCTOR')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  role === 'DOCTOR' 
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg transform scale-[1.02]' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                👨‍⚕️ Doctor
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <span className="text-sm flex-1">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input 
                  name="name"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input 
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input 
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                />
              </div>

              {/* DOCTOR SPECIFIC FIELDS */}
              {role === 'DOCTOR' && (
                <div className="space-y-4 border-t border-gray-700 pt-4 mt-4 animate-fadeIn">
                  <div className="flex items-center gap-2 text-teal-400 font-semibold mb-2">
                    <span className="text-xl">👨‍⚕️</span>
                    <span className="text-sm">Professional Details</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Specialization
                      </label>
                      <select 
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-white"
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fee ($)
                      </label>
                      <input 
                        name="consultationFee"
                        type="number"
                        min="10"
                        max="500"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Medical License ID
                    </label>
                    <input 
                      name="licenseNumber"
                      required
                      placeholder="LIC-123456"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
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

            <div className="mt-6 pt-6 border-t border-gray-700 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-teal-400 hover:text-teal-300 font-semibold transition"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-6 px-4">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-teal-400 hover:text-teal-300 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-teal-400 hover:text-teal-300 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}