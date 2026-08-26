import 'dotenv/config'
import mongoose from 'mongoose'
import { Readable } from 'node:stream'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import '../src/adminApi.js'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const apiOrigin = (process.env.API_ORIGIN || process.env.PUBLIC_API_ORIGIN || 'http://localhost:5000').replace(/\/$/, '')
const sourceRoot = 'frontend/src/assets/Images'
const Blog = mongoose.model('AdminBlog')
const contentTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' }

const stories = [
  ['future-of-mobility','The Future of Mobility Is Already Here','FUTURE MOBILITY','How smarter design, connected technology and cleaner powertrains are changing every journey.','future-mobility-white-sports-car-banner.png','White sports car representing the future of mobility'],
  ['kia-sportage-road-review','Kia Sportage: Built for the Open Road','CAR REVIEW','A practical look at comfort, road presence and everyday SUV capability.','kia-sportage-red-suv-road.png','Red Kia Sportage SUV driving on a scenic road'],
  ['electric-car-charging-guide','A Simple Guide to Electric Car Charging','ELECTRIC VEHICLES','Home, public and fast charging explained for first-time EV buyers.','electric-car-charging-station.png','White electric car connected to a charging station'],
  ['car-engine-service-checklist','Your Essential Engine Service Checklist','MAINTENANCE','The inspections that help prevent avoidable repairs and keep performance consistent.','professional-car-engine-service.png','Professional mechanics servicing a car engine'],
  ['connected-car-infotainment','Connected Car Features Worth Using','TECHNOLOGY','Make navigation, entertainment and vehicle information work better for you.','connected-car-infotainment-system.png','Modern connected car infotainment dashboard'],
  ['tata-safari-family-suv-guide','Tata Safari Family SUV Guide','SUV GUIDE','Space, comfort and road-trip readiness for families considering a large SUV.','tata-safari-grey-suv.png','Grey Tata Safari SUV on a mountain road'],
  ['choosing-your-next-new-car','How to Choose Your Next New Car','BUYING GUIDE','A clear framework for comparing budget, space, fuel and ownership needs.','new-cars-lineup-showroom.png','Lineup of new cars in a modern showroom setting'],
  ['motorcycle-touring-essentials','Motorcycle Touring Essentials','TWO WHEELERS','Prepare your bike, riding gear and route before the next long-distance ride.','motorcycles-lineup-scenic-road.png','Three motorcycles parked on a scenic road'],
  ['engine-oil-change-guide','When Should You Change Engine Oil?','MAINTENANCE','Understand oil intervals, warning signs and the value of the correct grade.','car-engine-oil-change.png','Fresh engine oil being poured during car maintenance'],
  ['car-tyre-road-safety','Car Tyres and Road Safety','SAFETY','Pressure, tread and alignment checks that make every drive safer.','car-tyres-road-safety.png','Car tyres prepared for a road safety inspection'],
  ['road-trip-car-preparation','Prepare Your Car for a Road Trip','OWNERSHIP','A pre-drive checklist for a smooth, comfortable and confident journey.','car-dashboard-road-trip.png','Driver view of a car dashboard on a road trip'],
  ['commercial-truck-fleet-guide','Choosing a Commercial Truck Fleet','COMMERCIAL','Match payload, route and operating cost to the right business vehicle.','commercial-trucks-logistics-fleet.png','Commercial truck fleet ready for logistics work'],
  ['kia-carens-family-mpv-review','Kia Carens: A Practical Family MPV','CAR REVIEW','Cabin flexibility and family-friendly features examined in detail.','kia-carens-white-mpv.png','White Kia Carens family MPV'],
  ['online-car-enquiry-tips','Get Better Answers from an Online Car Enquiry','BUYING GUIDE','The details to share so an automotive expert can respond quickly and accurately.','online-car-enquiry-mobile-app-banner.png','Mobile phone used to send an online car enquiry'],
  ['mountain-road-suv-driving','Confident SUV Driving on Mountain Roads','DRIVING GUIDE','Plan braking, cornering and vehicle checks before taking an SUV into the hills.','red-suv-mountain-road-trip.png','Red SUV travelling on a mountain road','blog details'],
  ['pre-purchase-engine-inspection','Why an Engine Inspection Matters Before Buying','BUYING GUIDE','A careful mechanical inspection can reveal maintenance needs before you commit.','car-mechanic-engine-inspection.png','Car mechanic inspecting an engine','blog details'],
  ['electric-suv-fast-charging-tips','Fast-Charging Tips for Electric SUV Owners','ELECTRIC VEHICLES','Charge efficiently, protect battery health and plan longer electric journeys.','electric-suv-fast-charging.png','Electric SUV using a fast charging station','blog details'],
  ['family-road-trip-packing-guide','The Smart Family Road-Trip Packing Guide','OWNERSHIP','Pack safely, preserve cabin comfort and keep essential items easy to reach.','family-car-road-trip-luggage.png','Family loading luggage for a car road trip','blog details'],
  ['new-suv-model-selection-guide','How to Shortlist the Right New SUV','SUV GUIDE','Compare size, safety, performance and ownership costs across new SUV models.','new-suv-models-lineup.png','Lineup of new SUV models','blog details'],
  ['touring-motorcycle-route-planning','Plan a Better Long-Distance Motorcycle Route','TWO WHEELERS','Balance distance, fuel stops, rest breaks and weather for a safer touring ride.','touring-motorcycles-mountain-road.png','Touring motorcycles on a mountain road','blog details'],
]

