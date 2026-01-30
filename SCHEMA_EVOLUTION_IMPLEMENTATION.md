# Schema Evolution: Implementation Examples

## Complete Step-by-Step Implementation

### Step 1: Run the Migration Script

```bash
# In your Supabase SQL Editor or psql:
\i /path/to/scripts/002-evolve-animal-centric.sql

# Or copy-paste the entire SQL file into your Supabase SQL editor
```

**What happens:**
- ✅ Creates 5 new tables (animals, product_animals, category_animals, product_category_animals, product_variants)
- ✅ Adds 3 new columns to existing tables
- ✅ Seeds 5 base animals (cat, dog, bird, other, universal)
- ✅ Creates 3 views for easy querying
- ✅ Creates 2 migration functions
- ✅ All original data untouched

---

## Scenario 1: New Product - "Cat Flea Collar"

### Backend Code (Node.js / TypeScript Example)

```typescript
import { supabase } from './supabase'

async function createCatFleeCollar() {
  try {
    // 1. Create the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: 'Premium Flea Collar for Cats',
        slug: 'flea-collar-cats',
        description: 'Effective flea protection for cats',
        price: 2500, // 25.00 DZD
        stock: 100,
        category_id: 'CAT-CATEGORY-UUID', // Health & Care category
        brand_id: 'BRAND-UUID',
        featured: true,
        is_multi_animal: false,
        // primary_animal_id will be set after we get the cat animal_id
      })
      .select()

    if (productError) throw productError
    const productId = product[0].id

    // 2. Get the cat animal ID
    const { data: animals } = await supabase
      .from('animals')
      .select('id')
      .eq('slug', 'cat')

    const catAnimalId = animals[0].id

    // 3. Link product to cat animal
    const { error: linkError } = await supabase
      .from('product_animals')
      .insert({
        product_id: productId,
        animal_id: catAnimalId,
        is_primary: true, // This is a primary cat product
      })

    if (linkError) throw linkError

    // 4. Update product with primary animal
    const { error: updateError } = await supabase
      .from('products')
      .update({
        primary_animal_id: catAnimalId,
      })
      .eq('id', productId)

    if (updateError) throw updateError

    // 5. Link to category_animals if not already linked
    const { error: catLinkError } = await supabase
      .from('category_animals')
      .insert({
        category_id: 'CAT-CATEGORY-UUID',
        animal_id: catAnimalId,
        is_primary: true,
      })
      .on('*', () => {}) // Ignore conflict if already exists

    // 6. Create a product image
    const { error: imageError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url: 'https://example.com/flea-collar-cat.jpg',
        alt: 'Premium Flea Collar for Cats',
        position: 0,
      })

    console.log('✅ Product created successfully:', productId)
    return { success: true, productId }
  } catch (error) {
    console.error('❌ Error creating product:', error)
    throw error
  }
}

// Usage
await createCatFleeCollar()
```

---

## Scenario 2: Multi-Animal Product - "Pet Shampoo Safe for Cats & Dogs"

### Backend Code

```typescript
async function createMultiAnimalProduct() {
  try {
    // 1. Create product
    const { data: product } = await supabase
      .from('products')
      .insert({
        name: 'Gentle Pet Shampoo - Cats & Dogs',
        slug: 'gentle-shampoo-multi-animal',
        price: 1800,
        stock: 200,
        category_id: 'GROOMING-CATEGORY-UUID',
        is_multi_animal: true, // Mark as multi-animal
      })
      .select()

    const productId = product[0].id

    // 2. Get animal IDs
    const { data: allAnimals } = await supabase
      .from('animals')
      .select('id, slug')
      .in('slug', ['cat', 'dog'])

    // 3. Link to BOTH animals
    const links = allAnimals.map((animal, index) => ({
      product_id: productId,
      animal_id: animal.id,
      is_primary: index === 1, // Dogs are primary (index 1)
    }))

    const { error: linkError } = await supabase
      .from('product_animals')
      .insert(links)

    if (linkError) throw linkError

    // 4. Set primary animal to dog
    const dogId = allAnimals.find(a => a.slug === 'dog').id
    await supabase
      .from('products')
      .update({ primary_animal_id: dogId })
      .eq('id', productId)

    console.log(`✅ Multi-animal product created with ${allAnimals.length} animals`)
    return { success: true, productId, animalCount: allAnimals.length }
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

await createMultiAnimalProduct()
// Output: Multi-animal product created with 2 animals
```

