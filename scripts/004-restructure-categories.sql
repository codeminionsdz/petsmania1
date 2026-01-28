-- RESTRUCTURE CATEGORIES: French Parapharmacy Structure
-- This migration replaces all generic categories with the real parapharmacy hierarchy

-- First, remove all existing products' category associations (we'll reassign them later)
UPDATE products SET category_id = NULL;

-- Delete all existing categories
DELETE FROM categories;

-- ===========================================
-- MAIN CATEGORIES (LEVEL 1)
-- ===========================================

-- 1. Visage
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count)
VALUES ('a1000000-0000-0000-0000-000000000001', 'Visage', 'visage', 'Soins du visage, nettoyants, hydratants et traitements spécifiques', '/placeholder.svg?height=400&width=600', NULL, 0);

-- 2. Cheveux
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count)
VALUES ('a2000000-0000-0000-0000-000000000001', 'Cheveux', 'cheveux', 'Shampoings, soins capillaires et traitements pour tous types de cheveux', '/placeholder.svg?height=400&width=600', NULL, 0);

-- 3. Corps
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count)
VALUES ('a3000000-0000-0000-0000-000000000001', 'Corps', 'corps', 'Soins hydratants, gommages et traitements pour le corps', '/placeholder.svg?height=400&width=600', NULL, 0);

-- 4. Mains et Pieds
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count)
VALUES ('a4000000-0000-0000-0000-000000000001', 'Mains et Pieds', 'mains-et-pieds', 'Soins des mains, pieds, ongles et orthèses', '/placeholder.svg?height=400&width=600', NULL, 0);

-- 5. Maman et Bébé
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count)
VALUES ('a5000000-0000-0000-0000-000000000001', 'Maman et Bébé', 'maman-et-bebe', 'Produits pour mamans et soins bébé', '/placeholder.svg?height=400&width=600', NULL, 0);

-- 6. Santé
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count)
VALUES ('a6000000-0000-0000-0000-000000000001', 'Santé', 'sante', 'Compléments alimentaires, vitamines et bien-être', '/placeholder.svg?height=400&width=600', NULL, 0);

-- 7. Matériel Médical
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count)
VALUES ('a7000000-0000-0000-0000-000000000001', 'Matériel Médical', 'materiel-medical', 'Thermomètres, tensiomètres et équipements médicaux', '/placeholder.svg?height=400&width=600', NULL, 0);

-- 8. Orthopédie
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count)
VALUES ('a8000000-0000-0000-0000-000000000001', 'Orthopédie', 'orthopedie', 'Attelles, orthèses, ceintures et supports orthopédiques', '/placeholder.svg?height=400&width=600', NULL, 0);

-- ===========================================
-- SUB-CATEGORIES (LEVEL 2)
-- ===========================================

-- Visage Sub-categories
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count) VALUES
('b1010000-0000-0000-0000-000000000001', 'Nettoyants', 'nettoyants', 'Gels, mousses et eaux micellaires nettoyantes', '/placeholder.svg?height=400&width=600', 'a1000000-0000-0000-0000-000000000001', 0),
('b1020000-0000-0000-0000-000000000001', 'Hydratants', 'hydratants', 'Crèmes et lotions hydratantes visage', '/placeholder.svg?height=400&width=600', 'a1000000-0000-0000-0000-000000000001', 0),
('b1030000-0000-0000-0000-000000000001', 'Sérums', 'serums', 'Sérums concentrés pour soins ciblés', '/placeholder.svg?height=400&width=600', 'a1000000-0000-0000-0000-000000000001', 0),
('b1040000-0000-0000-0000-000000000001', 'Masques', 'masques', 'Masques visage hydratants et purifiants', '/placeholder.svg?height=400&width=600', 'a1000000-0000-0000-0000-000000000001', 0),
('b1050000-0000-0000-0000-000000000001', 'Contour des yeux', 'contour-des-yeux', 'Soins anti-cernes et anti-poches', '/placeholder.svg?height=400&width=600', 'a1000000-0000-0000-0000-000000000001', 0),
('b1060000-0000-0000-0000-000000000001', 'Protection solaire', 'protection-solaire-visage', 'Écrans solaires et protections UV visage', '/placeholder.svg?height=400&width=600', 'a1000000-0000-0000-0000-000000000001', 0),
('b1070000-0000-0000-0000-000000000001', 'Anti-imperfections', 'anti-imperfections', 'Traitements anti-acné et imperfections', '/placeholder.svg?height=400&width=600', 'a1000000-0000-0000-0000-000000000001', 0),
('b1080000-0000-0000-0000-000000000001', 'Anti-tâches', 'anti-taches', 'Soins éclaircissants et anti-tâches', '/placeholder.svg?height=400&width=600', 'a1000000-0000-0000-0000-000000000001', 0),
('b1090000-0000-0000-0000-000000000001', 'Anti-rougeurs', 'anti-rougeurs', 'Soins apaisants pour peaux sensibles', '/placeholder.svg?height=400&width=600', 'a1000000-0000-0000-0000-000000000001', 0);

