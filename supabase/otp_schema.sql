-- Run this in your Supabase SQL Editor to support custom OTP verification

-- 1. Table for email OTPs (8-digit)
CREATE TABLE IF NOT EXISTS email_verification_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_email ON email_verification_otps(email);
ALTER TABLE email_verification_otps ENABLE ROW LEVEL SECURITY;

-- 2. Table for phone OTPs (6-digit)
CREATE TABLE IF NOT EXISTS phone_verification_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON phone_verification_otps(phone);
ALTER TABLE phone_verification_otps ENABLE ROW LEVEL SECURITY;

-- 3. Ensure phone is unique in profiles
-- Run this carefully: if duplicates exist, this will fail until they are cleaned up.
ALTER TABLE public.profiles ADD CONSTRAINT UNIQUE_phone UNIQUE (phone);
