import { Contract, arc4, Account, uint64, Uint64, itxn, GlobalState } from '@algorandfoundation/algorand-typescript'


export class TrustAI extends Contract {
  client = GlobalState<arc4.Address>()
  freelancer = GlobalState<arc4.Address>()
  amount = GlobalState<uint64>()
  validated = GlobalState<boolean>()

  @arc4.abimethod()
  fund_contract(client: arc4.Address, freelancer: arc4.Address, amount: uint64) {
    this.client.value = client
    this.freelancer.value = freelancer
    this.amount.value = amount
    this.validated.value = false
    return "Contract funded 💰"
  }
  
  @arc4.abimethod()
  validate_with_ai(ai_result: boolean) {
    this.validated.value = ai_result
    return ai_result ? "AI validated ✅" : "AI rejected ❌"
  }

  @arc4.abimethod()
  release_payment() {
    if (!this.validated.value) return "AI not validated yet ❌"
    itxn.payment({ receiver: this.freelancer.value.native, amount: this.amount.value }).submit()
    return "Payment released 💸"
  }
}