const detailVisuals = [
  ['red-suv-automotive-article-banner.png','Red SUV automotive article banner'],
  ['red-suv-mountain-road-trip.png','Red SUV travelling on a mountain road'],
  ['car-mechanic-engine-inspection.png','Car mechanic inspecting an engine'],
  ['engine-oil-maintenance-service.png','Engine oil maintenance service'],
  ['professional-car-engine-repair-team.png','Professional car engine repair team'],
  ['mg-astor-white-suv-article.png','White MG Astor SUV'],
  ['car-tyres-highway-safety.png','Car tyres checked for highway safety'],
  ['tata-safari-road-trip-suv.png','Tata Safari SUV prepared for a road trip'],
  ['electric-suv-fast-charging.png','Electric SUV using a fast charging station'],
  ['kia-sportage-red-suv-article.png','Red Kia Sportage SUV'],
  ['engine-oil-change-closeup.png','Close-up of an engine oil change'],
  ['touring-motorcycles-mountain-road.png','Touring motorcycles on a mountain road'],
  ['new-suv-models-lineup.png','Lineup of new SUV models'],
  ['family-car-road-trip-luggage.png','Family loading luggage for a car road trip'],
]

const uploadImage = async (bucket, source, alt, context) => {
  const existing = await mongoose.connection.db.collection('media.files').findOne({ 'metadata.source': source })
  if (existing) return `${apiOrigin}/api/storage/files/${existing._id}`
  const fullPath = path.join(projectRoot, ...source.split('/'))
  const details = await stat(fullPath)
  if (!details.isFile() || details.size > 8 * 1024 * 1024) throw new Error(`Invalid blog image: ${source}`)
  const buffer = await readFile(fullPath)
  const upload = bucket.openUploadStream(path.basename(fullPath), { metadata: { source, alt, title: alt, context, contentType: contentTypes[path.extname(fullPath).toLowerCase()] || 'application/octet-stream' } })
  await new Promise((resolve, reject) => {
    upload.once('finish', resolve)
    upload.once('error', reject)
    Readable.from(buffer).pipe(upload)
  })
  return `${apiOrigin}/api/storage/files/${upload.id}`
}

const articleContent = (title, excerpt, tag) => `<p>${excerpt}</p><h2>Why this matters</h2><p>${title} is easier to understand when real requirements, safety, running costs and long-term ownership are considered together. This guide focuses on practical decisions instead of specifications alone.</p><h2>What to check</h2><p>Start with your everyday usage, expected distance, passenger or payload needs, service availability and total budget. Compare the options consistently and verify the details that affect your journey most.</p><h2>Make a confident decision</h2><p>Use this ${tag.toLowerCase()} guide as a shortlist, then speak with a Bright Auto Hub expert for personalised vehicle, service or spare-parts guidance.</p>`

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goautomobile')
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'media' })
  const gallery = []
  for (const [filename, alt] of detailVisuals) {
    const source = `${sourceRoot}/blog details/${filename}`
    gallery.push({ url: await uploadImage(bucket, source, alt, 'blog-content'), alt })
  }
  let created = 0
  let updated = 0
  for (const [index, story] of stories.entries()) {
    const [slug, title, tag, excerpt, filename, imageAlt, folder = 'BLOG'] = story
    const source = `${sourceRoot}/${folder}/${filename}`
    const imageUrl = await uploadImage(bucket, source, imageAlt, 'blog-cover')
    const galleryImages = Array.from({ length: 4 }, (_, offset) => gallery[(index + offset) % gallery.length])
    const exists = await Blog.exists({ slug })
    await Blog.findOneAndUpdate({ slug }, { $set: {
      title, excerpt, content: articleContent(title, excerpt, tag), imageUrl, imageAlt, galleryImages,
      author: 'Bright Auto Hub Editorial', tags: [tag], readingTime: 5, status: 'published',
      publishedAt: new Date(Date.UTC(2026, 7, 26 - index)),
    } }, { upsert: true, new: true, setDefaultsOnInsert: true })
    exists ? updated += 1 : created += 1
  }
  console.log(JSON.stringify({ blogs: stories.length, created, updated, galleryImages: gallery.length, gridFsSources: new Set([...stories.map((story) => story[4]), ...detailVisuals.map((item) => item[0])]).size }, null, 2))
  await mongoose.disconnect()
}

run().catch(async (error) => { console.error(error); try { await mongoose.disconnect() } catch {} process.exitCode = 1 })
