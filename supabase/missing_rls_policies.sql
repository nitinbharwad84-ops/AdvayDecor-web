-- =============================================
-- AdvayDecor — Missing RLS Policies
-- Run this in your Supabase SQL Editor
-- Safe to run: uses IF NOT EXISTS / OR REPLACE
-- =============================================

-- ============================================
-- PRODUCT VARIANTS: Public read, Admin all
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone view product variants' AND tablename = 'product_variants') THEN
    CREATE POLICY "Anyone view product variants" ON public.product_variants FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage product variants' AND tablename = 'product_variants') THEN
    CREATE POLICY "Admins manage product variants" ON public.product_variants FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ============================================
-- PRODUCT IMAGES: Public read, Admin all
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone view product images' AND tablename = 'product_images') THEN
    CREATE POLICY "Anyone view product images" ON public.product_images FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage product images' AND tablename = 'product_images') THEN
    CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ============================================
-- CATEGORIES: Public read, Admin all
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone view active categories' AND tablename = 'categories') THEN
    CREATE POLICY "Anyone view active categories" ON public.categories FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage categories' AND tablename = 'categories') THEN
    CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ============================================
-- WISHLISTS: Users manage own, Admin read all
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own wishlist' AND tablename = 'wishlists') THEN
    CREATE POLICY "Users manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins view all wishlists' AND tablename = 'wishlists') THEN
    CREATE POLICY "Admins view all wishlists" ON public.wishlists FOR SELECT USING (public.is_admin());
  END IF;
END $$;

-- ============================================
-- PRODUCT REVIEWS: Public read approved, Users insert/update own, Admin all
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone view approved reviews' AND tablename = 'product_reviews') THEN
    CREATE POLICY "Anyone view approved reviews" ON public.product_reviews FOR SELECT USING (is_approved = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users insert own reviews' AND tablename = 'product_reviews') THEN
    CREATE POLICY "Users insert own reviews" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own reviews' AND tablename = 'product_reviews') THEN
    CREATE POLICY "Users update own reviews" ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage all reviews' AND tablename = 'product_reviews') THEN
    CREATE POLICY "Admins manage all reviews" ON public.product_reviews FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ============================================
-- CONTACT MESSAGES: Users insert, Users view own, Admin all
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can send contact message' AND tablename = 'contact_messages') THEN
    CREATE POLICY "Anyone can send contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own messages' AND tablename = 'contact_messages') THEN
    CREATE POLICY "Users view own messages" ON public.contact_messages FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage all messages' AND tablename = 'contact_messages') THEN
    CREATE POLICY "Admins manage all messages" ON public.contact_messages FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ============================================
-- FAQ QUESTIONS: Anyone insert, Users view own, Admin all
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can submit faq question' AND tablename = 'faq_questions') THEN
    CREATE POLICY "Anyone can submit faq question" ON public.faq_questions FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own questions' AND tablename = 'faq_questions') THEN
    CREATE POLICY "Users view own questions" ON public.faq_questions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage all faq questions' AND tablename = 'faq_questions') THEN
    CREATE POLICY "Admins manage all faq questions" ON public.faq_questions FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ============================================
-- COUPONS: Public read active (for validation), Admin all
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone view active coupons' AND tablename = 'coupons') THEN
    CREATE POLICY "Anyone view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage coupons' AND tablename = 'coupons') THEN
    CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ============================================
-- ORDER ITEMS: Users view own, Admin all
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own order items' AND tablename = 'order_items') THEN
    CREATE POLICY "Users view own order items" ON public.order_items
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.orders
          WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users insert own order items' AND tablename = 'order_items') THEN
    CREATE POLICY "Users insert own order items" ON public.order_items
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.orders
          WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage order items' AND tablename = 'order_items') THEN
    CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ============================================
-- SITE CONFIG: Public read, Admin all
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone read site config' AND tablename = 'site_config') THEN
    CREATE POLICY "Anyone read site config" ON public.site_config FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage site config' AND tablename = 'site_config') THEN
    CREATE POLICY "Admins manage site config" ON public.site_config FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
