import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import { adminErrorHandler, getHomepageData, registerAdminApi, seedAdminData } from './adminApi.js'
import { registerPublicApi } from './publicApi.js'

const app = express()
app.set('trust proxy', 1)

const defaultClientOrigins = [
  'https://brightautohub.gobrightglobal.com',
  'https://www.brightautohub.gobrightglobal.com',
  'https://api-brightautohub.gobrightglobal.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:4173',
]
const configuredClientOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL]
  .flatMap((value) => value?.split(',') || [])
const allowedOrigins = new Set([
  ...defaultClientOrigins,
  ...configuredClientOrigins,
].map((origin) => origin.trim().replace(/\/+$/, '')).filter(Boolean))

app.use(cors({
  origin: (origin, callback) => {
    const normalizedOrigin = origin?.trim().replace(/\/+$/, '')
    const isLocalViteOrigin = /^http:\/\/localhost:(517[3-9]|4173)$/.test(normalizedOrigin || '') || /^http:\/\/127\.0\.0\.1:(517[3-9]|4173)$/.test(normalizedOrigin || '')
    if (!normalizedOrigin || allowedOrigins.has(normalizedOrigin) || isLocalViteOrigin) return callback(null, true)
    return callback(new Error(`CORS blocked for origin ${origin}`))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))
app.use(express.json({ limit: '75mb' }))

const healthPayload = () => ({
  ok: true,
  service: 'Bright Auto Hub API',
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  databaseName: mongoose.connection.name || 'brightautohub',
})
app.get('/', (_request, response) => response.json(healthPayload()))
app.get('/api/health', (_request, response) => response.json(healthPayload()))
app.get('/api/home', async (_request, response, next) => {
  try { response.json(await getHomepageData()) } catch (error) { next(error) }
})

registerPublicApi(app)
registerAdminApi(app)
app.use(adminErrorHandler)

const port = Number(process.env.PORT) || 5000
const mongoDbName = process.env.MONGODB_DB_NAME || 'brightautohub'
const start = async () => {
  await mongoose.connect(process.env.MONGODB_URI || (`mongodb://127.0.0.1:27017/${mongoDbName}`), { dbName: mongoDbName, serverSelectionTimeoutMS: 15000 })
  await seedAdminData()
  app.listen(port, () => console.log(`Bright Auto Hub API running on port ${port}`))
}

start().catch((error) => {
  console.error('Unable to start Bright Auto Hub API:', error.message)
  process.exit(1)
})
