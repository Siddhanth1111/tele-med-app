// Color Palette
export const COLORS = {
  primary: {
    blue: '#2563eb',
    teal: '#0d9488',
    purple: '#7c3aed',
  },
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

// Specializations
export const SPECIALIZATIONS = [
  'General',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Psychiatry',
  'Orthopedics',
  'Gynecology',
  'Ophthalmology',
  'ENT'
];

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// User Roles
export const USER_ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR'
};

// API Endpoints (relative to gateway)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    PROFILE: (id: number) => `/api/auth/profile/${id}`,
    DOCTORS: '/api/auth/doctors',
  },
  APPOINTMENTS: {
    MY_APPOINTMENTS: (userId: number) => `/api/appointments/my-appointments/${userId}`,
    BOOK: '/api/appointments/book',
    AVAILABILITY: '/api/appointments/availability',
    PRESCRIPTION: (appointmentId: number) => `/api/appointments/prescription/${appointmentId}`,
    CREATE_PRESCRIPTION: '/api/appointments/prescription',
  },
  PAYMENTS: {
    CREATE_INTENT: '/api/payments/create-payment-intent',
  },
  AI: {
    CHAT: '/api/ai/chat',
    HISTORY: (userId: number) => `/api/ai/history/${userId}`,
  }
};

// Time Slots
export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

// Feature List for Landing Page
export const FEATURES = [
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

// Common Medicines for Prescription
export const COMMON_MEDICINES = [
  "Paracetamol 500mg (Fever/Pain)",
  "Amoxicillin 250mg (Antibiotic)",
  "Ibuprofen 400mg (Pain/Inflammation)",
  "Cetirizine 10mg (Allergy)",
  "Cough Syrup (100ml)",
  "Omeprazole 20mg (Acidity)",
  "Azithromycin 500mg (Antibiotic)",
  "Loratadine 10mg (Allergy)",
  "Metformin 500mg (Diabetes)",
  "Aspirin 75mg (Blood Thinner)"
];

// Default Consultation Fee Range
export const FEE_RANGE = {
  MIN: 10,
  MAX: 500,
  DEFAULT: 50
};

// Pagination
export const ITEMS_PER_PAGE = 10;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  FULL: 'MMM DD, YYYY HH:mm'
};