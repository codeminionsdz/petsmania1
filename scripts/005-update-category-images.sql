-- Update category images with unique generated images
-- Main Categories
UPDATE categories SET image = '/images/categories/visage.jpg' WHERE slug = 'visage';
UPDATE categories SET image = '/images/categories/cheveux.jpg' WHERE slug = 'cheveux';
UPDATE categories SET image = '/images/categories/corps.jpg' WHERE slug = 'corps';
UPDATE categories SET image = '/images/categories/mains-pieds.jpg' WHERE slug = 'mains-et-pieds';
UPDATE categories SET image = '/images/categories/hygiene.jpg' WHERE slug = 'hygiene';
UPDATE categories SET image = '/images/categories/maman-bebe.jpg' WHERE slug = 'maman-et-bebe';
UPDATE categories SET image = '/images/categories/sante-bien-etre.jpg' WHERE slug = 'sante-et-bien-etre';
UPDATE categories SET image = '/images/categories/solaires.jpg' WHERE slug = 'solaires';
UPDATE categories SET image = '/images/categories/materiel-medical.jpg' WHERE slug = 'materiel-medical';
UPDATE categories SET image = '/images/categories/orthopedie.jpg' WHERE slug = 'orthopedie';

-- Subcategories - Visage
UPDATE categories SET image = '/images/subcategories/anti-age.jpg' WHERE slug = 'anti-age';
UPDATE categories SET image = '/images/subcategories/serums.jpg' WHERE slug = 'serums';
UPDATE categories SET image = '/images/subcategories/cremes-hydratantes.jpg' WHERE slug = 'cremes-hydratantes';
UPDATE categories SET image = '/images/subcategories/nettoyants.jpg' WHERE slug = 'nettoyants-visage';
UPDATE categories SET image = '/images/subcategories/masques.jpg' WHERE slug = 'masques';
UPDATE categories SET image = '/images/subcategories/contour-yeux.jpg' WHERE slug = 'contour-des-yeux';

-- Subcategories - Cheveux
UPDATE categories SET image = '/images/subcategories/anti-chute.jpg' WHERE slug = 'anti-chute';
UPDATE categories SET image = '/images/subcategories/apres-shampoings.jpg' WHERE slug = 'apres-shampoings';
UPDATE categories SET image = '/images/subcategories/demangeaisons.jpg' WHERE slug = 'demangeaisons-cuir-chevelu';
UPDATE categories SET image = '/images/subcategories/dermite.jpg' WHERE slug = 'dermite-seborrheique';
UPDATE categories SET image = '/images/subcategories/pellicules.jpg' WHERE slug = 'pellicules';
UPDATE categories SET image = '/images/subcategories/shampoings.jpg' WHERE slug = 'shampoings';
UPDATE categories SET image = '/images/subcategories/soins-reparateurs.jpg' WHERE slug = 'soins-reparateurs';

-- Subcategories - Corps
UPDATE categories SET image = '/images/subcategories/anti-vergetures.jpg' WHERE slug = 'anti-vergetures';
UPDATE categories SET image = '/images/subcategories/gommages.jpg' WHERE slug = 'gommages-corps';
UPDATE categories SET image = '/images/subcategories/hydratation-corps.jpg' WHERE slug = 'hydratation-corps';
UPDATE categories SET image = '/images/subcategories/huiles-corps.jpg' WHERE slug = 'huiles-corps';
UPDATE categories SET image = '/images/subcategories/soins-minceur.jpg' WHERE slug = 'soins-minceur';

-- Subcategories - Mains et Pieds
UPDATE categories SET image = '/images/subcategories/cremes-mains.jpg' WHERE slug = 'cremes-mains';
UPDATE categories SET image = '/images/subcategories/soins-pieds.jpg' WHERE slug = 'soins-pieds';
UPDATE categories SET image = '/images/subcategories/soins-ongles.jpg' WHERE slug = 'soins-ongles';

-- Subcategories - Hygiène
UPDATE categories SET image = '/images/subcategories/anti-transpirants.jpg' WHERE slug = 'anti-transpirants';
UPDATE categories SET image = '/images/subcategories/gels-douche.jpg' WHERE slug = 'gels-douche';
UPDATE categories SET image = '/images/subcategories/hygiene-intime.jpg' WHERE slug = 'hygiene-intime';
UPDATE categories SET image = '/images/subcategories/hygiene-bucco.jpg' WHERE slug = 'hygiene-bucco-dentaire';
UPDATE categories SET image = '/images/subcategories/savons.jpg' WHERE slug = 'savons';

-- Subcategories - Maman et Bébé
UPDATE categories SET image = '/images/subcategories/change-bebe.jpg' WHERE slug = 'change-bebe';
UPDATE categories SET image = '/images/subcategories/toilette-bebe.jpg' WHERE slug = 'toilette-bebe';
UPDATE categories SET image = '/images/subcategories/soins-bebe.jpg' WHERE slug = 'soins-bebe';
UPDATE categories SET image = '/images/subcategories/allaitement.jpg' WHERE slug = 'allaitement';
UPDATE categories SET image = '/images/subcategories/grossesse.jpg' WHERE slug = 'grossesse';

-- Subcategories - Santé et Bien-être
UPDATE categories SET image = '/images/subcategories/vitamines.jpg' WHERE slug = 'vitamines';
UPDATE categories SET image = '/images/subcategories/complements.jpg' WHERE slug = 'complements-alimentaires';
UPDATE categories SET image = '/images/subcategories/digestion.jpg' WHERE slug = 'digestion';
UPDATE categories SET image = '/images/subcategories/sommeil-stress.jpg' WHERE slug = 'sommeil-stress';
UPDATE categories SET image = '/images/subcategories/immunite.jpg' WHERE slug = 'immunite';

-- Subcategories - Solaires
UPDATE categories SET image = '/images/subcategories/protection-solaire.jpg' WHERE slug = 'protection-solaire';
UPDATE categories SET image = '/images/subcategories/autobronzants.jpg' WHERE slug = 'autobronzants';
UPDATE categories SET image = '/images/subcategories/apres-soleil.jpg' WHERE slug = 'apres-soleil';

-- Subcategories - Matériel Médical
UPDATE categories SET image = '/images/subcategories/premiers-soins.jpg' WHERE slug = 'premiers-soins';
UPDATE categories SET image = '/images/subcategories/tensiometres.jpg' WHERE slug = 'tensiometres';
UPDATE categories SET image = '/images/subcategories/thermometres.jpg' WHERE slug = 'thermometres';

-- Subcategories - Orthopédie
UPDATE categories SET image = '/images/subcategories/genouilleres.jpg' WHERE slug = 'genouilleres';
UPDATE categories SET image = '/images/subcategories/chevilleres.jpg' WHERE slug = 'chevilleres';
UPDATE categories SET image = '/images/subcategories/ceintures-lombaires.jpg' WHERE slug = 'ceintures-lombaires';
UPDATE categories SET image = '/images/subcategories/semelles.jpg' WHERE slug = 'semelles-orthopediques';
UPDATE categories SET image = '/images/subcategories/bas-contention.jpg' WHERE slug = 'bas-de-contention';
UPDATE categories SET image = '/images/subcategories/attelles.jpg' WHERE slug = 'attelles';
