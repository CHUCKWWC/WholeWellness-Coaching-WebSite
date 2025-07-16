import { useLocation } from 'wouter';

export const initiatePayment = (amount: number, description: string = 'Coaching Services') => {
  // Store payment details for checkout page
  sessionStorage.setItem('checkout_amount', amount.toString());
  sessionStorage.setItem('checkout_description', description);
  
  // Navigate to checkout
  window.location.href = '/checkout';
};

export const initiateSubscription = (planId: string = 'monthly') => {
  // Navigate to subscription page with plan
  window.location.href = `/subscribe?plan=${planId}`;
};

export const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
};

export const pricingPlans = [
  {
    id: 'weekly',
    name: 'Weekly Sessions',
    price: 8000, // $80 in cents
    displayPrice: '$80',
    interval: 'week',
    description: 'Best for active support and rapid progress',
    features: [
      'Weekly 50-minute sessions',
      'Unlimited messaging between sessions',
      'Personalized action plans',
      'Progress tracking tools',
      'Resource library access',
      'Crisis support available'
    ],
    popular: true
  },
  {
    id: 'biweekly',
    name: 'Bi-Weekly Sessions',
    price: 16000, // $160 in cents
    displayPrice: '$160',
    interval: 'month',
    description: 'Balanced support for steady growth',
    features: [
      'Two sessions per month',
      'Unlimited messaging between sessions',
      'Goal tracking tools',
      'Resource library access',
      'Email support',
      'Monthly progress reports'
    ],
    popular: false
  },
  {
    id: 'monthly',
    name: 'Monthly Sessions',
    price: 9000, // $90 in cents
    displayPrice: '$90',
    interval: 'month',
    description: 'Maintenance and check-in support',
    features: [
      'One session per month',
      'Unlimited messaging between sessions',
      'Email support',
      'Resource library access',
      'Quarterly progress review',
      'Community forum access'
    ],
    popular: false
  }
];