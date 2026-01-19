import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'password'>('details');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const gatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    if (!user?.id) return;
    axios.get(`${gatewayUrl}/api/auth/profile/${user.id}`)
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [user]);

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: profile.name,
        email: profile.email,
        specialization: profile.doctorProfile?.specialization,
        consultationFee: profile.doctorProfile?.consultationFee,
        licenseNumber: profile.doctorProfile?.licenseNumber
      };

      await axios.put(`${gatewayUrl}/api/auth/profile/${user?.id}`, payload);
      showMessage("Profile updated successfully!", 'success');
    } catch (err) {
      showMessage("Failed to update profile.", 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showMessage("New passwords do not match.", 'error');
      return;
    }

    try {
      await axios.put(`${gatewayUrl}/api/auth/profile/${user?.id}/password`, {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      showMessage("Password changed! Logging out...", 'success');
      setTimeout(() => logout(), 2000);
    } catch (err: any) {
      showMessage(err.response?.data?.error || "Failed to change password.", 'error');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-medium">Loading Profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-950">
        
        {/* Message Banner */}
        {message && (
          <div className="max-w-7xl mx-auto px-6 pt-6">
            <div className={`${
              messageType === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            } border px-4 py-3 rounded-lg flex items-center gap-3`}>
              <span className="text-xl">{messageType === 'success' ? '✅' : '❌'}</span>
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* LEFT: Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-6 sticky top-24">
                
                {/* User Avatar & Info */}
                <div className="text-center mb-6 pb-6 border-b border-gray-700">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-gray-900 rounded-full"></div>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
                  <p className="text-sm text-gray-400 mb-3">{profile.email}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    profile.role === 'DOCTOR' 
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {profile.role === 'DOCTOR' ? '👨‍⚕️ Doctor' : '🩺 Patient'}
                  </span>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('details')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === 'details' 
                        ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg' 
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Edit Details</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('password')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === 'password' 
                        ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg' 
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="font-medium">Security</span>
                  </button>

                  <div className="pt-4 mt-4 border-t border-gray-700">
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* RIGHT: Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">

                {/* TAB 1: EDIT DETAILS */}
                {activeTab === 'details' && (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center border border-teal-500/30">
                        <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Personal Information</h3>
                        <p className="text-sm text-gray-400">Update your account details</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                        <input 
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <input 
                          value={profile.email}
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-white"
                        />
                      </div>
                    </div>

                    {/* Doctor Specific Fields */}
                    {profile.role === 'DOCTOR' && profile.doctorProfile && (
                      <div className="pt-6 border-t border-gray-700 mt-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center border border-teal-500/30">
                            <span className="text-xl">👨‍⚕️</span>
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white">Professional Details</h4>
                            <p className="text-sm text-gray-400">Manage your medical information</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Specialization</label>
                            <input 
                              value={profile.doctorProfile.specialization}
                              onChange={(e) => setProfile({
                                ...profile, 
                                doctorProfile: { ...profile.doctorProfile, specialization: e.target.value }
                              })}
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Consultation Fee ($)</label>
                            <input 
                              type="number"
                              value={profile.doctorProfile.consultationFee}
                              onChange={(e) => setProfile({
                                ...profile, 
                                doctorProfile: { ...profile.doctorProfile, consultationFee: e.target.value }
                              })}
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Medical License ID</label>
                            <input 
                              value={profile.doctorProfile.licenseNumber}
                              disabled
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">License number cannot be changed. Contact support if needed.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-6">
                      <button 
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transition transform hover:scale-105"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: CHANGE PASSWORD */}
                {activeTab === 'password' && (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Security Settings</h3>
                        <p className="text-sm text-gray-400">Update your password to keep your account secure</p>
                      </div>
                    </div>

                    {/* Security Tips */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Password Tips
                      </h4>
                      <ul className="text-sm text-blue-300 space-y-1 ml-7">
                        <li>• Use at least 8 characters</li>
                        <li>• Include numbers and special characters</li>
                        <li>• Avoid common words or patterns</li>
                      </ul>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                      <input 
                        type="password"
                        required
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-white"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                        <input 
                          type="password"
                          required
                          value={passwords.new}
                          onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-white"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div><label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                    <input 
                      type="password"
                      required
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-white"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transition transform hover:scale-105"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  </div>
</>
);
}