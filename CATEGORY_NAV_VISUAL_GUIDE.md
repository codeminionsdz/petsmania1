# Category Navigation - Visual Implementation Guide

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
└─────────────────────────────────────────────────────────────┘
                           ▼
              ┌────────────────────────┐
              │  Click Category Link   │
              │                        │
              │ "Accessoires" OR       │
              │ "Laisse" OR            │
              │ "Collier"              │
              └────────────┬───────────┘
                           ▼
        ┌──────────────────────────────────────┐
        │  Navigate to /categories/[slug]      │
        └──────────────┬───────────────────────┘
                       ▼
    ┌─────────────────────────────────────────────┐
    │  Server: CategoryPage({slug})               │
    │  1. Fetch category by slug                  │
    │  2. Check: Is main category?                │
    │     (parentId === null && children.length > 0)
    └─────────┬───────────────────┬──────────────┘
              │                   │
              YES (Main)          NO (Subcategory)
              │                   │
              ▼                   ▼
    ┌─────────────────┐  ┌──────────────────────────┐
    │ REDIRECT to:    │  │ Continue rendering:      │
    │ /categories/    │  │ 1. Fetch parent category │
    │ [firstChild]    │  │ 2. Extract siblings      │
    │                 │  │ 3. Render tabs component │
    │ Browser reloads │  │                          │
    │ new URL         │  └─────────┬────────────────┘
    └─────────────────┘            │
                                   ▼
                    ┌──────────────────────────┐
                    │  Render Page Content:    │
                    │ • Header                 │
                    │ • Breadcrumbs            │
                    │ • SubcategoryTabs        │
                    │ • Product Grid           │
                    └──────────────────────────┘
                           ▼
        ┌──────────────────────────────────────┐
        │  User Sees:                          │
        │                                      │
        │  Catégories > Accessoires > Collier  │
        │                                      │
        │  [Collier] Laisse Panier Jouets ...  │
        │   ^^^^^^^ (active, highlighted)     │
        │                                      │
        │  [Product Grid for Collier]          │
        └──────────────────────────────────────┘
                           ▼
                ┌──────────────────────┐
                │  User Clicks Tab     │
                │  (e.g., "Panier")    │
                │                      │
                │  Triggers redirect   │
                │  to /categories/     │
                │  panier              │
                └──────────┬───────────┘
                           ▼
                    ┌──────────────┐
                    │ Page Reloads │
                    │ with Panier  │
                    │ Tab Active   │
                    └──────────────┘
```

## Component Interaction Flow

```
┌────────────────────────────────────────────────────────┐
│              app/categories/[slug]/page.tsx            │
│            (Server Component - Async)                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  1. Parse slug from URL params                        │
│  2. Fetch category + brands (parallel)                │
│  3. Check: Is main category?                          │
│     ├─ YES → redirect() to first subcategory          │
│     └─ NO → Continue to step 4                        │
│  4. Fetch parent category for siblings                │
│  5. Build breadcrumbs with hierarchy                  │
│  6. Render page structure                             │
│                                                        │
└──────┬───────────────────────────────────────────────┘
       │
       ├──► Render children:
       │
       ├──► <CartDrawer />
       │
       ├──► <Breadcrumbs items={breadcrumbItems} />
       │
       ├──► <div className="category-header">
       │      {category header content}
       │    </div>
       │
       ├──► {parentCategory && siblings.length > 0 && (
       │      <SubcategoryTabs
       │        parentCategory={{...}}
       │        currentSubcategory={category}
       │        layout="tabs"
       │      />
       │    )}
       │
       └──► <CategoryPageContent
              category={category}
              initialProducts={productsResult.data}
              brands={brands}
              totalProducts={productsResult.total}
            />

┌────────────────────────────────────────────────────────┐
│          SubcategoryTabs (Client Component)            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Props:                                                │
│  • parentCategory: Category (with children)            │
│  • currentSubcategory: Category (current)              │
│  • layout: "tabs" | "sidebar"                          │
│  • className?: string                                  │
│                                                        │
│  State:                                                │
│  • scrollPosition: number                              │
│  • canScrollLeft: boolean                              │
│  • canScrollRight: boolean                             │
│                                                        │
│  Renders:                                              │
│  • Scroll buttons (left/right)                         │
│  • Horizontal scrollable container                     │
│  • Tab links for each subcategory                      │
│  • Active indicator for current tab                    │
│  • Stats footer                                        │
│                                                        │
└────────────────────────────────────────────────────────┘
         │
         ├─► For each subcategory in siblings:
         │   ├─► <Link href="/categories/{slug}">
         │   │   ├─► className with isActive logic
         │   │   ├─► Tab name
         │   │   └─► Active indicator (if current)
         │   └─► </Link>
         │
         └─► Stats display
             └─► "{count} sous-catégories • Sélectionné: {name}"
```

## Data Flow Example

### Scenario: User navigates from "Accessoires" to "Panier"

```
STEP 1: User clicks "Accessoires" dropdown link
─────────────────────────────────────────────────
URL: /categories/accessoires
Data needed:
  ├─ Category "Accessoires"
  │  ├─ id: "acc-1"
  │  ├─ parentId: null ← MAIN CATEGORY
  │  ├─ children: [
  │  │  {id: "col-1", slug: "collier", name: "Collier"},
  │  │  {id: "lai-1", slug: "laisse", name: "Laisse"},
  │  │  {id: "pan-1", slug: "panier", name: "Panier"},
  │  │  ...
  │  │ ]
  │  └─ description: "..."
  └─ Brands: [...]

