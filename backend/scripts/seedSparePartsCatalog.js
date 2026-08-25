import 'dotenv/config'
import mongoose from 'mongoose'
import { seedSparePartsCatalog } from '../src/adminApi.js'

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goautomobile'

try {
  await mongoose.connect(uri)
  const result = await seedSparePartsCatalog()
  console.log(`Spare-parts catalogue seeded: ${result.groups} groups, ${result.categories} categories, ${result.products} products.`)
} catch (error) {
  console.error('Unable to seed spare-parts catalogue:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
