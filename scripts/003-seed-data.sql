-- ===================================================
-- Seed Data for PharmaCare Parapharmacie
-- بيانات أولية لصيدلية باراصيدلية
-- ===================================================

-- ===================================================
-- الفئات الرئيسية والفرعية
-- Main and Sub Categories
-- ===================================================
INSERT INTO categories (id, name, slug, description, parent_id) VALUES
  -- Visage (العناية بالوجه)
  ('c1000000-0000-0000-0000-000000000001', 'Visage', 'visage', 'Soins du visage pour tous types de peau', NULL),
  ('c1100000-0000-0000-0000-000000000011', 'Nettoyants', 'nettoyants-visage', 'Nettoyants et démaquillants pour le visage', 'c1000000-0000-0000-0000-000000000001'),
  ('c1200000-0000-0000-0000-000000000012', 'Hydratants', 'hydratants-visage', 'Crèmes hydratantes et sérums', 'c1000000-0000-0000-0000-000000000001'),
  ('c1300000-0000-0000-0000-000000000013', 'Anti-âge', 'anti-age', 'Soins anti-rides et raffermissants', 'c1000000-0000-0000-0000-000000000001'),
  ('c1400000-0000-0000-0000-000000000014', 'Protection solaire', 'protection-solaire-visage', 'Crèmes solaires et après-soleil', 'c1000000-0000-0000-0000-000000000001'),
  ('c1500000-0000-0000-0000-000000000015', 'Masques', 'masques-visage', 'Masques purifiants et hydratants', 'c1000000-0000-0000-0000-000000000001'),

  -- Cheveux (العناية بالشعر)
  ('c2000000-0000-0000-0000-000000000002', 'Cheveux', 'cheveux', 'Soins capillaires pour tous types de cheveux', NULL),
  ('c2100000-0000-0000-0000-000000000021', 'Shampoings', 'shampoings', 'Shampoings pour tous types de cheveux', 'c2000000-0000-0000-0000-000000000002'),
  ('c2200000-0000-0000-0000-000000000022', 'Après-shampoings', 'apres-shampoings', 'Après-shampoings et masques capillaires', 'c2000000-0000-0000-0000-000000000002'),
  ('c2300000-0000-0000-0000-000000000023', 'Anti-chute', 'anti-chute-cheveux', 'Traitements anti-chute de cheveux', 'c2000000-0000-0000-0000-000000000002'),
  ('c2400000-0000-0000-0000-000000000024', 'Colorations', 'colorations', 'Colorations et soins colorés', 'c2000000-0000-0000-0000-000000000002'),

  -- Corps (العناية بالجسم)
  ('c3000000-0000-0000-0000-000000000003', 'Corps', 'corps', 'Soins corporels et hydratation', NULL),
  ('c3100000-0000-0000-0000-000000000031', 'Gels douche', 'gels-douche', 'Gels douche et savons', 'c3000000-0000-0000-0000-000000000003'),
  ('c3200000-0000-0000-0000-000000000032', 'Laits corporels', 'laits-corporels', 'Laits et crèmes hydratantes corps', 'c3000000-0000-0000-0000-000000000003'),
  ('c3300000-0000-0000-0000-000000000033', 'Déodorants', 'deodorants', 'Déodorants et anti-transpirants', 'c3000000-0000-0000-0000-000000000003'),
  ('c3400000-0000-0000-0000-000000000034', 'Minceur', 'minceur', 'Soins minceur et anti-cellulite', 'c3000000-0000-0000-0000-000000000003'),

  -- Mains et Pieds (الأيدي والأقدام)
  ('c4000000-0000-0000-0000-000000000004', 'Mains et Pieds', 'mains-pieds', 'Soins des mains et des pieds', NULL),
  ('c4100000-0000-0000-0000-000000000041', 'Crèmes mains', 'cremes-mains', 'Crèmes hydratantes pour les mains', 'c4000000-0000-0000-0000-000000000004'),
  ('c4200000-0000-0000-0000-000000000042', 'Soins pieds', 'soins-pieds', 'Crèmes et traitements pour les pieds', 'c4000000-0000-0000-0000-000000000004'),

  -- Maman et Bébé (الأم والطفل)
  ('c5000000-0000-0000-0000-000000000005', 'Maman et Bébé', 'maman-bebe', 'Produits pour mamans et bébés', NULL),
  ('c5100000-0000-0000-0000-000000000051', 'Hygiène bébé', 'hygiene-bebe', 'Produits d''hygiène pour bébé', 'c5000000-0000-0000-0000-000000000005'),
  ('c5200000-0000-0000-0000-000000000052', 'Soins bébé', 'soins-bebe', 'Crèmes et soins pour bébé', 'c5000000-0000-0000-0000-000000000005'),
  ('c5300000-0000-0000-0000-000000000053', 'Maternité', 'maternite', 'Soins pour femmes enceintes', 'c5000000-0000-0000-0000-000000000005'),
  ('c5400000-0000-0000-0000-000000000054', 'Alimentation bébé', 'alimentation-bebe', 'Lait infantile et nutrition bébé', 'c5000000-0000-0000-0000-000000000005'),

  -- Matériel Médical (الأجهزة الطبية)
  ('c6000000-0000-0000-0000-000000000006', 'Matériel Médical', 'materiel-medical', 'Dispositifs et matériel médical', NULL),
  ('c6100000-0000-0000-0000-000000000061', 'Thermomètres', 'thermometres', 'Thermomètres médicaux', 'c6000000-0000-0000-0000-000000000006'),
  ('c6200000-0000-0000-0000-000000000062', 'Tensiomètres', 'tensiometres', 'Appareils de mesure de tension', 'c6000000-0000-0000-0000-000000000006'),
  ('c6300000-0000-0000-0000-000000000063', 'Pansements', 'pansements', 'Pansements et bandages', 'c6000000-0000-0000-0000-000000000006'),
  ('c6400000-0000-0000-0000-000000000064', 'Orthopédie', 'orthopedie', 'Matériel orthopédique', 'c6000000-0000-0000-0000-000000000006')
