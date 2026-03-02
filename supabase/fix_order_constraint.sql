-- =====================================================================
-- AdvayDecor — Fix Order Status Constraint
-- =====================================================================
-- RUN IN: Supabase Dashboard → SQL Editor → New Query → Paste → Run
--
-- This script updates the database to allow the "Awaiting Payment" status,
-- which is used for Razorpay orders. Without this, the checkout will fail.
-- =====================================================================

-- 1. First, we need to drop the old constraint
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. Then, we add the new one with "Awaiting Payment" included
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('Awaiting Payment', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'));

SELECT '✅ Order status constraint updated successfully! You can now place Razorpay orders.' AS status;
