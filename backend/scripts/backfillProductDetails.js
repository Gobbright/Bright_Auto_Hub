import mongoose from 'mongoose'
import '../src/adminApi.js'

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brightautohub'

const Vehicle = mongoose.model('AdminVehicle')
const Part = mongoose.model('AdminPart')
const Service = mongoose.model('AdminService')

const hasCards = (details) => Array.isArray(details?.cards) && details.cards.length > 0
const categoryName = (item) => item?.category?.name || item?.categoryId?.name || item?.category || 'Product'
const brandName = (item) => item?.brand?.name || item?.brand || ''
const list = (value) => Array.isArray(value) ? value.filter(Boolean).map(String) : value ? [String(value)] : []

const vehicleDetails = (item) => {
  const category = categoryName(item)
  const brand = brandName(item)
  const context = [brand, item.vehicleType, category, item.fuelType].filter(Boolean).join(' ')
  const isEv = /(electric|ev)/i.test(context)
  const isBusiness = /(commercial|truck|pickup|bus|van|carrier)/i.test(context)
  return {
    title: `${item.name} ownership highlights`,
    intro: `Use these extra checks before you shortlist ${item.name} for your daily use, business route or family travel.`,
    cards: [
      { title: 'Usage Fit', text: isBusiness ? 'Match payload, route length, uptime needs and service reach.' : 'Match passenger comfort, route type, fuel preference and local service support.', points: [`Category: ${category}`, `Fuel: ${item.fuelType || 'Confirm details'}`, `Model year: ${item.modelYear || 'Latest model'}`] },
      { title: isEv ? 'EV Readiness' : 'Running Cost', text: isEv ? 'Check charging access, real-world range, battery warranty and EV service support.' : 'Check mileage, service interval, tyres, brakes, warranty and insurance.', points: isEv ? ['Confirm home or public charging plan', 'Ask about battery warranty', 'Review range for daily route'] : ['Compare mileage and fuel cost', 'Ask for service interval', 'Review insurance and finance options'] },
      { title: 'Before Enquiry', text: 'Share budget, city, expected usage and preferred variant for the fastest useful callback.', points: ['Ask latest quotation', 'Confirm availability', 'Compare similar models'] },
    ],
  }
}

const partDetails = (item) => {
  const compatible = list(item.compatibleVehicleTypes)
  return {
    title: `${item.name} fitment and installation guide`,
    intro: `Check compatibility, part identity and quality points before buying ${item.name}.`,
    cards: [
      { title: 'Fitment Check', text: 'Confirm the exact vehicle model, production year, variant and part number.', points: [`Part number: ${item.partNumber || 'Confirm with team'}`, `Category: ${categoryName(item)}`, `Compatible with: ${compatible.join(', ') || 'Confirm fitment'}`] },
      { title: 'Quality Check', text: 'Inspect packaging, invoice and warranty terms before installation.', points: ['Check genuine-fit quality', 'Compare old and new part', 'Confirm warranty support'] },
      { title: 'Installation', text: 'Use trained technicians and test the vehicle after fitment.', points: ['Inspect connected components', 'Fit using proper tools', 'Test before regular use'] },
    ],
  }
}

const serviceDetails = (item) => {
  const features = list(item.features)
  return {
    title: `${item.name} service workflow`,
    intro: 'Review the inspection flow, package coverage and after-service support before booking.',
    cards: [
      { title: 'Inspection Flow', text: 'The job starts with vehicle condition checks and a clear estimate.', points: ['Initial inspection', 'Job-card confirmation', `Duration: ${item.duration || 'Confirmed during booking'}`] },
      { title: 'Package Coverage', text: 'Core service items are matched to the selected category and vehicle condition.', points: features.length ? features : ['Multi-point check', 'Fluid and wear inspection', 'Service guidance'] },
      { title: 'After-Service Support', text: 'Final checks and maintenance guidance help keep the vehicle reliable.', points: ['Final quality check', 'Road-test guidance', 'Next service reminder'] },
    ],
  }
}

async function backfill(Model, makeDetails) {
  const items = await Model.find().lean()
  let updated = 0
  for (const item of items) {
    if (hasCards(item.details)) continue
    await Model.updateOne({ _id: item._id }, { $set: { details: makeDetails(item) } })
    updated += 1
  }
  return { total: items.length, updated }
}

try {
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'brightautohub' })
  const [vehicles, parts, services] = await Promise.all([
    backfill(Vehicle, vehicleDetails),
    backfill(Part, partDetails),
    backfill(Service, serviceDetails),
  ])
  console.log(JSON.stringify({ vehicles, parts, services }, null, 2))
} finally {
  await mongoose.disconnect()
}