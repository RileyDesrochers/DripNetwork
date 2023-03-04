const ethers = require('ethers');
const contract = require('./Channel.json');
require('dotenv').config()

function sanitiseChannel(ch){//toString
  return {
    value: ch.value.toString(),
    state: ch.state,
    round: ch.round._value.toString(),
    lockTime: ch.lockTime.toString()
  }
}

module.exports = class unDripPayments {
  constructor(rpc, address) {
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    this.provider = provider;
    this.contract = new ethers.Contract(address, contract.abi, provider);
    this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  }

  async signData(from, to, networkProvider, amount, round, marginal, cid){
    const hash = await this.contract.getMessageHash(from, to, networkProvider, amount, round, marginal, cid);
    const sig = await this.signer.signMessage(ethers.utils.arrayify(hash));
    return sig;
  }

  async getSigner(from, to, networkProvider, amount, round, marginal, cid, sig){
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
  }

  /*async validSig(){
      this.contract
  }*/
}

/*async function validSig(address, used, round, sig){
    const hash = await channelContract.getMessageHash(signer.address, used, round)
    //ethSignedMessageHash = getEthSignedMessageHash(messageHash);
    const sigMsgHash = await channelContract.getEthSignedMessageHash(hash)
    const from = await channelContract.recoverSigner(sigMsgHash, sig)
    if(from === address){
      return true;
    }else{
      return false;
    }
    //await channelContract.connect(signer).reciverCollectPayment(address, channels[address].used, channels[address].round, sig);  
  }*/
