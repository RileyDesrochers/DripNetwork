const ethers = require('ethers');
const abi = require('./fileContract.json');
const lighthouse = require('@lighthouse-web3/sdk');
require('dotenv').config()

const signAuthMessage = async(publicKey, privateKey) =>{
    const provider = new ethers.providers.JsonRpcProvider();
    const signer = new ethers.Wallet(privateKey, provider);
    const messageRequested = (await lighthouse.getAuthMessage(publicKey)).data.message;
    const signedMessage = await signer.signMessage(messageRequested);
    return(signedMessage)
  }

module.exports = class unDripStorage {
  constructor() {
    const address = '0xA18970575c4125B80f19AF0600Fca909f8591380';
    const provider = new ethers.providers.JsonRpcProvider("https://api.hyperspace.node.glif.io/rpc/v1");
    this.address = address;
    this.provider = provider;
    this.contract = new ethers.Contract(address, abi, provider);
    this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    this.aggregator = "([1])";
  }
  
  async signAuthMessage(){
    const messageRequested = (await lighthouse.getAuthMessage(this.signer.address)).data.message;
    const signedMessage = await this.signer.signMessage(messageRequested);
    return(signedMessage)
  }

  async accessControl(from , to , networkProvider, amount, round, marginal, cid, sig){
    const signedMessage = await this.signAuthMessage();
    const condition = {
      id: 1,
      chain: "Hyperspace",
      method: "verifySenderSig",
      standardContractType: "Custom",
      contractAddress: this.address,
      returnValueTest: {
        comparator: "==",
        value: "true"
      },
      parameters: [from, to, networkProvider, amount, round, marginal, cid, sig],
      inputArrayType: ["address", "address", "address", "uint256", "uint256", "uint256", "string", "bytes"],
      outputType: "bool"
    }
    const response = await lighthouse.accessCondition(
      this.signer.address,
      cid,
      signedMessage,
      condition,
      "([1])"
    );
    return response;
  }

  async signData(from, to, networkProvider, amount, round, marginal, cid){
    const hash = await this.contract.getMessageHash(from, to, networkProvider, amount, round, marginal, cid);
    const sig = await this.signer.signMessage(ethers.utils.arrayify(hash));
    return sig;
  }

  /*async getSigner(from, to, networkProvider, amount, round, marginal, cid, sig){
    const hash = await this.contract.getMessageHash(from, to, networkProvider, amount, round, marginal, cid);
    const sigMsgHash = await this.contract.getEthSignedMessageHash(hash);
    const signer = await this.contract.recoverSigner(sigMsgHash, sig);
    return signer;
  }  

  async addFunds(to, value){
    const from = this.signer.address;
    const ch = sanitiseChannel(await this.contract.getChannelByAddresses(from, to));
    if(ch.state === 0){
        await this.contract.connect(this.signer).open(to, value);
    }
    else if(ch.state === 1){
        await this.contract.connect(this.signer).senderFundChannel(to, value);
    }else{
        return "unlock fisrt"
    }
    return "success"
  }

  async handleConnect(from){
    const to = this.signer.address;
    const ch = sanitiseChannel(await this.contract.getChannelByAddresses(from, to));
    return ch;
  }*/

  /*async validSig(){
      this.contract
  }*/
}
  
/*
  const accessControl = async() =>{
    try{
      // CID on which you are applying encryption
      // CID is generated by uploading a file with encryption
      // Only the owner of file can apply access conditions
      const cid = "Qma7Na9sEdeM6aQeu6bUFW54HktNnW2k8g226VunXBhrn7";
      const publicKey = "0xa3c960b3ba29367ecbcaf1430452c6cd7516f588";
      const privateKey = process.env.PRIVATE_KEY_WALLET1;
      
      // Conditions to add
      const conditions = [
        {
          id: 1,
          chain: "Optimism",
          method: "getBlockNumber",
          standardContractType: "",
          returnValueTest: {
            comparator: ">=",
            value: "13349"
          },
        },
      ];
  
      // Aggregator is what kind of operation to apply to access conditions
      // Suppose there are two conditions then you can apply ([1] and [2]), ([1] or [2]), !([1] and [2]).
      const aggregator = "([1])";
  
      const signedMessage = await signAuthMessage(publicKey, privateKey);
      const response = await lighthouse.accessCondition(
        publicKey,
        cid,
        signedMessage,
        conditions,
        aggregator
      );
  
      // // Display response
      console.log(response);

    } catch(error){
      console.log(error)
    }
  }
  
  const getfileEncryptionKey = async() => {
    try{
      // Get key back after passing access control condition
      const cid = "Qma7Na9sEdeM6aQeu6bUFW54HktNnW2k8g226VunXBhrn7";
      const publicKey = "0x969e19A952A9aeF004e4F711eE481D72A59470B1";
      const privateKey = process.env.PRIVATE_KEY_WALLET2;
  
      const signedMessage = await signAuthMessage(publicKey, privateKey);
      const key = await lighthouse.fetchEncryptionKey(
        cid,
        publicKey,
        signedMessage
      );
      console.log(key);
    } catch(error){
      console.log(error)
    }
  }
  
  accessControl()
*/
//https://api.hyperspace.node.glif.io/rpc/v1
//3141