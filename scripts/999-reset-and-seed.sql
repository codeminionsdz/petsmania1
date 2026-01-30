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
INSERT INTO categories (id, name, slug, description, animal_type, parent_id) VALUES
  -- DOG CATEGORIES (الكلاب)
  ('dcat-001', 'Alimentation Chien', 'alimentation-chien', 'Nourriture et suppléments pour chiens', 'dog', NULL),
  ('dcat-001-001', 'Croquettes', 'croquettes', 'Croquettes et aliments secs', 'dog', 'dcat-001'),
  ('dcat-001-002', 'Pâtées', 'patees', 'Pâtées et aliments humides', 'dog', 'dcat-001'),
  ('dcat-001-003', 'Friandises', 'friandises-chien', 'Friandises et récompenses', 'dog', 'dcat-001'),
  
  ('dcat-002', 'Hygiène Chien', 'hygiene-chien', 'Produits de nettoyage et d''hygiène', 'dog', NULL),
  ('dcat-002-001', 'Shampooings', 'shampooings-chien', 'Shampooings et nettoyants', 'dog', 'dcat-002'),
  ('dcat-002-002', 'Brosses et Peignes', 'brosses-chien', 'Outils de toilettage', 'dog', 'dcat-002'),
  ('dcat-002-003', 'Nettoyage Dentaire', 'hygiene-dentaire-chien', 'Produits pour l''hygiène dentaire', 'dog', 'dcat-002'),
  
  ('dcat-003', 'Santé Chien', 'sante-chien', 'Soins de santé et compléments', 'dog', NULL),
  ('dcat-003-001', 'Vitamines et Suppléments', 'vitamines-chien', 'Suppléments nutritionnels', 'dog', 'dcat-003'),
  ('dcat-003-002', 'Anti-Parasitaires', 'antiparasitaires-chien', 'Traitements antiparasitaires', 'dog', 'dcat-003'),
  ('dcat-003-003', 'Articulations et Mobilité', 'articulations-chien', 'Produits pour articulations', 'dog', 'dcat-003'),
  
  ('dcat-004', 'Accessoires Chien', 'accessoires-chien', 'Colliers, laisses et accessoires', 'dog', NULL),
  ('dcat-004-001', 'Colliers et Laisses', 'colliers-laisses', 'Colliers, laisses et harnais', 'dog', 'dcat-004'),
  ('dcat-004-002', 'Jouets', 'jouets-chien', 'Jouets et jeux', 'dog', 'dcat-004'),
  ('dcat-004-003', 'Literie', 'literie-chien', 'Lits et coussinets', 'dog', 'dcat-004'),
  
  -- CAT CATEGORIES (القطط)
  ('ccat-001', 'Alimentation Chat', 'alimentation-chat', 'Nourriture et suppléments pour chats', 'cat', NULL),
  ('ccat-001-001', 'Croquettes', 'croquettes-chat', 'Croquettes et aliments secs', 'cat', 'ccat-001'),
  ('ccat-001-002', 'Pâtées', 'patees-chat', 'Pâtées et aliments humides', 'cat', 'ccat-001'),
  ('ccat-001-003', 'Friandises', 'friandises-chat', 'Friandises et récompenses', 'cat', 'ccat-001'),
  
  ('ccat-002', 'Hygiène Chat', 'hygiene-chat', 'Produits de nettoyage et d''hygiène', 'cat', NULL),
  ('ccat-002-001', 'Shampooings', 'shampooings-chat', 'Shampooings et nettoyants', 'cat', 'ccat-002'),
  ('ccat-002-002', 'Brosses et Peignes', 'brosses-chat', 'Outils de toilettage', 'cat', 'ccat-002'),
  ('ccat-002-003', 'Litière et Nettoyage', 'litiere-chat', 'Litière et produits de nettoyage', 'cat', 'ccat-002'),
  
  ('ccat-003', 'Santé Chat', 'sante-chat', 'Soins de santé et compléments', 'cat', NULL),
  ('ccat-003-001', 'Vitamines et Suppléments', 'vitamines-chat', 'Suppléments nutritionnels', 'cat', 'ccat-003'),
  ('ccat-003-002', 'Anti-Parasitaires', 'antiparasitaires-chat', 'Traitements antiparasitaires', 'cat', 'ccat-003'),
  ('ccat-003-003', 'Articulations et Mobilité', 'articulations-chat', 'Produits pour articulations', 'cat', 'ccat-003'),
  
  ('ccat-004', 'Accessoires Chat', 'accessoires-chat', 'Jouets, griffoirs et accessoires', 'cat', NULL),
  ('ccat-004-001', 'Griffoirs', 'griffoirs-chat', 'Griffoirs et griffades', 'cat', 'ccat-004'),
  ('ccat-004-002', 'Jouets', 'jouets-chat', 'Jouets et jeux interactifs', 'cat', 'ccat-004'),
  ('ccat-004-003', 'Mobilier', 'mobilier-chat', 'Arbres à chats et mobilier', 'cat', 'ccat-004'),
  
  -- BIRD CATEGORIES (الطيور)
  ('bcat-001', 'Alimentation Oiseau', 'alimentation-oiseau', 'Nourriture et graines pour oiseaux', 'bird', NULL),
  ('bcat-001-001', 'Graines', 'graines-oiseau', 'Mélanges de graines', 'bird', 'bcat-001'),
  ('bcat-001-002', 'Fruits et Légumes', 'fruits-legumes-oiseau', 'Fruits et légumes frais', 'bird', 'bcat-001'),
  ('bcat-001-003', 'Suppléments', 'supplements-oiseau', 'Suppléments nutritionnels', 'bird', 'bcat-001'),
  
  ('bcat-002', 'Hygiène Oiseau', 'hygiene-oiseau', 'Produits de nettoyage et d''hygiène', 'bird', NULL),
  ('bcat-002-001', 'Nettoyage Cage', 'nettoyage-cage', 'Produits de nettoyage', 'bird', 'bcat-002'),
  ('bcat-002-002', 'Bains', 'bains-oiseau', 'Accessoires de bain', 'bird', 'bcat-002'),
  
  ('bcat-003', 'Santé Oiseau', 'sante-oiseau', 'Soins de santé et compléments', 'bird', NULL),
  ('bcat-003-001', 'Vitamines', 'vitamines-oiseau', 'Suppléments vitaminés', 'bird', 'bcat-003'),
  ('bcat-003-002', 'Anti-Parasitaires', 'antiparasitaires-oiseau', 'Traitements antiparasitaires', 'bird', 'bcat-003'),
  
  ('bcat-004', 'Accessoires Oiseau', 'accessoires-oiseau', 'Cages et accessoires', 'bird', NULL),
  ('bcat-004-001', 'Cages', 'cages-oiseau', 'Cages et volières', 'bird', 'bcat-004'),
  ('bcat-004-002', 'Perchoirs et Jouets', 'perchoirs-jouets', 'Perchoirs et jouets', 'bird', 'bcat-004'),
  
  -- UNIVERSAL CATEGORIES (متعدد الحيوانات)
  ('ucat-001', 'Santé Générale', 'sante-generale', 'Produits de santé pour tous', 'universal', NULL),
  ('ucat-001-001', 'Thermomètres', 'thermometres', 'Thermomètres vétérinaires', 'universal', 'ucat-001'),
  ('ucat-001-002', 'Pansements', 'pansements', 'Pansements et bandages', 'universal', 'ucat-001'),
  
  ('ucat-002', 'Équipement Médical', 'equipement-medical', 'Équipement médical général', 'universal', NULL);

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
  -- Dog Products
  ('a1000000-0000-0000-0000-000000000001', 'Croquettes Premium Chien', 'croquettes-premium-chien', 'Croquettes haute gamme pour chiens adultes', 'Nutrition complète équilibrée', 4500, 6000, 25, true, 'dcat-001-001', 'b1000000-0000-0000-0000-000000000001', 50, 'DOG-CRQ-001', true, NOW()),
  ('a2000000-0000-0000-0000-000000000002', 'Shampooing Doux Chien', 'shampooing-doux-chien', 'Shampooing hypoallergénique pour chiens', 'Nettoie en douceur', 2200, 3000, 27, true, 'dcat-002-001', 'b2000000-0000-0000-0000-000000000002', 40, 'DOG-SHP-001', true, NOW()),
  ('a3000000-0000-0000-0000-000000000003', 'Vitamines Articulations Chien', 'vitamines-articulations-chien', 'Suppléments pour articulations saines', 'Mobilité et flexibilité', 3200, 4500, 29, true, 'dcat-003-003', 'b3000000-0000-0000-0000-000000000003', 35, 'DOG-VIT-001', false, NOW()),
  ('a4000000-0000-0000-0000-000000000004', 'Collier Ajustable Chien', 'collier-ajustable-chien', 'Collier confortable et durable', 'Ajustable de 30 à 50cm', 1800, 2500, 28, true, 'dcat-004-001', 'b4000000-0000-0000-0000-000000000004', 60, 'DOG-COL-001', false, NOW()),
  
  -- Cat Products
  ('a5000000-0000-0000-0000-000000000005', 'Croquettes Chat Premium', 'croquettes-chat-premium', 'Croquettes spécialement formulées pour chats', 'Saveur poisson et poulet', 3800, 5000, 24, true, 'ccat-001-001', 'b5000000-0000-0000-0000-000000000005', 55, 'CAT-CRQ-001', true, NOW()),
  ('a6000000-0000-0000-0000-000000000006', 'Shampooing Chat Doux', 'shampooing-chat-doux', 'Shampooing très doux pour pelage chat', 'Sans agressivité', 1900, 2600, 27, true, 'ccat-002-001', 'b6000000-0000-0000-0000-000000000006', 45, 'CAT-SHP-001', false, NOW()),
  ('a7000000-0000-0000-0000-000000000007', 'Griffoir Chat Sisal', 'griffoir-chat-sisal', 'Griffoir haute qualité en sisal', 'Satisfaction garantie', 2500, 3500, 29, true, 'ccat-004-001', 'b7000000-0000-0000-0000-000000000007', 30, 'CAT-GRF-001', true, NOW()),
  ('a8000000-0000-0000-0000-000000000008', 'Arbre à Chat Moderne', 'arbre-chat-moderne', 'Arbre à chat avec plateformes multiples', 'Espace de jeu et repos', 5200, 7000, 26, true, 'ccat-004-003', 'b8000000-0000-0000-0000-000000000008', 20, 'CAT-ARB-001', false, NOW()),
  
  -- Bird Products
  ('a9000000-0000-0000-0000-000000000009', 'Graines Mélange Oiseau', 'graines-melange-oiseau', 'Mélange complet de graines pour oiseaux', 'Nutrition équilibrée', 1600, 2200, 27, true, 'bcat-001-001', 'b9000000-0000-0000-0000-000000000009', 80, 'BRD-GRN-001', false, NOW()),
  ('aa000000-0000-0000-0000-00000000000a', 'Fruits Secs Oiseau', 'fruits-secs-oiseau', 'Fruits et légumes séchés pour oiseaux', 'Snack sain naturel', 1400, 1900, 26, true, 'bcat-001-002', 'ba000000-0000-0000-0000-00000000000a', 50, 'BRD-FRT-001', false, NOW()),
  ('ab000000-0000-0000-0000-00000000000b', 'Cage Volière Spacieuse', 'cage-voliere-spacieuse', 'Grande cage pour oiseaux multiespèces', 'Espace généreux', 8500, 12000, 29, true, 'bcat-004-001', 'bb000000-0000-0000-0000-00000000000b', 15, 'BRD-CAG-001', true, NOW()),
  ('ac000000-0000-0000-0000-00000000000c', 'Perchoirs Naturels', 'perchoirs-naturels', 'Ensemble de perchoirs naturels variés', 'Confortable et hygiénique', 2100, 2900, 28, true, 'bcat-004-002', 'bc000000-0000-0000-0000-00000000000c', 40, 'BRD-PCH-001', false, NOW()),
  
  -- Universal Products
  ('ad000000-0000-0000-0000-00000000000d', 'Thermomètre Vétérinaire Digital', 'thermometre-digital-vet', 'Thermomètre vétérinaire précis et rapide', 'Lecture en 10 secondes', 2800, 3900, 28, true, 'ucat-001-001', 'bd000000-0000-0000-0000-00000000000d', 70, 'UNI-THM-001', false, NOW()),
  ('ae000000-0000-0000-0000-00000000000e', 'Kit Pansements Vétérinaires', 'kit-pansements-vet', 'Kit complet de pansements et bandages', 'Protection et hygiène', 1500, 2000, 25, true, 'ucat-001-002', 'be000000-0000-0000-0000-00000000000e', 100, 'UNI-BND-001', false, NOW());

-- تم! البيانات النظيفة جاهزة
-- Done! Clean data is ready