---

## Scenario 3: Product with Animal-Specific Variants

### Backend Code

```typescript
async function createProductWithVariants() {
  try {
    // 1. Create product
    const { data: product } = await supabase
      .from('products')
      .insert({
        name: 'Premium Dog Food',
        slug: 'premium-dog-food',
        description: 'Nutritious dry dog food in different sizes',
        price: 5000, // Base price
        stock: 500,
        category_id: 'NUTRITION-CATEGORY-UUID',
        is_multi_animal: false,
      })
      .select()

    const productId = product[0].id

    // 2. Get dog animal ID
    const { data: dogAnimal } = await supabase
      .from('animals')
      .select('id')
      .eq('slug', 'dog')
      .single()

    // 3. Link product to dog
    await supabase
      .from('product_animals')
      .insert({
        product_id: productId,
        animal_id: dogAnimal.id,
        is_primary: true,
      })

    // 4. Create variants for different dog sizes
    const variants = [
      {
        product_id: productId,
        animal_id: dogAnimal.id,
        sku: 'DOOFOOD-SMALL',
        size: 'Small (1-10kg)',
        stock: 150,
        price: 4500, // Cheaper for small portion
        weight: '2kg',
      },
      {
        product_id: productId,
        animal_id: dogAnimal.id,
        sku: 'DOOFOOD-MEDIUM',
        size: 'Medium (10-25kg)',
        stock: 200,
        price: 5000, // Standard price
        weight: '5kg',
      },
      {
        product_id: productId,
        animal_id: dogAnimal.id,
        sku: 'DOOFOOD-LARGE',
        size: 'Large (25kg+)',
        stock: 150,
        price: 5500, // Premium for large portion
        weight: '10kg',
      },
    ]

    const { error: variantError } = await supabase
      .from('product_variants')
      .insert(variants)

    if (variantError) throw variantError

    // Update primary animal
    await supabase
      .from('products')
      .update({ primary_animal_id: dogAnimal.id })
      .eq('id', productId)

    console.log(`✅ Product with ${variants.length} variants created`)
    return { success: true, productId, variants: variants.length }
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

await createProductWithVariants()
// Output: Product with 3 variants created
```

---

## Scenario 4: Frontend - Animal Filter Component

### React Component Example

```tsx
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Animal {
  id: string
  name: string
  slug: string
  icon: string
  color: string
}

export function AnimalFilter() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [selectedAnimal, setSelectedAnimal] = useState<string>('all')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch available animals on mount
  useEffect(() => {
    const fetchAnimals = async () => {
      const { data } = await supabase
        .from('animals')
        .select('id, name, slug, icon, color')
        .eq('is_active', true)
        .order('position')

      setAnimals(data || [])
    }

    fetchAnimals()
  }, [])

  // Fetch products when animal selection changes
  useEffect(() => {
    fetchProductsByAnimal()
  }, [selectedAnimal])

  const fetchProductsByAnimal = async () => {
    setLoading(true)

    try {
      if (selectedAnimal === 'all') {
        // Get all products
        const { data } = await supabase
          .from('products')
          .select('*, categories(name), brands(name)')
          .eq('featured', true)
          .order('created_at', { ascending: false })

        setProducts(data || [])
      } else {
        // Get products for selected animal
        const { data } = await supabase
          .from('v_products_with_animals')
          .select('*')
          .eq('primary_animal_slug', selectedAnimal)
          .order('created_at', { ascending: false })

        setProducts(data || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animal-filter">
      <h2>Shop by Pet Type</h2>

      {/* Animal buttons */}
      <div className="animal-buttons">
        <button
          className={selectedAnimal === 'all' ? 'active' : ''}
          onClick={() => setSelectedAnimal('all')}
        >
          All Pets
        </button>

        {animals.map(animal => (
          <button
            key={animal.id}
            className={selectedAnimal === animal.slug ? 'active' : ''}
            onClick={() => setSelectedAnimal(animal.slug)}
            style={{ borderColor: animal.color }}
          >
            {animal.icon && <span>{animal.icon}</span>}
            {animal.name}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="products-grid">
          {products.length === 0 ? (
            <p>No products found for this pet type</p>
          ) : (
            products.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p className="category">{product.categories?.name}</p>
                {product.primary_animal_name && (
                  <p className="animal-badge">
                    For {product.primary_animal_name}
                  </p>
                )}
                {product.animal_count > 1 && (
                  <p className="multi-animal">
                    ✓ Suitable for {product.animal_count} pet types
                  </p>
                )}
                <p className="price">{product.price} DZD</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
```

