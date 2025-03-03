import Razorpay from 'razorpay';
import { supabase } from '@/lib/supabase';
import { PaymentService, SubscriptionPlan } from './types';

export class PaymentServiceImpl implements PaymentService {
  private razorpay: Razorpay;
  private plans: SubscriptionPlan[] = [
    {
      id: 'plan_basic',
      name: 'Basic',
      price: 900, // ₹900
      credits: 50,
      features: [
        '50 tokens per month',
        'Basic idea analysis',
        'Core documentation generation',
        'Email support',
        'Basic API access'
      ],
      interval: 'monthly'
    },
    {
      id: 'plan_pro',
      name: 'Pro',
      price: 2900, // ₹2900
      credits: -1, // Unlimited
      features: [
        'Unlimited tokens',
        'Advanced AI analysis',
        'Priority documentation generation',
        'Priority support',
        'Full API access',
        'Custom templates',
        'Team collaboration'
      ],
      interval: 'monthly'
    }
  ];

  constructor() {
    this.razorpay = new Razorpay({
      key_id: import.meta.env.VITE_RAZORPAY_KEY_ID,
      key_secret: import.meta.env.VITE_RAZORPAY_KEY_SECRET
    });
  }

  async createOrder(amount: number, currency: string = 'INR') {
    try {
      const order = await this.razorpay.orders.create({
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `order_${Date.now()}`,
        payment_capture: 1
      });
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Verify payment signature
      const crypto = require('crypto');
      const text = orderId + '|' + paymentId;
      const generated_signature = crypto
        .createHmac('sha256', import.meta.env.VITE_RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      if (generated_signature === signature) {
        // Update user's subscription in database
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            payment_id: paymentId,
            order_id: orderId,
            status: 'active',
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error('Payment verification failed');
    }
  }

  async createSubscription(planId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const plan = this.plans.find(p => p.id === planId);
      if (!plan) throw new Error('Invalid plan selected');

      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12, // 12 months
        quantity: 1
      });

      // Store subscription details in database
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          subscription_id: subscription.id,
          plan_id: planId,
          status: 'created',
          start_date: new Date().toISOString()
        });

      if (error) throw error;
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await this.razorpay.subscriptions.cancel(subscriptionId);

      // Update subscription status in database
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .match({ subscription_id: subscriptionId, user_id: user.id });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  getPlans(): SubscriptionPlan[] {
    return this.plans;
  }
}