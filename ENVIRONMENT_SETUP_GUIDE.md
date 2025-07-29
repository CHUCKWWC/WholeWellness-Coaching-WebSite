# Environment Configuration Guide

## 🔍 **Current Status Analysis**

You've provided several keys, but we need to clarify which services they're for:

### **Keys You've Provided:**
1. `sb_publishable_h61QWhHkO76kNSrFgbN95g_qMZYZnOj` - Supabase publishable key
2. `sb_secretsb_secret_lgSGococKQjpy83VyIAgng_TPdKH_NM` - Supabase secret key

### **Keys We Already Have (✅ Correct Format):**
- **Supabase URL:** `https://pwuwmnivvdvdxdewynbo.supabase.co`
- **Supabase Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT format)
- **Supabase Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT format)

## ⚠️ **Key Format Issues**

The keys you just provided (`sb_publishable_...` and `sb_secret...`) don't match the standard formats we expect:

### **Expected Key Formats:**

**Supabase Keys (should be JWTs):**
```
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
```

**Stripe Keys (what we actually need for payments):**
```
publishable: pk_test_51ABCdef123456789...
secret: sk_test_51ABCdef123456789...
```

## 🎯 **What We Actually Need**

For the payment and coupon system to work, we need **Stripe API keys**, not additional Supabase keys:

### **1. Stripe Dashboard:**
- Go to: https://dashboard.stripe.com/test/apikeys
- Copy your **Publishable key** (starts with `pk_test_`)
- Copy your **Secret key** (starts with `sk_test_`)

### **2. Current Working Configuration:**
```env
# ✅ Supabase (Already Configured)
SUPABASE_URL=https://pwuwmnivvdvdxdewynbo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dXdtbml2dmR2ZHhkZXd5bmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4Njk2NzcsImV4cCI6MjA2MzQ0NTY3N30.S-mrKbMamj9NuYQZLKGgVoKNzzoNI2GMzrVHi_HZ8Iw

# ❌ Missing - Stripe (Needed for Payments)
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
```

## 🔧 **Quick Setup Steps**

### **Option 1: Get Stripe Keys (Recommended)**
1. Create Stripe account: https://dashboard.stripe.com/register
2. Go to API Keys section
3. Copy both keys and add to `.env`

### **Option 2: Test Without Payments**
If you want to test other features first, you can temporarily use:
```env
# Temporary test keys (for development only)
STRIPE_SECRET_KEY=sk_test_temp
VITE_STRIPE_PUBLIC_KEY=pk_test_temp
```

## 🚀 **Ready to Deploy Features**

Once you have Stripe keys, these features will work:
- ✅ **Course enrollment with payment verification**
- ✅ **Coupon system with discounts**
- ✅ **Admin coupon management**
- ✅ **Free access grants**
- ✅ **Module access protection**

## 📋 **Complete .env Template**

```env
# Supabase (✅ Ready)
SUPABASE_URL=https://pwuwmnivvdvdxdewynbo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dXdtbml2dmR2ZHhkZXd5bmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4Njk2NzcsImV4cCI6MjA2MzQ0NTY3N30.S-mrKbMamj9NuYQZLKGgVoKNzzoNI2GMzrVHi_HZ8Iw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dXdtbml2dmR2ZHhkZXd5bmJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg2OTY3NywiZXhwIjoyMDYzNDQ1Njc3fQ._daQTENeg-Hkh9BxTtO9gY_BTpJafpNWKS5X4A1VFG4

# Vite Frontend
VITE_SUPABASE_URL=https://pwuwmnivvdvdxdewynbo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dXdtbml2dmR2ZHhkZXd5bmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4Njk2NzcsImV4cCI6MjA2MzQ0NTY3N30.S-mrKbMamj9NuYQZLKGgVoKNzzoNI2GMzrVHi_HZ8Iw

# Stripe (❌ Still Need These)
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_STRIPE_SECRET_KEY
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_ACTUAL_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# JWT
JWT_SECRET=your_random_jwt_secret_here_change_in_production
```

## ❓ **Next Steps**

Please clarify:
1. **Do you have a Stripe account?** If not, we can set one up
2. **Are the `sb_` keys you provided from a different service?**
3. **Would you like to test the system without payments first?**

The payment verification and coupon system is ready to deploy once we have the correct Stripe configuration!