-- Cheveux Sub-categories
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count) VALUES
('b2010000-0000-0000-0000-000000000001', 'Shampoings', 'shampoings', 'Shampoings pour tous types de cheveux', '/placeholder.svg?height=400&width=600', 'a2000000-0000-0000-0000-000000000001', 0),
('b2020000-0000-0000-0000-000000000001', 'Après-shampoings', 'apres-shampoings', 'Conditionneurs et démêlants', '/placeholder.svg?height=400&width=600', 'a2000000-0000-0000-0000-000000000001', 0),
('b2030000-0000-0000-0000-000000000001', 'Soins réparateurs', 'soins-reparateurs', 'Masques et traitements réparateurs', '/placeholder.svg?height=400&width=600', 'a2000000-0000-0000-0000-000000000001', 0),
('b2040000-0000-0000-0000-000000000001', 'Anti-chute', 'anti-chute', 'Traitements contre la chute de cheveux', '/placeholder.svg?height=400&width=600', 'a2000000-0000-0000-0000-000000000001', 0),
('b2050000-0000-0000-0000-000000000001', 'Pellicules', 'pellicules', 'Shampoings et soins antipelliculaires', '/placeholder.svg?height=400&width=600', 'a2000000-0000-0000-0000-000000000001', 0),
('b2060000-0000-0000-0000-000000000001', 'Dermite séborrhéique', 'dermite-seborrheique', 'Traitements pour dermite séborrhéique', '/placeholder.svg?height=400&width=600', 'a2000000-0000-0000-0000-000000000001', 0),
('b2070000-0000-0000-0000-000000000001', 'Démangeaisons cuir chevelu', 'demangeaisons-cuir-chevelu', 'Soins apaisants pour cuir chevelu irrité', '/placeholder.svg?height=400&width=600', 'a2000000-0000-0000-0000-000000000001', 0);

-- Corps Sub-categories
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count) VALUES
('b3010000-0000-0000-0000-000000000001', 'Gommages corps', 'gommages-corps', 'Exfoliants et gommages corporels', '/placeholder.svg?height=400&width=600', 'a3000000-0000-0000-0000-000000000001', 0),
('b3020000-0000-0000-0000-000000000001', 'Soins hydratants corps', 'soins-hydratants-corps', 'Laits et crèmes hydratants corps', '/placeholder.svg?height=400&width=600', 'a3000000-0000-0000-0000-000000000001', 0),
('b3030000-0000-0000-0000-000000000001', 'Anti-vergetures', 'anti-vergetures', 'Crèmes et huiles anti-vergetures', '/placeholder.svg?height=400&width=600', 'a3000000-0000-0000-0000-000000000001', 0),
('b3040000-0000-0000-0000-000000000001', 'Anti-acné corps', 'anti-acne-corps', 'Traitements acné dos et corps', '/placeholder.svg?height=400&width=600', 'a3000000-0000-0000-0000-000000000001', 0),
('b3050000-0000-0000-0000-000000000001', 'Hygiène du corps', 'hygiene-du-corps', 'Gels douche et savons', '/placeholder.svg?height=400&width=600', 'a3000000-0000-0000-0000-000000000001', 0);

-- Mains et Pieds Sub-categories
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count) VALUES
('b4010000-0000-0000-0000-000000000001', 'Soins des mains', 'soins-des-mains', 'Crèmes et soins pour les mains', '/placeholder.svg?height=400&width=600', 'a4000000-0000-0000-0000-000000000001', 0),
('b4020000-0000-0000-0000-000000000001', 'Soins des pieds', 'soins-des-pieds', 'Crèmes et soins pour les pieds', '/placeholder.svg?height=400&width=600', 'a4000000-0000-0000-0000-000000000001', 0),
('b4030000-0000-0000-0000-000000000001', 'Ongles', 'ongles', 'Soins fortifiants pour ongles', '/placeholder.svg?height=400&width=600', 'a4000000-0000-0000-0000-000000000001', 0),
('b4040000-0000-0000-0000-000000000001', 'Cors et mycoses', 'cors-et-mycoses', 'Traitements cors, durillons et mycoses', '/placeholder.svg?height=400&width=600', 'a4000000-0000-0000-0000-000000000001', 0),
('b4050000-0000-0000-0000-000000000001', 'Semelles', 'semelles', 'Semelles orthopédiques et confort', '/placeholder.svg?height=400&width=600', 'a4000000-0000-0000-0000-000000000001', 0),
('b4060000-0000-0000-0000-000000000001', 'Orthèses pieds', 'ortheses-pieds', 'Orthèses et correcteurs pour pieds', '/placeholder.svg?height=400&width=600', 'a4000000-0000-0000-0000-000000000001', 0);

