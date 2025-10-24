#!/usr/bin/env node

/**
 * Diagnostic script to check Supabase configuration and database schema
 * Run this with: node check-supabase.js
 */

const fs = require('fs')
const path = require('path')

console.log('\n🔍 SUPABASE CONFIGURATION CHECK\n')
console.log('='.repeat(60))

// Check .env.local
console.log('\n1️⃣  Checking .env.local file...\n')

const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local NOT FOUND')
  console.log('   Create a file named .env.local with:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here')
} else {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const hasUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL')
  const hasKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  if (hasUrl && hasKey) {
    console.log('✅ .env.local exists with required variables')

    // Extract and mask values for display
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)

    if (urlMatch) {
      const url = urlMatch[1].trim()
      console.log(`   URL: ${url.substring(0, 20)}... (${url.length} chars)`)
    }
    if (keyMatch) {
      const key = keyMatch[1].trim()
      console.log(`   Key: ${key.substring(0, 20)}... (${key.length} chars)`)
    }
  } else {
    console.log('⚠️  .env.local exists but missing variables')
    if (!hasUrl) console.log('   - Missing: NEXT_PUBLIC_SUPABASE_URL')
    if (!hasKey) console.log('   - Missing: NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
}

// Check schema.sql
console.log('\n2️⃣  Checking schema.sql file...\n')

const schemaPath = path.join(process.cwd(), 'supabase/schema.sql')
if (!fs.existsSync(schemaPath)) {
  console.log('❌ supabase/schema.sql NOT FOUND')
} else {
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8')

  // Check for table definitions
  const tables = {
    profiles: schemaContent.includes('CREATE TABLE profiles'),
    clients: schemaContent.includes('CREATE TABLE clients'),
    projects: schemaContent.includes('CREATE TABLE projects'),
    meetings: schemaContent.includes('CREATE TABLE meetings'),
    reminders: schemaContent.includes('CREATE TABLE reminders'),
  }

  console.log('✅ supabase/schema.sql exists')
  console.log('   Tables defined in schema:')
  Object.entries(tables).forEach(([table, exists]) => {
    console.log(`   ${exists ? '✅' : '❌'} ${table}`)
  })

  // Check for RLS
  const hasRLS = schemaContent.includes('ROW LEVEL SECURITY')
  console.log(
    `\n   ${hasRLS ? '✅' : '⚠️ '} Row Level Security policies: ${hasRLS ? 'Yes' : 'Not found'}`
  )
}

// Check database types
console.log('\n3️⃣  Checking database types...\n')

const dbTypesPath = path.join(process.cwd(), 'src/types/database.ts')
if (!fs.existsSync(dbTypesPath)) {
  console.log('❌ src/types/database.ts NOT FOUND')
} else {
  const dbContent = fs.readFileSync(dbTypesPath, 'utf-8')
  const interfaces = {
    Profile: dbContent.includes('interface Profile'),
    Client: dbContent.includes('interface Client'),
    Project: dbContent.includes('interface Project'),
    Meeting: dbContent.includes('interface Meeting'),
    Reminder: dbContent.includes('interface Reminder'),
  }

  console.log('✅ src/types/database.ts exists')
  console.log('   Interfaces defined:')
  Object.entries(interfaces).forEach(([iface, exists]) => {
    console.log(`   ${exists ? '✅' : '❌'} ${iface}`)
  })
}

// Summary and next steps
console.log('\n' + '='.repeat(60))
console.log('\n📋 NEXT STEPS:\n')

const hasEnv = fs.existsSync(envPath)
const hasSchema = fs.existsSync(schemaPath)

if (!hasEnv) {
  console.log('1. Create .env.local file with Supabase credentials')
  console.log('   See SETUP.md for detailed instructions\n')
}

if (hasEnv && hasSchema) {
  console.log('✅ Configuration looks good!\n')
  console.log('Now follow these steps:')
  console.log('1. Go to https://app.supabase.com')
  console.log('2. Open your project')
  console.log('3. Go to SQL Editor')
  console.log('4. Click "New Query"')
  console.log('5. Copy contents of supabase/schema.sql')
  console.log('6. Paste into SQL Editor')
  console.log('7. Click Run')
  console.log('8. Verify tables in Table Editor')
  console.log('9. Restart dev server: npm run dev\n')
}

console.log('For detailed help, see: FIX_CLIENTS_TABLE.md\n')