ON CONFLICT (id) DO NOTHING;

-- ===================================================
-- الماركات (أضف الماركات الحقيقية من لوحة الإدارة)
-- Brands (Add your real brands via admin panel /admin/marques)
-- ===================================================
-- مثال:
-- INSERT INTO brands (id, name, slug, description, logo, featured) VALUES
--   ('brand-uuid', 'اسم الماركة', 'brand-slug', 'وصف الماركة', '/logo.jpg', false);

-- ===================================================
-- المنتجات (أضف منتجاتك الحقيقية من لوحة الإدارة)
-- Products (Add your real products via admin panel /admin/products)
-- ===================================================

-- Insert All 48 Algerian Wilayas
INSERT INTO wilayas (name, code, shipping_cost, delivery_days, is_active) VALUES
  ('Adrar', '01', 1200, 5, true),
  ('Chlef', '02', 600, 2, true),
  ('Laghouat', '03', 900, 4, true),
  ('Oum El Bouaghi', '04', 700, 3, true),
  ('Batna', '05', 700, 3, true),
  ('Béjaïa', '06', 600, 2, true),
  ('Biskra', '07', 800, 3, true),
  ('Béchar', '08', 1100, 5, true),
  ('Blida', '09', 400, 1, true),
  ('Bouira', '10', 500, 2, true),
  ('Tamanrasset', '11', 1500, 7, true),
  ('Tébessa', '12', 800, 3, true),
  ('Tlemcen', '13', 700, 3, true),
  ('Tiaret', '14', 700, 3, true),
  ('Tizi Ouzou', '15', 500, 2, true),
  ('Alger', '16', 400, 1, true),
  ('Djelfa', '17', 800, 3, true),
  ('Jijel', '18', 650, 2, true),
  ('Sétif', '19', 600, 2, true),
  ('Saïda', '20', 750, 3, true),
  ('Skikda', '21', 650, 2, true),
  ('Sidi Bel Abbès', '22', 700, 3, true),
  ('Annaba', '23', 700, 3, true),
  ('Guelma', '24', 700, 3, true),
  ('Constantine', '25', 600, 2, true),
  ('Médéa', '26', 500, 2, true),
  ('Mostaganem', '27', 600, 2, true),
  ('M''Sila', '28', 700, 3, true),
  ('Mascara', '29', 650, 2, true),
  ('Ouargla', '30', 1000, 4, true),
  ('Oran', '31', 550, 2, true),
  ('El Bayadh', '32', 900, 4, true),
  ('Illizi', '33', 1500, 7, true),
  ('Bordj Bou Arréridj', '34', 600, 2, true),
  ('Boumerdès', '35', 400, 1, true),
  ('El Tarf', '36', 750, 3, true),
  ('Tindouf', '37', 1500, 7, true),
  ('Tissemsilt', '38', 700, 3, true),
  ('El Oued', '39', 900, 4, true),
  ('Khenchela', '40', 750, 3, true),
  ('Souk Ahras', '41', 750, 3, true),
  ('Tipaza', '42', 450, 1, true),
  ('Mila', '43', 650, 2, true),
  ('Aïn Defla', '44', 550, 2, true),
  ('Naâma', '45', 900, 4, true),
  ('Aïn Témouchent', '46', 650, 2, true),
  ('Ghardaïa', '47', 1000, 4, true),
  ('Relizane', '48', 600, 2, true)
ON CONFLICT (code) DO NOTHING;

-- ===================================================
-- أكواد الترويج (يمكنك إضافة أكواد حقيقية هنا)
-- Sample Promo Codes Template:
-- INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_uses, valid_from, valid_until, is_active) VALUES
--   ('CODE_NAME', 'percentage', 10, 2000, 100, NOW(), NOW() + INTERVAL '1 month', true);
-- ===================================================