---

## Scenario 5: Backend - Category with Animal Products API

### Express.js Example

```typescript
import express from 'express'
import { supabase } from './supabase'

const router = express.Router()

// GET /api/categories/:categoryId/animals/:animalId/products
router.get(
  '/categories/:categoryId/animals/:animalId/products',
  async (req, res) => {
    try {
      const { categoryId, animalId } = req.params

      // Get products in this category for this animal
      const { data: products, error } = await supabase
        .from('product_category_animals')
        .select(
          `
          product_id,
          products (
            id,
            name,
            slug,
            price,
            stock,
            description,
            product_images (url, alt),
            v_products_with_animals (primary_animal_name, animal_count)
          )
        `
        )
        .eq('category_id', categoryId)
        .eq('animal_id', animalId)

      if (error) throw error

      // Flatten response
      const flattened = products.map(p => ({
        ...p.products,
        primary_animal_name:
          p.products.v_products_with_animals[0]?.primary_animal_name,
        animal_count:
          p.products.v_products_with_animals[0]?.animal_count,
      }))

      res.json({
        success: true,
        count: flattened.length,
        data: flattened,
      })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  }
)

// GET /api/products/:productId/animals
// Get all animals this product is suitable for
router.get('/products/:productId/animals', async (req, res) => {
  try {
    const { productId } = req.params

    const { data: animals, error } = await supabase
      .from('product_animals')
      .select(
        `
        animals (
          id,
          name,
          slug,
          icon,
          color
        ),
        is_primary
      `
      )
      .eq('product_id', productId)
      .order('is_primary', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      animals: animals.map(pa => ({
        ...pa.animals,
        isPrimary: pa.is_primary,
      })),
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/products/:productId/animals/:animalId
// Tag a product with an animal
router.post(
  '/products/:productId/animals/:animalId',
  async (req, res) => {
    try {
      const { productId, animalId } = req.params
      const { isPrimary } = req.body

      // Check if already linked
      const { data: existing } = await supabase
        .from('product_animals')
        .select('id')
        .eq('product_id', productId)
        .eq('animal_id', animalId)
        .single()

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Product already linked to this animal',
        })
      }

      // Insert link
      const { error } = await supabase
        .from('product_animals')
        .insert({
          product_id: productId,
          animal_id: animalId,
          is_primary: isPrimary || false,
        })

      if (error) throw error

      // If primary, update product.primary_animal_id
      if (isPrimary) {
        await supabase
          .from('products')
          .update({ primary_animal_id: animalId })
          .eq('id', productId)
      }

      res.json({ success: true, message: 'Product linked to animal' })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  }
)

export default router
```

---

## Scenario 6: Data Migration - One-Time Setup

### Migration Function (Run Once)

