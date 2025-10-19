import express from 'express'
import contractRoutes from './routes/contractRoutes'

const app = express()
app.use(express.json())

app.use('/api', contractRoutes)

const PORT = Number(process.env.PORT || 4000)
app.listen(PORT, () => {
  console.log(`🚀 TrustAI backend running on port ${PORT}`)
})
