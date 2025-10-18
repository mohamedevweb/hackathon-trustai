import algosdk from "algosdk";

// 1️⃣ Connexion au réseau testnet
const algodClient = new algosdk.Algodv2(
    '', // pas de token
    'https://testnet-api.algonode.cloud', // endpoint public testnet
    ''
);

// 2️⃣ Clé de compte (wallet)
const senderMnemonic = "TA CLE MNEMONIC TESTNET ICI";
const senderAccount = algosdk.mnemonicToSecretKey(senderMnemonic);

async function run() {
    console.log("Adresse du wallet:", senderAccount.addr);

    // 3️⃣ Récupération des paramètres du réseau
    const params = await algodClient.getTransactionParams().do();
    console.log("Params:", params);

    // 4️⃣ Exemple : transaction simple pour 0.1 ALGO à soi-même (test)
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderAccount.addr,
        to: senderAccount.addr,
        amount: algosdk.algosToMicroalgos(0.1),
        suggestedParams: params,
    });

    // 5️⃣ Signature + envoi
    const signedTxn = txn.signTxn(senderAccount.sk);
    const tx = await algodClient.sendRawTransaction(signedTxn).do();
    console.log("Transaction envoyée, ID:", tx.txId);
}

run().catch(console.error);
