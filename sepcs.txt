transactionReceipt = {
    core: {
        from: string //sender address 
        to: string //recipent address
        networkProvider: string //networkProvider address
        amount: (string in requests BigNumber for EVM calls) //total amount sent 
        round: (string in requests BigNumber for EVM calls) //to prevent double spending
        marginal: (string in requests BigNumber for EVM calls) //amount for this transaction
        CID: hexadecimal string //content id needed for fileCoin
    }
    senderSig: hexadecimal string
    networkProviderSig: hexadecimal string
}

entities:

endUser:
    loads webPage
    when image object is clicked on sends request to webHost for transactionReceipt then fetches content from fileCoin

webHost:
    hosts the webPage with 3rd party content
    when request for transactionReceipt is recived creates a transactionReceipt sends it to networkProvider to be signed and sent back then is signed again and sent to user

networkProvider:
    the purpose of the networkProvider is to prevent webHost from sening invalid messages to endUser and to settle channels of behalf of webHost. networkProvider can also charge a small fee for its services
    when transactionReceipt is recived it checks to see if its valid => ((amount == (amount of last transactionReceipt) + marginal) and (from, to, networkProvider is correct) and (marginal == cost of CID)) signs transactionReceipt then sends it back to webHost
    networkProvider can also send back the last valid signed transactionReceipt associated with channel in the case of a network error

fileCoin:
    when transactionReceipt is recived from endUser checks to see if both signatures are valid and if marginal is enough to pay for CID then returns data



