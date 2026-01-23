import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CheckoutFormProps {
  amount: number;
  // 👇 UPDATED: onSuccess now expects the Payment ID string
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

export const CheckoutForm = ({ amount, onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required'
    });

    if (error) {
      showMessage(error.message || "An unexpected error occurred.", 'error');
      setIsLoading(false);
    } 
    else if (paymentIntent && paymentIntent.status === 'succeeded') {
      
      // 👇 SUCCESS LOGIC UPDATED
      showMessage("Payment succeeded! Finalizing booking...", 'success');
      
      // Wait slightly for UX, then pass the ID up to the parent
      setTimeout(() => {
        onSuccess(paymentIntent.id); 
      }, 1500);
      
    } else {
      showMessage("Payment processing...", 'info');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-8 py-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Complete Payment</h2>
          <button 
            onClick={onCancel}
            className="text-white/80 hover:text-white transition p-1"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-blue-100 text-sm">Secure payment powered by Stripe</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        {/* Amount Display */}
        <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-6 mb-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Consultation Fee</p>
              <p className="text-4xl font-bold text-gray-900">${amount}</p>
            </div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Payment Element */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Payment Details
          </label>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <PaymentElement />
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg border flex items-start gap-3 ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : messageType === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <span className="text-xl">
              {messageType === 'success' ? '✅' : messageType === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span className="text-sm font-medium flex-1">{message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            disabled={isLoading || !stripe || !elements} 
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pay ${amount}
              </>
            )}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold py-4 px-6 rounded-xl transition"
          >
            Cancel
          </button>
        </div>

        {/* Security Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>256-bit Encryption</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};