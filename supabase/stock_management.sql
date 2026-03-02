-- =====================================================================
-- AdvayDecor — Stock Management Function
-- =====================================================================
-- This function safely decrements the stock_quantity of a product variant.
-- It uses a floor of 0 to prevent negative stock values.
--
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- =====================================================================

CREATE OR REPLACE FUNCTION public.decrement_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.product_variants
    SET stock_quantity = GREATEST(stock_quantity - p_quantity, 0)
    WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.decrement_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock(UUID, INTEGER) TO service_role;
