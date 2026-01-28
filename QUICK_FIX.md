# ⚡ QUICK REFERENCE - 5 Minute Fix

## Problem
Customer profiles show 0 addresses (orders work with fallback)

## Root Cause
RLS policies on `addresses` table blocking admin access

## Solution
Apply **ONE SQL Script** to Supabase

---

## 🚀 Do This Now

### 1. Go to Supabase SQL Editor
```
https://app.supabase.com
→ SQL Editor
→ New Query
```

### 2. Copy This Entire Script
📄 File: `scripts/026-ultimate-admin-rls-fix.sql`

**Just copy everything and paste into SQL Editor**

### 3. Click Run
Wait for green checkmarks ✅

### 4. Done!
Go to customer profile page - addresses should now load

---

## 🧪 Verify It Worked

1. Open browser DevTools: `F12`
2. Go to: `/admin/customers/[any-customer]/`
3. Look in Console tab for:
   ```
   ✅ Addresses loaded: [number] address(es)
   ```

---

## 🆘 Still Not Working?

Check browser console (F12) for the actual error, then:

```sql
-- Verify policies exist:
SELECT * FROM pg_policies 
WHERE tablename IN ('orders', 'addresses');

-- Should show 5 rows
```

If `pg_policies` shows nothing → Script didn't run, try again

If `pg_policies` shows policies → Check `is_admin()` function

---

## 📋 What Changed in Code

Your code now has:
- ✅ 3-method fallback for addresses (matching orders)
- ✅ Better console logging
- ✅ Client-side filtering fallback
- ✅ Clear error messages with solutions

No code changes needed - just apply the SQL script!

---

**That's it. One script. Then it works.** ✅