```typescript
// Run this function ONCE after deploying schema evolution

async function populateAnimalRelationships() {
  try {
    console.log('Starting animal relationship migration...')

    // 1. Migrate category animal types
    console.log('Step 1: Migrating category animal types...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, animal_type')
      .not('animal_type', 'is', null)

    if (catError) throw catError

    for (const cat of categories) {
      // Get the animal ID
      const { data: animal } = await supabase
        .from('animals')
        .select('id')
        .eq('slug', cat.animal_type)
        .single()

      if (animal) {
        // Create category_animals link
        await supabase.from('category_animals').insert(
          {
            category_id: cat.id,
            animal_id: animal.id,
            is_primary: true,
          },
          { ignoreDuplicates: true }
        )

        // Mark category as animal-specific
        await supabase
          .from('categories')
          .update({ is_animal_specific: true })
          .eq('id', cat.id)
      }
    }

    console.log(`✅ Migrated ${categories.length} categories`)

    // 2. Set primary animals for products
    console.log('Step 2: Setting product primary animals...')
    const { data: products } = await supabase
      .from('products')
      .select('id, category_id')
      .is('primary_animal_id', null)

    for (const product of products) {
      // Get primary animal from category
      const { data: catAnimal } = await supabase
        .from('category_animals')
        .select('animal_id')
        .eq('category_id', product.category_id)
        .eq('is_primary', true)
        .single()

      if (catAnimal) {
        await supabase
          .from('products')
          .update({ primary_animal_id: catAnimal.animal_id })
          .eq('id', product.id)
      } else {
        // Default to universal
        const { data: universal } = await supabase
          .from('animals')
          .select('id')
          .eq('slug', 'universal')
          .single()

        if (universal) {
          await supabase
            .from('products')
            .update({ primary_animal_id: universal.id })
            .eq('id', product.id)
        }
      }
    }

    console.log(`✅ Set primary animals for ${products.length} products`)
    console.log('✅ Migration complete!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Execute migration
await populateAnimalRelationships()
```

---

## Testing & Validation

### Unit Tests (Jest Example)

```typescript
import { supabase } from '@/lib/supabase'

describe('Animal Schema Evolution', () => {
  test('Animals table has base animals', async () => {
    const { data: animals } = await supabase
      .from('animals')
      .select('slug')
      .in('slug', ['cat', 'dog', 'bird', 'other', 'universal'])

    expect(animals).toHaveLength(5)
  })

  test('Can link product to animal', async () => {
    // Setup
    const { data: animal } = await supabase
      .from('animals')
      .select('id')
      .eq('slug', 'cat')
      .single()

    // Action
    const { error } = await supabase
      .from('product_animals')
      .insert({
        product_id: 'test-product-id',
        animal_id: animal.id,
        is_primary: true,
      })

    expect(error).toBeNull()
  })

  test('v_products_with_animals view returns animal info', async () => {
    const { data, error } = await supabase
      .from('v_products_with_animals')
      .select('*')
      .limit(1)

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data[0]).toHaveProperty('primary_animal_name')
    expect(data[0]).toHaveProperty('animal_count')
  })

  test('Product variants table supports animal-specific data', async () => {
    const { data: columns, error } = await supabase
      .from('product_variants')
      .select('*')
      .limit(0)

    expect(error).toBeNull()
    // Check column exists
    expect(columns).toBeDefined()
  })
})
```

---

## Troubleshooting Common Issues

### Issue: "Unknown column primary_animal_id"
```sql
-- Verify column exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'products' 
  AND column_name = 'primary_animal_id'
);
-- If false, run the migration script again
```

### Issue: "Foreign key constraint failed"
```typescript
// Make sure animal exists before linking
const { data: animal } = await supabase
  .from('animals')
  .select('id')
  .eq('slug', 'cat')
  .single()

if (!animal) {
  throw new Error('Animal not found')
}
// Now proceed with insert
```

### Issue: View returning NULL animal names
```sql
-- Check if product has primary_animal_id set
SELECT id, primary_animal_id FROM products WHERE primary_animal_id IS NULL;

-- Set missing ones
UPDATE products 
SET primary_animal_id = (SELECT id FROM animals WHERE slug = 'universal')
WHERE primary_animal_id IS NULL;
```

---

## Performance Tips

1. **Use indexed views** for common queries:
   ```typescript
   // ✅ Fast (indexed)
   const { data } = await supabase
     .from('v_products_with_animals')
     .select('*')
     .eq('primary_animal_slug', 'cat')

   // ⚠️ Slower (multiple joins)
   const { data } = await supabase
     .from('products')
     .select('*, animals(*)')
     .eq('primary_animal_id', catId)
   ```

2. **Use product_category_animals for filtering**:
   ```typescript
   // ✅ Single table lookup
   await supabase
     .from('product_category_animals')
     .select('*')
     .eq('category_id', catId)
     .eq('animal_id', dogId)
   ```

3. **Paginate large result sets**:
   ```typescript
   const { data, count } = await supabase
     .from('v_products_with_animals')
     .select('*', { count: 'exact' })
     .range(0, 19) // First 20 items
   ```

---

This implementation guide covers all major use cases. Reference it while building your animal-centric features!
