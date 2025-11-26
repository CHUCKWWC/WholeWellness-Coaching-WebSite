import { useEffect } from 'react';

interface StripeBuyButtonProps {
  buyButtonId?: string;
  publishableKey?: string;
  className?: string;
}

const DEFAULT_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_LIVE_PUBLIC_KEY || '';

export default function StripeBuyButton({ 
  buyButtonId, 
  publishableKey = DEFAULT_PUBLISHABLE_KEY,
  className = ''
}: StripeBuyButtonProps) {
  useEffect(() => {
    // Load Stripe Buy Button script if not already loaded
    const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/buy-button.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!buyButtonId || !publishableKey) {
    return (
      <div className="text-center text-gray-500 p-4">
        Payment button not configured
      </div>
    );
  }

  return (
    <div className={`flex justify-center ${className}`} data-testid="stripe-buy-button-container">
      {/* @ts-ignore - Stripe custom element */}
      <stripe-buy-button
        buy-button-id={buyButtonId}
        publishable-key={publishableKey}
      />
    </div>
  );
}
