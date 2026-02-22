-- Run this in your Supabase SQL Editor to support custom 8-digit OTP verification

CREATE TABLE IF NOT EXISTS email_verification_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_email ON email_verification_otps(email);

-- RLS: Only service role should access this table
ALTER TABLE email_verification_otps ENABLE ROW LEVEL SECURITY;
