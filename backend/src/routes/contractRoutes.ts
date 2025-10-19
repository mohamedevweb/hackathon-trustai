import { Router } from 'express'
import { add, getById, update } from '../db/contractDB.js'
import { analyzeProject } from '../services/aiService.js'
import { fundContract, validateWithAI, releasePayment } from '../services/algorandService.js'

const router = Router()

router.post('/fund', async (req, res) => {
  try {
    const { client, freelancer, amount } = req.body || {}
    if (!client || !freelancer || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Missing client, freelancer, or amount' })
    }

    const created = add({
      client,
      freelancer,
      amount,
      githubUrl: null,
      validated: false,
      aiScore: null,
      txId: null,
    })

    const { txId } = await fundContract(client, freelancer, amount)
    update(created.id, { txId })

    res.json({ success: true, contractId: created.id, txId })
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Fund failed' })
  }
})

router.post('/submit', async (req, res) => {
  try {
    const { contractId, githubUrl, freelancer } = req.body || {}
    if (!contractId || !githubUrl || !freelancer) {
      return res.status(400).json({ error: 'Missing contractId, githubUrl, or freelancer' })
    }

    const record = getById(Number(contractId))
    if (!record) return res.status(404).json({ error: 'Contract not found' })
    if (record.freelancer !== freelancer) return res.status(400).json({ error: 'Freelancer mismatch' })

    const ai = await analyzeProject(githubUrl)
    update(record.id, { githubUrl, validated: ai.validated, aiScore: ai.aiScore })

    const { txId } = await validateWithAI(ai.validated)
    update(record.id, { txId })

    res.json({ success: true, validated: ai.validated, aiScore: ai.aiScore, txId })
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Submit failed' })
  }
})

router.post('/release', async (req, res) => {
  try {
    const { contractId } = req.body || {}
    if (!contractId) return res.status(400).json({ error: 'Missing contractId' })

    const record = getById(Number(contractId))
    if (!record) return res.status(404).json({ error: 'Contract not found' })
    if (!record.validated) return res.status(400).json({ error: 'Contract not validated' })

    const { txId } = await releasePayment()
    update(record.id, { txId })

    res.json({ success: true, txId })
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Release failed' })
  }
})

export default router