STEP 2: Server detects main category → REDIRECT
─────────────────────────────────────────────────
New URL: /categories/collier (first child)

Browser navigates to new URL


STEP 3: Page loads with slug="collier"
──────────────────────────────────────
Data needed:
  ├─ Category "Collier"
  │  ├─ id: "col-1"
  │  ├─ parentId: "acc-1" ← SUBCATEGORY
  │  ├─ parentSlug: "accessoires"
  │  ├─ children: null
  │  └─ ...
  │
  ├─ Parent Category (for siblings)
  │  ├─ id: "acc-1"
  │  ├─ name: "Accessoires"
  │  ├─ slug: "accessoires"
  │  ├─ children: [Collier, Laisse, Panier, ...]
  │  └─ ...
  │
  ├─ Products for "Collier": [...]
  └─ Brands: [...]

STEP 4: Page renders
──────────────────
Header:
  └─ Icon + "Collier" title

Breadcrumbs:
  └─ Catégories > Accessoires > Collier

SubcategoryTabs:
  ├─ parentCategory: {name: "Accessoires", children: [...]}
  ├─ currentSubcategory: {name: "Collier", ...}
  ├─ Renders tabs: [Collier] Laisse Panier Jouets...
  │                 ^^^^^^^ active
  └─ Each tab is a Link to /categories/[slug]

Products:
  └─ Grid of Collier products


STEP 5: User clicks "Panier" tab
────────────────────────────────
Trigger:
  └─ onClick of <Link href="/categories/panier">

Browser navigates to /categories/panier


STEP 6: Page reloads with slug="panier"
────────────────────────────────────────
Same process as STEP 3-4, but now:

SubcategoryTabs renders:
  ├─ currentSubcategory: {name: "Panier", ...}
  ├─ Renders tabs: Collier Laisse [Panier] Jouets...
  │                             ^^^^^^ now active
  └─ ...

Products:
  └─ Grid of Panier products
```

## URL State Tracking

```
User Journey:

1. User is on homepage
   URL: /

2. Clicks "Accessoires" in dropdown
   URL: /categories/accessoires
   ↓ (redirect)
   URL: /categories/collier ← FIRST SUBCATEGORY
   Content: Collier products, Tabs active on "Collier"

3. Clicks "Laisse" tab
   URL: /categories/laisse
   Content: Laisse products, Tabs active on "Laisse"

4. Clicks "Panier" tab
   URL: /categories/panier
   Content: Panier products, Tabs active on "Panier"

5. Clicks breadcrumb "Accessoires"
   URL: /categories/accessoires
   ↓ (redirect)
   URL: /categories/collier ← BACK TO FIRST
   Content: Collier products again

6. Bookmarks current URL
   Bookmarked: /categories/panier

7. Later, visits bookmark
   URL: /categories/panier
   Content: Panier products, Tabs active on "Panier"
```

## Responsive Behavior

```
DESKTOP (>= 768px)
─────────────────
┌────────────────────────────────────┐
│ Category Header                    │
├────────────────────────────────────┤
│                                    │
│ [Collier] Laisse Panier Jouets    │
│           ^     ^      ^           │
│        Overflow visible            │
│   Full width tabs display          │
│                                    │
│ [Product Grid - 4 cols]            │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌─────┐
│ │      │ │      │ │      │ │     │
│ └──────┘ └──────┘ └──────┘ └─────┘
└────────────────────────────────────┘


TABLET (640px - 768px)
──────────────────────
┌────────────────────────────────────┐
│ Category Header                    │
├────────────────────────────────────┤
│                                    │
│ ◀ [Collier] Laisse Panier... ▶    │
│   (Scroll buttons visible)         │
│   (Some tabs offscreen)            │
│                                    │
│ [Product Grid - 2-3 cols]          │
│ ┌──────────┐ ┌──────────┐          │
│ │          │ │          │          │
│ └──────────┘ └──────────┘          │
└────────────────────────────────────┘


MOBILE (< 640px)
────────────────
┌──────────────────────────────────┐
│ Category Header                  │
├──────────────────────────────────┤
│                                  │
│ ◀ [Col...] Lai... Pan... ▶       │
│   (Truncated tab names)          │
│   (Heavy scrolling needed)       │
│                                  │
│ [Product Grid - 2 cols]          │
│ ┌────────────┐ ┌────────────┐   │
│ │            │ │            │   │
│ └────────────┘ └────────────┘   │
└──────────────────────────────────┘
```

## Error Handling Flow

```
Category Fetch
  ├─ Success ✓ → Continue
  └─ Fail ✗
     ├─ Retry once
     └─ If still fails → Show 404

Main Category Redirect
  ├─ Success ✓ → Redirect and reload
  └─ Fail ✗ → Continue to page render
             (User sees main category view)

Parent Category Fetch (for siblings)
  ├─ Success ✓ → Extract children
  ├─ Fail ✗ → siblings = []
  └─ Result: No tabs shown
             Page still renders

Brands Fetch
  ├─ Success ✓ → Include in products page
  └─ Fail ✗ → Empty array fallback
             Products still display

Product Fetch
  ├─ Success ✓ → Show product grid
  ├─ Fail ✗ → Show empty state
  └─ Result: User can still browse other tabs
```

---

**Last Updated**: January 30, 2026  
**Visual Guide Version**: 1.0
