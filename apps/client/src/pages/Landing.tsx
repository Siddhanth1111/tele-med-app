import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // If already logged in, redirect to dashboard
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate('/dashboard');
  //   }
  // }, [isAuthenticated, navigate]);

  // if (isAuthenticated) return null;

  const features = [
    {
      icon: '📹',
      title: 'HD Video Consultations',
      description: 'Connect with doctors through crystal-clear video calls from the comfort of your home.'
    },
    {
      icon: '💊',
      title: 'Digital Prescriptions',
      description: 'Receive instant prescriptions that you can download and use at any pharmacy.'
    },
    {
      icon: '🤖',
      title: 'AI Health Assistant',
      description: 'Get instant symptom guidance from our AI-powered health assistant 24/7.'
    },
    {
      icon: '🔒',
      title: 'HIPAA Compliant',
      description: 'Your health data is protected with bank-level 256-bit encryption.'
    },
    {
      icon: '⚡',
      title: 'Instant Booking',
      description: 'Book appointments in seconds and see doctors within minutes.'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Access healthcare on any device - desktop, tablet, or smartphone.'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Create Your Account',
      description: 'Sign up as a patient or register as a healthcare provider in under 2 minutes.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      step: '2',
      title: 'Find Your Doctor',
      description: 'Browse qualified doctors by specialization, availability, and consultation fee.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      step: '3',
      title: 'Book Appointment',
      description: 'Choose a convenient time slot and complete secure payment in one click.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      step: '4',
      title: 'Join Video Call',
      description: 'Connect via HD video, discuss your health, and receive your prescription instantly.',
      color: 'from-emerald-500 to-emerald-600'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      avatar: 'S',
      content: 'TeleMed made healthcare so convenient! I consulted with a specialist from home and received my prescription in minutes.',
      rating: 5
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Cardiologist',
      avatar: 'M',
      content: 'As a doctor, this platform lets me reach more patients efficiently. The interface is intuitive and professional.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Patient',
      avatar: 'E',
      content: 'The AI symptom checker helped me understand my condition before seeing a doctor. Absolutely brilliant service!',
      rating: 5
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Patients' },
    { number: '1,200+', label: 'Verified Doctors' },
    { number: '100K+', label: 'Consultations' },
    { number: '4.9/5', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-teal-500 selection:text-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <span className="text-2xl">🏥</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">TeleMed</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-gray-300 hover:text-white font-medium transition hover:scale-105"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg shadow-teal-500/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 relative overflow-hidden border-b border-gray-800">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full opacity-20 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-600/20 rounded-full opacity-20 blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Text Content */}
            <div>
              <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
                🎉 Now serving 50,000+ patients nationwide
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Healthcare That Comes To <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">You</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Connect with qualified doctors instantly through secure video consultations. Get prescriptions, health advice, and peace of mind—all from home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-teal-500/20 transition transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Book Your First Consultation
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-bold text-lg border border-gray-700 hover:border-gray-600 transition"
                >
                  How It Works
                </button>
              </div>
              
              {/* Trust Badges */}
              <div className="flex items-center gap-6 mt-10 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  HIPAA Compliant
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure & Private
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Doctors
                </div>
              </div>
            </div>

            {/* Right: Hero Image/Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
                <div className="bg-gray-900 rounded-2xl p-6 shadow-inner border border-gray-800">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-2xl shadow-lg">
                      👨‍⚕️
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">Dr. Sarah Johnson</p>
                      <p className="text-sm text-gray-400">Cardiologist • 15 years exp.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700">
                      <span className="text-sm text-gray-400">Next Available</span>
                      <span className="text-sm font-bold text-teal-400">Today, 2:30 PM</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700">
                      <span className="text-sm text-gray-400">Consultation Fee</span>
                      <span className="text-sm font-bold text-green-400">$50</span>
                    </div>
                    <button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:brightness-110 transition">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-xs text-gray-400">Rating</p>
                    <p className="font-bold text-white">4.9/5.0</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="text-xs text-gray-400">Success Rate</p>
                    <p className="font-bold text-white">98%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center group">
                <p className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 group-hover:from-teal-400 group-hover:to-blue-500 transition-all duration-300">
                  {stat.number}
                </p>
                <p className="text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need for Better Health</h2>
            <p className="text-xl text-gray-400">Comprehensive healthcare features designed for your convenience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-800 hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-500/10 transition transform hover:-translate-y-2 group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition duration-300">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-400 transition">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How TeleMed Works</h2>
            <p className="text-xl text-gray-400">Get started in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gray-800/50 p-8 rounded-2xl shadow-lg h-full border border-gray-700 hover:bg-gray-800 transition">
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg`}>
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
                {idx < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-400">Join thousands of satisfied patients and doctors</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-800 shadow-xl hover:border-gray-700 transition">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 border-t border-gray-700 relative overflow-hidden">
        {/* Subtle Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Healthcare Experience?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of patients who trust TeleMed for their healthcare needs</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-teal-500/20 transition transform hover:scale-105"
            >
              Get Started Free
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-bold text-lg border border-gray-600 hover:border-gray-500 transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <span className="text-2xl">🏥</span>
                </div>
                <span className="text-2xl font-bold">TeleMed</span>
              </div>
              <p className="text-gray-400">Making healthcare accessible to everyone, everywhere.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-200">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition">Features</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">For Doctors</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">For Patients</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-200">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Careers</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-200">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2026 TeleMed. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition transform hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition transform hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition transform hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L7.773 13.98l-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.954z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}