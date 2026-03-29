-- =====================================================
-- ATUALIZAR PRICE IDS DO STRIPE NO BANCO
-- =====================================================
-- Execute este SQL no Supabase SQL Editor para vincular
-- os produtos do banco aos produtos criados no Stripe
-- =====================================================

-- Atualizar Plano Básico
UPDATE subscription_plans
SET
  stripe_price_id_monthly = 'price_price_1Sk2OkRwJh1khCyJZOHNcdiy',
  stripe_price_id_yearly = 'price_1Sk2AbRwJh1khCyJn1ezvWeH',
  stripe_product_id = 'prod_ThR2N1XRt0nqBV'
WHERE slug = 'basic';

-- Atualizar Plano Profissional
UPDATE subscription_plans
SET
  stripe_price_id_monthly = 'price_1Sk2NRRwJh1khCyJLLV99Zhv',
  stripe_price_id_yearly = 'price_1Sk2CYRwJh1khCyJjREI6ZKF',
  stripe_product_id = 'prod_ThR439MYEHWxtX'
WHERE slug = 'professional';

-- Atualizar Plano Premium
UPDATE subscription_plans
SET
  stripe_price_id_monthly = 'price_1Sk2LgRwJh1khCyJGWi58LW9',
  stripe_price_id_yearly = 'price_1Sk2E6RwJh1khCyJyYRpWtl4',
  stripe_product_id = 'prod_ThR63B0G9YN8j8'
WHERE slug = 'premium';

-- Verificar se os IDs foram atualizados corretamente
SELECT
  slug,
  name,
  price_monthly,
  price_yearly,
  stripe_price_id_monthly,
  stripe_price_id_yearly,
  stripe_product_id
FROM subscription_plans
ORDER BY sort_order;