-- Maman et Bébé Sub-categories
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count) VALUES
('b5010000-0000-0000-0000-000000000001', 'Hydratation bébé', 'hydratation-bebe', 'Crèmes et laits hydratants bébé', '/placeholder.svg?height=400&width=600', 'a5000000-0000-0000-0000-000000000001', 0),
('b5020000-0000-0000-0000-000000000001', 'Coliques bébé', 'coliques-bebe', 'Solutions contre les coliques', '/placeholder.svg?height=400&width=600', 'a5000000-0000-0000-0000-000000000001', 0),
('b5030000-0000-0000-0000-000000000001', 'Soins irritations bébé', 'soins-irritations-bebe', 'Crèmes pour érythème fessier', '/placeholder.svg?height=400&width=600', 'a5000000-0000-0000-0000-000000000001', 0),
('b5040000-0000-0000-0000-000000000001', 'Shampoings bébé', 'shampoings-bebe', 'Shampoings doux pour bébé', '/placeholder.svg?height=400&width=600', 'a5000000-0000-0000-0000-000000000001', 0),
('b5050000-0000-0000-0000-000000000001', 'Eaux de cologne bébé', 'eaux-de-cologne-bebe', 'Eaux de toilette douces bébé', '/placeholder.svg?height=400&width=600', 'a5000000-0000-0000-0000-000000000001', 0),
('b5060000-0000-0000-0000-000000000001', 'Parfum bébé', 'parfum-bebe', 'Parfums délicats pour bébé', '/placeholder.svg?height=400&width=600', 'a5000000-0000-0000-0000-000000000001', 0),
('b5070000-0000-0000-0000-000000000001', 'Protection solaire bébé', 'protection-solaire-bebe', 'Écrans solaires spécial bébé', '/placeholder.svg?height=400&width=600', 'a5000000-0000-0000-0000-000000000001', 0);

-- Santé Sub-categories
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count) VALUES
('b6010000-0000-0000-0000-000000000001', 'Digestion et transit', 'digestion-et-transit', 'Probiotiques et aide digestive', '/placeholder.svg?height=400&width=600', 'a6000000-0000-0000-0000-000000000001', 0),
('b6020000-0000-0000-0000-000000000001', 'Sommeil et stress', 'sommeil-et-stress', 'Compléments relaxants et sommeil', '/placeholder.svg?height=400&width=600', 'a6000000-0000-0000-0000-000000000001', 0),
('b6030000-0000-0000-0000-000000000001', 'Vitalité et immunité', 'vitalite-et-immunite', 'Vitamines et toniques', '/placeholder.svg?height=400&width=600', 'a6000000-0000-0000-0000-000000000001', 0),
('b6040000-0000-0000-0000-000000000001', 'Défenses immunitaires', 'defenses-immunitaires', 'Renforcement du système immunitaire', '/placeholder.svg?height=400&width=600', 'a6000000-0000-0000-0000-000000000001', 0),
('b6050000-0000-0000-0000-000000000001', 'Compléments alimentaires', 'complements-alimentaires', 'Compléments nutritionnels divers', '/placeholder.svg?height=400&width=600', 'a6000000-0000-0000-0000-000000000001', 0);

-- Matériel Médical Sub-categories
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count) VALUES
('b7010000-0000-0000-0000-000000000001', 'Thermomètres', 'thermometres', 'Thermomètres digitaux et infrarouges', '/placeholder.svg?height=400&width=600', 'a7000000-0000-0000-0000-000000000001', 0),
('b7020000-0000-0000-0000-000000000001', 'Tensiomètres', 'tensiometres', 'Tensiomètres bras et poignet', '/placeholder.svg?height=400&width=600', 'a7000000-0000-0000-0000-000000000001', 0),
('b7030000-0000-0000-0000-000000000001', 'Oxymètres de pouls', 'oxymetres-de-pouls', 'Saturomètres et oxymètres', '/placeholder.svg?height=400&width=600', 'a7000000-0000-0000-0000-000000000001', 0);

-- Orthopédie Sub-categories
INSERT INTO categories (id, name, slug, description, image, parent_id, product_count) VALUES
('b8010000-0000-0000-0000-000000000001', 'Attelles', 'attelles', 'Attelles pour poignet, cheville, etc.', '/placeholder.svg?height=400&width=600', 'a8000000-0000-0000-0000-000000000001', 0),
('b8020000-0000-0000-0000-000000000001', 'Orthèses', 'ortheses', 'Orthèses diverses', '/placeholder.svg?height=400&width=600', 'a8000000-0000-0000-0000-000000000001', 0),
('b8030000-0000-0000-0000-000000000001', 'Ceintures lombaires', 'ceintures-lombaires', 'Ceintures de soutien lombaire', '/placeholder.svg?height=400&width=600', 'a8000000-0000-0000-0000-000000000001', 0),
('b8040000-0000-0000-0000-000000000001', 'Genouillères', 'genouillieres', 'Genouillères de maintien et sport', '/placeholder.svg?height=400&width=600', 'a8000000-0000-0000-0000-000000000001', 0),
('b8050000-0000-0000-0000-000000000001', 'Coudières', 'coudieres', 'Coudières de protection', '/placeholder.svg?height=400&width=600', 'a8000000-0000-0000-0000-000000000001', 0),
('b8060000-0000-0000-0000-000000000001', 'Épaulières', 'epaulieres', 'Supports et épaulières', '/placeholder.svg?height=400&width=600', 'a8000000-0000-0000-0000-000000000001', 0);
