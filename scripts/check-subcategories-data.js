#!/usr/bin/env node
/**
 * Check what data is being returned from the API
 * Run this with: node scripts/check-subcategories-data.js
 */

const https = require('https');

async function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function checkData() {
  console.log('🔍 Checking data from Supabase...\n');
  
  const baseUrl = 'https://vqiewpnogespcqcotwgz.supabase.co/rest/v1';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxaWV3cG5vZ2VzcGNxY290d2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTg3NzgsImV4cCI6MjA3Nzc5NDc3OH0.6Pf9F3UJdkCFhdzabgdkFCcVS7XRVY6OLU32kwzUcxQ';
  
  try {
    // Check 1: Categories with parent_id
    console.log('1️⃣ Checking categories with parent_id (subcategories)...');
    const query1 = `${baseUrl}/categories?parent_id=not.is.null&select=*`;
    
    const response = await fetch(query1, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      return;
    }
    
    const subcats = await response.json();
    console.log(`   Found ${subcats.length} subcategories\n`);
    
    if (subcats.length > 0) {
      console.log('   Sample subcategories:');
      subcats.slice(0, 5).forEach(cat => {
        console.log(`   - "${cat.name}" (id: ${cat.id.slice(0, 8)}..., parent_id: ${cat.parent_id ? cat.parent_id.slice(0, 8) + '...' : 'NULL'}, animal_type: ${cat.animal_type})`);
      });
    }
    
    // Check 2: Main categories
    console.log('\n2️⃣ Checking main categories (parent_id = NULL)...');
    const query2 = `${baseUrl}/categories?parent_id=is.null&select=id,name,slug,animal_type`;
    
    const response2 = await fetch(query2, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    
    const mainCats = await response2.json();
    console.log(`   Found ${mainCats.length} main categories\n`);
    
    if (mainCats.length > 0) {
      console.log('   Main categories:');
      mainCats.forEach(cat => {
        console.log(`   - "${cat.name}" (id: ${cat.id.slice(0, 8)}..., animal_type: ${cat.animal_type})`);
        
        // Find subcats for this category
        const related = subcats.filter(s => s.parent_id === cat.id);
        if (related.length > 0) {
          related.forEach(sub => {
            console.log(`     └─ "${sub.name}" (animal_type: ${sub.animal_type})`);
          });
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkData();
