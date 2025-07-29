-- ===========================================
-- COUPON SYSTEM DATABASE SCHEMA
-- ===========================================
-- This file creates the complete database schema for the coupon system
-- Run these commands in your Supabase SQL editor to set up the coupon system

-- ===========================================
-- 1. COUPONS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_access')),
  discount_value DECIMAL(10,2), -- percentage (0-100) or fixed amount
  max_uses INTEGER, -- null = unlimited
  current_uses INTEGER DEFAULT 0,
  applicable_courses TEXT[], -- null = all courses, or specific course IDs
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR REFERENCES auth.users(id), -- admin who created it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 2. COUPON REDEMPTIONS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL, -- References users.id
  course_id VARCHAR, -- Which course this was used for
  enrollment_id UUID, -- References coach_enrollments(id)
  original_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  payment_intent_id VARCHAR, -- Stripe payment intent ID (null for free access)
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'refunded', 'cancelled'))
);

-- ===========================================
-- 3. COURSE ENROLLMENT PAYMENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS course_enrollment_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL, -- References coach_enrollments(id)
  user_id VARCHAR NOT NULL, -- References users.id
  course_id VARCHAR NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('stripe', 'coupon', 'admin_grant')),
  payment_intent_id VARCHAR, -- Stripe payment intent ID
  coupon_redemption_id UUID REFERENCES coupon_redemptions(id),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
  metadata JSONB, -- Additional payment information
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 4. INDEXES FOR PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id ON coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_id ON coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_course_payments_enrollment_id ON course_enrollment_payments(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_course_payments_user_id ON course_enrollment_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_payments_status ON course_enrollment_payments(payment_status);

-- ===========================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ===========================================
-- Enable RLS on all tables
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollment_payments ENABLE ROW LEVEL SECURITY;

-- Coupons are readable by all authenticated users (for validation)
CREATE POLICY "Coupons are readable by authenticated users" ON coupons
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Only admins can manage coupons
CREATE POLICY "Only admins can manage coupons" ON coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );

-- Users can view their own coupon redemptions
CREATE POLICY "Users can view their own coupon redemptions" ON coupon_redemptions
  FOR SELECT USING (user_id = auth.uid());

-- Users can create coupon redemptions for themselves
CREATE POLICY "Users can create their own coupon redemptions" ON coupon_redemptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can view their own payment records
CREATE POLICY "Users can view their own payment records" ON course_enrollment_payments
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own payment records
CREATE POLICY "Users can create their own payment records" ON course_enrollment_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all payment records
CREATE POLICY "Admins can view all payment records" ON course_enrollment_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );

-- ===========================================
-- 6. SAMPLE COUPONS
-- ===========================================
INSERT INTO coupons (
  code, name, description, discount_type, discount_value, max_uses, 
  applicable_courses, starts_at, expires_at, created_by
) VALUES 
(
  'WELCOME25',
  '25% Off Welcome Discount',
  'New user welcome discount - 25% off any certification course',
  'percentage',
  25.00,
  100,
  NULL, -- Applicable to all courses
  NOW(),
  NOW() + INTERVAL '3 months',
  (SELECT id FROM auth.users WHERE email = 'admin@wholewellnesscoaching.org' LIMIT 1)
),
(
  'FREEACCESS',
  'Free Course Access',
  'Admin-granted free access to certification courses',
  'free_access',
  NULL,
  NULL, -- Unlimited uses
  NULL, -- All courses
  NOW(),
  NOW() + INTERVAL '1 year',
  (SELECT id FROM auth.users WHERE email = 'admin@wholewellnesscoaching.org' LIMIT 1)
),
(
  'EARLYBIRD50',
  'Early Bird 50% Discount',
  'Limited time early bird discount for new course launches',
  'percentage',
  50.00,
  50,
  ARRAY['course-1', 'course-2'], -- Specific courses
  NOW(),
  NOW() + INTERVAL '1 month',
  (SELECT id FROM auth.users WHERE email = 'admin@wholewellnesscoaching.org' LIMIT 1)
),
(
  'SAVE100',
  '$100 Fixed Discount',
  'Fixed $100 discount on premium courses',
  'fixed_amount',
  100.00,
  25,
  ARRAY['course-3'], -- Advanced relationship counseling
  NOW(),
  NOW() + INTERVAL '2 months',
  (SELECT id FROM auth.users WHERE email = 'admin@wholewellnesscoaching.org' LIMIT 1)
)
ON CONFLICT (code) DO NOTHING;

-- ===========================================
-- 7. COUPON VALIDATION FUNCTION
-- ===========================================
CREATE OR REPLACE FUNCTION validate_coupon(
  coupon_code TEXT,
  course_id_param TEXT DEFAULT NULL,
  user_id_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  coupon_record RECORD;
  result JSON;
BEGIN
  -- Get coupon details
  SELECT * INTO coupon_record
  FROM coupons
  WHERE code = coupon_code
    AND is_active = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at >= NOW());

  -- Check if coupon exists and is valid
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invalid or expired coupon code'
    );
  END IF;

  -- Check usage limits
  IF coupon_record.max_uses IS NOT NULL AND coupon_record.current_uses >= coupon_record.max_uses THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Coupon usage limit reached'
    );
  END IF;

  -- Check course applicability
  IF coupon_record.applicable_courses IS NOT NULL 
     AND course_id_param IS NOT NULL 
     AND NOT (course_id_param = ANY(coupon_record.applicable_courses)) THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Coupon not applicable to this course'
    );
  END IF;

  -- Check if user already used this coupon
  IF user_id_param IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM coupon_redemptions 
      WHERE coupon_id = coupon_record.id 
        AND user_id = user_id_param 
        AND status = 'active'
    ) THEN
      RETURN json_build_object(
        'valid', false,
        'error', 'You have already used this coupon'
      );
    END IF;
  END IF;

  -- Return valid coupon details
  RETURN json_build_object(
    'valid', true,
    'coupon', json_build_object(
      'id', coupon_record.id,
      'code', coupon_record.code,
      'name', coupon_record.name,
      'description', coupon_record.description,
      'discount_type', coupon_record.discount_type,
      'discount_value', coupon_record.discount_value,
      'minimum_order_amount', coupon_record.minimum_order_amount
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 8. UPDATE COUPON USAGE FUNCTION
-- ===========================================
CREATE OR REPLACE FUNCTION update_coupon_usage(coupon_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons 
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE id = coupon_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
DO $$
BEGIN
  RAISE NOTICE 'Coupon System database schema created successfully!';
  RAISE NOTICE 'Tables created: coupons, coupon_redemptions, course_enrollment_payments';
  RAISE NOTICE 'Sample coupons inserted: WELCOME25, FREEACCESS, EARLYBIRD50, SAVE100';
  RAISE NOTICE 'RLS policies enabled for data security';
  RAISE NOTICE 'Validation functions created for coupon management';
  RAISE NOTICE 'System ready for coupon-based course enrollment';
END $$;