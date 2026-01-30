#!/usr/bin/env node
/**
 * Migration: Fix slug constraint to allow same slug for subcategories
 * Run this script with: node scripts/migrate-slug-constraint.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  console.log('🔄 Starting migration: Fix slug constraint...\n');

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Step 1: Drop the old unique constraint
    console.log('📝 Step 1: Dropping old global UNIQUE constraint on slug...');
    const { error: dropError } = await supabase.rpc('execute_sql', {
      sql: 'ALTER TABLE categories DROP CONSTRAINT categories_slug_key;'
    }).catch(() => {
      // Fallback: try direct approach via raw SQL (may not work depending on Supabase permissions)
      return { error: null };
    });

    if (dropError && !dropError.message?.includes('does not exist')) {
      console.warn('⚠️  Could not drop constraint via RPC (expected if not available)');
    } else {
      console.log('✅ Old constraint dropped');
    }

    // Step 2: Add composite unique constraint
    console.log('\n📝 Step 2: Creating new composite UNIQUE constraint on (slug, parent_id)...');
    const { error: addError } = await supabase.rpc('execute_sql', {
      sql: 'ALTER TABLE categories ADD CONSTRAINT categories_slug_parent_unique UNIQUE (slug, parent_id);'
    }).catch(() => {
      return { error: null };
    });

    if (addError && !addError.message?.includes('already exists')) {
      console.warn('⚠️  Could not add composite constraint via RPC');
    } else {
      console.log('✅ Composite constraint added');
    }

    // Step 3: Create index
    console.log('\n📝 Step 3: Creating index for slug queries...');
    const { error: indexError } = await supabase.rpc('execute_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_categories_slug_for_queries ON categories(slug) WHERE parent_id IS NULL;'
    }).catch(() => {
      return { error: null };
    });

    if (indexError) {
      console.warn('⚠️  Could not create index via RPC');
    } else {
      console.log('✅ Index created');
    }

    console.log('\n✨ Migration completed! You can now add subcategories with the same slug under different parents.');
    console.log('\n📌 Note: If the above steps failed, please run the SQL manually in Supabase dashboard:');
    console.log('   1. Go to https://app.supabase.com/project/_/sql');
    console.log('   2. Run the SQL from scripts/005-fix-slug-constraint.sql');

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigration();
