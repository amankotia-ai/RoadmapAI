import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Loader2 } from 'lucide-react';
import { Navigation, Footer } from '@/components/ui';
import { PaymentServiceImpl } from '@/services/PaymentService';
import { useAuth } from '@/hooks';

export function Pricing() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const paymentService = React.useMemo(() => new PaymentServiceImpl(), []);
  const plans = paymentService.getPlans();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      alert('Please sign in to subscribe');
      return;
    }

    setIsLoading(true);
    try {
      const subscription = await paymentService.createSubscription(planId);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: 'SaaS Documentation AI',
        description: 'Subscription Payment',
        handler: async (response: any) => {
          try {
            const verified = await paymentService.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );
            
            if (verified) {
              alert('Subscription activated successfully!');
              window.location.reload();
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          email: user.email
        },
        theme: {
          color: '#3C3737'
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to create subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navigation />
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-600">
            Choose the plan that's right for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: plan.name === 'Pro' ? 0.2 : 0 }}
                className={`relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow ${
                  plan.name === 'Pro' ? 'ring-2 ring-[#3C3737]' : ''
                }`}
              >
                {plan.name === 'Pro' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#3C3737] text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h2>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                  <Icon className="w-8 h-8 text-[#3C3737]" />
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#3C3737]" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg bg-[#3C3737] text-white hover:opacity-90 transition-opacity text-sm font-medium flex items-center justify-center gap-2 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}