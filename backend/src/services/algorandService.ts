import algosdk from 'algosdk'

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

function selector(method: string): Uint8Array {
  // ARC-4 selector = first 4 bytes of SHA512/256(method_signature)
  const hash = algosdk.makeSHA512_256(Buffer.from(method, 'utf8'))
  return hash.slice(0, 4)
}

export async function fundContract(clientAddr: string, freelancerAddr: string, amount: number): Promise<{ txId: string }> {
  if (!clientAccount) throw new Error('Missing TRUSTAI_CLIENT_MNEMONIC')
  if (!APP_ID) throw new Error('Missing TRUSTAI_APP_ID')

  const params = await getParams()
  const appArgs: Uint8Array[] = [
    selector('fund_contract(address,address,uint64)'),
    algosdk.decodeAddress(clientAddr).publicKey,
    algosdk.decodeAddress(freelancerAddr).publicKey,
    algosdk.encodeUint64(amount),
  ]

  // This MVP does not enforce escrow funding in the contract; you can optionally group a payment here
  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: clientAccount.addr,
    appIndex: APP_ID,
    suggestedParams: params,
    appArgs,
  })

  const signed = txn.signTxn(clientAccount.sk)
  const { txId } = await algodClient.sendRawTransaction(signed).do()
  await algosdk.waitForConfirmation(algodClient, txId, 4)
  return { txId }
}

export async function validateWithAI(result: boolean): Promise<{ txId: string }> {
  if (!clientAccount) throw new Error('Missing TRUSTAI_CLIENT_MNEMONIC')
  if (!APP_ID) throw new Error('Missing TRUSTAI_APP_ID')

  const params = await getParams()
  const appArgs: Uint8Array[] = [
    selector('validate_with_ai(bool)'),
    new Uint8Array([result ? 1 : 0]),
  ]

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: clientAccount.addr,
    appIndex: APP_ID,
    suggestedParams: params,
    appArgs,
  })

  const signed = txn.signTxn(clientAccount.sk)
  const { txId } = await algodClient.sendRawTransaction(signed).do()
  await algosdk.waitForConfirmation(algodClient, txId, 4)
  return { txId }
}

export async function releasePayment(): Promise<{ txId: string }> {
  if (!clientAccount) throw new Error('Missing TRUSTAI_CLIENT_MNEMONIC')
  if (!APP_ID) throw new Error('Missing TRUSTAI_APP_ID')

  const params = await getParams()
  const appArgs: Uint8Array[] = [ selector('release_payment()') ]

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: clientAccount.addr,
    appIndex: APP_ID,
    suggestedParams: params,
    appArgs,
  })

  const signed = txn.signTxn(clientAccount.sk)
  const { txId } = await algodClient.sendRawTransaction(signed).do()
  await algosdk.waitForConfirmation(algodClient, txId, 4)
  return { txId }
}
