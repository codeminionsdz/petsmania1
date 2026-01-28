# 🔧 Fix RLS for Guest Order Creation (Script 027)

## ❌ Problem
When creating a guest order (without logging in), you get error:
```
"new row violates row-level security policy for table \"orders\""
```

This happens because the RLS policies don't allow guest orders to be created with `user_id = NULL`.

## ✅ Solution
Apply SQL script **027** to update RLS policies:

---

## 🚀 How to Apply (2 Minutes)

### Step 1: Open Supabase SQL Editor
```
https://app.supabase.com
→ Select "parapharmacielolivier" project  
→ Click "SQL Editor" (left sidebar)
→ Click "New Query"
```

### Step 2: Copy Script 027
Open file:
```
scripts/027-fix-guest-order-creation-rls.sql
```

Copy ALL content and paste into Supabase SQL Editor.

### Step 3: Run It
Click the **"RUN"** button (or Ctrl+Enter)

Wait for green checkmarks ✅ (usually 10 seconds)

---

## 📝 What The Script Does

✅ Allows `INSERT` into `orders` with `user_id IS NULL` (guest orders)
✅ Allows reading guest orders (anyone can view them)  
✅ Allows reading guest order items
✅ Keeps admin-only policies for deletes

---

## 🧪 Test It

### Before Fix (Will Error):
1. Go to checkout page
2. Enter: Name, Phone, Address, etc.
3. Click "Place Order"
4. **Error appears**: "RLS policy" error

### After Fix (Will Work):
1. Go to checkout page  
2. Enter: Name, Phone, Address, etc.
3. Click "Place Order"
4. ✅ **Success!** Order created
5. Redirected to success page

---

## ✨ Done!
Guest checkout now works without requiring login! 🎉
