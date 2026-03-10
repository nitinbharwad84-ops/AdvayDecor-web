-- ============================================================
-- Migration: Add Cancel & Return Request columns to orders
-- ============================================================

-- 1. Add new columns for cancel/return request data
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
  ADD COLUMN IF NOT EXISTS return_reason TEXT,
  ADD COLUMN IF NOT EXISTS return_is_packaged BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS return_is_unused BOOLEAN DEFAULT false;

-- 2. Update the status CHECK constraint to include the new statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'Awaiting Payment',
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Returned',
    'Cancellation Requested',
    'Return Requested'
  ));
