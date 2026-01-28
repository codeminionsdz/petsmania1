# 🔧 How to Fix Addresses Not Loading - Step by Step

## The Problem
- Customer profile page loads ✅
- Orders show (with fallback method) ✅  
- **Addresses return empty** ❌

## Root Cause
RLS policies are blocking admin access to addresses table, even with `is_admin()` function.

## Solution Steps

### 1️⃣ Go to Supabase Dashboard
- Open: https://app.supabase.com
- Select your project: `parapharmacielolivier`

### 2️⃣ Go to SQL Editor
- Left sidebar → "SQL Editor"
- New Query

### 3️⃣ Copy Script
- Copy entire content from: `scripts/026-ultimate-admin-rls-fix.sql`
- Paste into SQL Editor

### 4️⃣ Run the Script
- Click "Run" button (or Ctrl+Enter)
- Wait for completion
- You should see green checkmarks ✅

### 5️⃣ Verify Policies Were Created
At the end of script execution, you'll see output showing all policies. Look for:

```
tablename | policyname                           | status
----------|----------------------------------------|---------------------
orders    | Users can view own orders             | USING clause exists
orders    | Admins can manage all orders          | USING clause exists
order_items | Admins can manage all order items   | USING clause exists
addresses | Users can manage own addresses        | USING clause exists
addresses | Admins can manage all addresses       | USING clause exists
```

### 6️⃣ Test in Application
1. Go to admin panel: `/admin/customers`
2. Click on any customer name
3. Scroll down to see Orders and Addresses
4. **Open browser console (F12)** and look for:
   - "📋 Fetching customer details..."
   - "✅ Orders loaded" OR "Method 1 failed, trying Method 2..."
   - "✅ Addresses loaded" OR fallback messages

## Expected Behavior After Fix

### ✅ Orders Section
Should show customer's orders with:
- Order ID
- Total price
- Status
- Date
- Item count

### ✅ Addresses Section
Should show customer's addresses with:
- Full name
- Phone
- Address
- City
- Wilaya
- Postal code
- Default badge (if set)

## If It Still Doesn't Work

### Option A: Clear Cache
1. Press `F12` in browser
2. Application tab → Clear all site data
3. Refresh page
4. Check console for error messages

### Option B: Check is_admin() Function
In Supabase SQL Editor, run:
```sql
SELECT is_admin();
```
- Should return `true` if you're logged in as admin
- Should return `false` if not authenticated

### Option C: Manual Policy Check
In SQL Editor, run:
```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'addresses')
ORDER BY tablename;
```

Compare with expected policies from step 5️⃣

### Option D: Test Direct Query
In SQL Editor, run:
```sql
-- This should show all orders (if you're admin)
SELECT id, user_id, total, status, created_at 
FROM orders 
WHERE is_admin() = true;

-- This should show all addresses (if you're admin)
SELECT id, user_id, full_name, phone, address
FROM addresses
WHERE is_admin() = true;
```

## Still Having Issues?

### Check These Points:
1. **Are you logged in?** - Check user icon in top right
2. **Are you an admin?** - Check in Supabase `profiles` table, your `role` should be `"admin"`
3. **Did script run completely?** - No red errors shown?
4. **Are there really addresses/orders in database?** - Check Supabase Data Browser
5. **Browser cache?** - Try incognito/private mode

## Console Messages to Look For

**Good Signs:**
```
📋 Fetching customer details...
✅ Orders loaded successfully
✅ Addresses loaded successfully
Orders found: 3
Addresses found: 5
```

**Bad Signs:**
```
❌ Error: Failed to fetch customer
Method 1 failed with error: {}
Method 2 failed with error: {}
Method 3 failed with error: {}
Orders found: 0
Addresses found: 0
```

## What Changed in Script 026?

This is the **ultimate** version that:
1. ✅ Disables RLS completely first
2. ✅ Drops ALL old policies (no conflicts)
3. ✅ Re-enables RLS cleanly
4. ✅ Creates exactly 2 policies per table (user + admin)
5. ✅ Shows verification output confirming success

---

**Last Updated:** Message 18
**Script Version:** 026-ultimate-admin-rls-fix.sql
**Status:** Ready to apply
