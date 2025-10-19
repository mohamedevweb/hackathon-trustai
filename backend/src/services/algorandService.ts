import algosdk from 'algosdk'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Configure Algorand Testnet client
export const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '')

// TODO: replace with your deployed App ID
export const APP_ID = Number(process.env.TRUSTAI_APP_ID || '0')

// Client mnemonic (env var)
const CLIENT_MNEMONIC = process.env.TRUSTAI_CLIENT_MNEMONIC || ''
if (!CLIENT_MNEMONIC) {
  // For hackathon simplicity, keep empty; the server will throw if used without being set
}
export const clientAccount = CLIENT_MNEMONIC ? algosdk.mnemonicToSecretKey(CLIENT_MNEMONIC) : undefined

async function getParams() {
  return await algodClient.getTransactionParams().do()
}

function getAbiContract(): algosdk.ABIContract {
  const specPath = resolve(process.cwd(), '..', 'smart-contract', 'projects', 'smart-contract', 'smart_contracts', 'artifacts', 'trustai', 'TrustAI.arc56.json')
  const json = JSON.parse(readFileSync(specPath, 'utf-8'))
  return new algosdk.ABIContract(json)
}

export async function fundContract(clientAddr: string, freelancerAddr: string, amount: number): Promise<{ txId: string }> {
  if (!clientAccount) throw new Error('Missing TRUSTAI_CLIENT_MNEMONIC')
  if (!APP_ID) throw new Error('Missing TRUSTAI_APP_ID')

  const params = await getParams()
  const abi = getAbiContract()
  const method = abi.getMethodByName('fund_contract')

  const signer = algosdk.makeBasicAccountTransactionSigner(clientAccount)
  const atc = new algosdk.AtomicTransactionComposer()

  atc.addMethodCall({
    appID: APP_ID,
    method,
    methodArgs: [clientAddr, freelancerAddr, BigInt(amount)],
    sender: clientAccount.addr,
    suggestedParams: params,
    signer,
  })

  const res = await atc.execute(algodClient, 4)
  return { txId: res.txIDs[0] }
}

export async function validateWithAI(result: boolean): Promise<{ txId: string }> {
  if (!clientAccount) throw new Error('Missing TRUSTAI_CLIENT_MNEMONIC')
  if (!APP_ID) throw new Error('Missing TRUSTAI_APP_ID')

  const params = await getParams()
  const abi = getAbiContract()
  const method = abi.getMethodByName('validate_with_ai')

  const signer = algosdk.makeBasicAccountTransactionSigner(clientAccount)
  const atc = new algosdk.AtomicTransactionComposer()

  atc.addMethodCall({
    appID: APP_ID,
    method,
    methodArgs: [result],
    sender: clientAccount.addr,
    suggestedParams: params,
    signer,
  })

  const res = await atc.execute(algodClient, 4)
  return { txId: res.txIDs[0] }
}

export async function releasePayment(): Promise<{ txId: string }> {
  if (!clientAccount) throw new Error('Missing TRUSTAI_CLIENT_MNEMONIC')
  if (!APP_ID) throw new Error('Missing TRUSTAI_APP_ID')

  const params = await getParams()
  const abi = getAbiContract()
  const method = abi.getMethodByName('release_payment')

  const signer = algosdk.makeBasicAccountTransactionSigner(clientAccount)
  const atc = new algosdk.AtomicTransactionComposer()

  atc.addMethodCall({
    appID: APP_ID,
    method,
    methodArgs: [],
    sender: clientAccount.addr,
    suggestedParams: params,
    signer,
  })

  const res = await atc.execute(algodClient, 4)
  return { txId: res.txIDs[0] }
}
