-- ===================================================
-- إعادة تعيين وإضافة البيانات النظيفة
-- Reset and Add Clean Data
-- ===================================================

-- حذف جميع البيانات الوهمية
DELETE FROM product_images;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM addresses;
DELETE FROM products;
DELETE FROM brands;
DELETE FROM categories;
DELETE FROM promo_codes;

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
  ('c6400000-0000-0000-0000-000000000064', 'Orthopédie', 'orthopedie', 'Matériel orthopédique', 'c6000000-0000-0000-0000-000000000006');

-- ===================================================
-- العلامات التجارية
-- Brands
-- ===================================================
INSERT INTO brands (id, name, slug, description, logo, created_at) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'La Roche-Posay', 'la-roche-posay', 'Soins dermatologiques recommandés par les dermatologues', '/brands/laroche-posay.png', NOW()),
  ('b2000000-0000-0000-0000-000000000002', 'Vichy', 'vichy', 'Expertise en soins de la peau à l''eau thermale', '/brands/vichy.png', NOW()),
  ('b3000000-0000-0000-0000-000000000003', 'Avène', 'avene', 'Soins apaisants pour peaux sensibles', '/brands/avene.png', NOW()),
  ('b4000000-0000-0000-0000-000000000004', 'Bioderma', 'bioderma', 'Solutions dermatologiques innovantes', '/brands/bioderma.png', NOW()),
  ('b5000000-0000-0000-0000-000000000005', 'Eucerin', 'eucerin', 'Soins pour peaux sensibles et sèches', '/brands/eucerin.png', NOW()),
  ('b6000000-0000-0000-0000-000000000006', 'CeraVe', 'cerave', 'Soins développés avec des dermatologues', '/brands/cerave.png', NOW()),
  ('b7000000-0000-0000-0000-000000000007', 'Nuxe', 'nuxe', 'Cosmétique naturelle de luxe', '/brands/nuxe.png', NOW()),
  ('b8000000-0000-0000-0000-000000000008', 'Mustela', 'mustela', 'Soins pour bébés et mamans', '/brands/mustela.png', NOW()),
  ('b9000000-0000-0000-0000-000000000009', 'Klorane', 'klorane', 'Soins capillaires et corps d''origine végétale', '/brands/klorane.png', NOW()),
  ('ba000000-0000-0000-0000-00000000000a', 'Ducray', 'ducray', 'Soins capillaires dermatologiques', '/brands/ducray.png', NOW()),
  ('bb000000-0000-0000-0000-00000000000b', 'Lierac', 'lierac', 'Phytocosmétique de luxe', '/brands/lierac.png', NOW()),
  ('bc000000-0000-0000-0000-00000000000c', 'Caudalie', 'caudalie', 'Cosmétique bio à base de raisin', '/brands/caudalie.png', NOW()),
  ('bd000000-0000-0000-0000-00000000000d', 'SVR', 'svr', 'Laboratoire dermatologique', '/brands/svr.png', NOW()),
  ('be000000-0000-0000-0000-00000000000e', 'Uriage', 'uriage', 'Soins à l''eau thermale d''Uriage', '/brands/uriage.png', NOW()),
  ('bf000000-0000-0000-0000-00000000000f', 'A-Derma', 'a-derma', 'Dermocosmétique à l''avoine Rhealba', '/brands/a-derma.png', NOW());

-- ===================================================
-- المنتجات في الترويج
-- Products on Promotion
-- ===================================================
INSERT INTO products (id, name, slug, description, short_description, price, original_price, discount, on_promotion, category_id, brand_id, stock, sku, featured, created_at) VALUES
  -- Visage Products
  ('a1000000-0000-0000-0000-000000000001', 'La Roche-Posay Effaclar Duo+', 'effaclar-duo-plus', 'Soin correcteur anti-imperfections pour peaux à tendance acnéique', 'Anti-imperfections et anti-marques', 3200, 4500, 29, true, 'c1300000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000001', 50, 'LRP-EFF-001', true, NOW()),
  ('a2000000-0000-0000-0000-000000000002', 'Vichy Liftactiv Collagen Specialist', 'vichy-liftactiv-collagen', 'Crème anti-âge au collagène et vitamine C', 'Raffermissant et anti-rides', 4800, 6500, 26, true, 'c1300000-0000-0000-0000-000000000013', 'b2000000-0000-0000-0000-000000000002', 35, 'VCH-LFT-001', true, NOW()),
  ('a3000000-0000-0000-0000-000000000003', 'Bioderma Sensibio H2O', 'bioderma-sensibio-h2o', 'Solution micellaire nettoyante et démaquillante', 'Nettoie et démaquille en douceur', 1800, 2400, 25, true, 'c1100000-0000-0000-0000-000000000011', 'b4000000-0000-0000-0000-000000000004', 100, 'BIO-SEN-001', false, NOW()),
  ('a4000000-0000-0000-0000-000000000004', 'Avène Crème Hydratance Optimale', 'avene-creme-hydratance', 'Crème hydratante légère peaux normales à mixtes', 'Hydratation 24h', 2900, 3800, 24, true, 'c1200000-0000-0000-0000-000000000012', 'b3000000-0000-0000-0000-000000000003', 60, 'AVN-HYD-001', false, NOW()),
  
  -- Cheveux Products
  ('a5000000-0000-0000-0000-000000000005', 'Ducray Anaphase+ Shampooing', 'ducray-anaphase-shampooing', 'Shampooing complément anti-chute', 'Stimule la croissance', 2200, 3200, 31, true, 'c2300000-0000-0000-0000-000000000023', 'ba000000-0000-0000-0000-00000000000a', 45, 'DCR-ANA-001', true, NOW()),
  ('a6000000-0000-0000-0000-000000000006', 'Klorane Shampooing à la Camomille', 'klorane-shampooing-camomille', 'Shampooing éclaircissant aux reflets dorés', 'Illumine les cheveux blonds', 1600, 2100, 24, true, 'c2100000-0000-0000-0000-000000000021', 'b9000000-0000-0000-0000-000000000009', 80, 'KLO-CAM-001', false, NOW()),
  
  -- Corps Products  
  ('a7000000-0000-0000-0000-000000000007', 'CeraVe Lait Hydratant', 'cerave-lait-hydratant', 'Lait hydratant pour corps et visage', 'Hydratation longue durée', 2500, 3500, 29, true, 'c3200000-0000-0000-0000-000000000032', 'b6000000-0000-0000-0000-000000000006', 70, 'CRV-LAT-001', true, NOW()),
  ('a8000000-0000-0000-0000-000000000008', 'Nuxe Huile Prodigieuse', 'nuxe-huile-prodigieuse', 'Huile sèche multi-fonctions visage, corps et cheveux', 'Nourrit, répare et sublime', 3800, 5200, 27, true, 'c3200000-0000-0000-0000-000000000032', 'b7000000-0000-0000-0000-000000000007', 40, 'NXE-HUL-001', true, NOW()),
  
  -- Maman et Bébé Products
  ('a9000000-0000-0000-0000-000000000009', 'Mustela Eau Nettoyante', 'mustela-eau-nettoyante', 'Eau nettoyante sans rinçage pour bébé', 'Nettoie en douceur', 1900, 2600, 27, true, 'c5100000-0000-0000-0000-000000000051', 'b8000000-0000-0000-0000-000000000008', 90, 'MST-EAU-001', false, NOW()),
  ('aa000000-0000-0000-0000-00000000000a', 'Mustela Hydra Bébé Crème', 'mustela-hydra-bebe', 'Crème hydratante pour le visage de bébé', 'Hydrate et protège', 2100, 2900, 28, true, 'c5200000-0000-0000-0000-000000000052', 'b8000000-0000-0000-0000-000000000008', 65, 'MST-HYD-001', false, NOW()),
  
  -- Protection Solaire
  ('ab000000-0000-0000-0000-00000000000b', 'La Roche-Posay Anthelios SPF50+', 'anthelios-spf50-plus', 'Crème solaire très haute protection', 'Protection optimale UVA/UVB', 3500, 4800, 27, true, 'c1400000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000001', 55, 'LRP-ANT-001', true, NOW()),
  ('ac000000-0000-0000-0000-00000000000c', 'Uriage Bariésun Crème SPF50+', 'uriage-bariesun-spf50', 'Crème solaire haute protection peaux sensibles', 'Texture légère et invisible', 2800, 3900, 28, true, 'c1400000-0000-0000-0000-000000000014', 'be000000-0000-0000-0000-00000000000e', 48, 'URG-BAR-001', false, NOW());

-- تم! البيانات النظيفة جاهزة
-- Done! Clean data is ready
