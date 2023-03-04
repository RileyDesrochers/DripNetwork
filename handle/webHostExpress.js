const express = require("express");
//const Quote = require('inspirational-quotes');
//const fs = require('fs');
//const util = require('util');
const ethers = require('ethers');
const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const contract = require('./Channel.json');
require('dotenv').config()

const provider = new ethers.providers.JsonRpcProvider();
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
let channelContract = new ethers.Contract(contractAddress, contract.abi, provider);

let cost = 100;

let channels = {}

async function validSig(address, used, round, sig){
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
}

/*async function close(address, sig){
  await channelContract.connect(signer).reciverCollectPayment(address, channels[address].used, channels[address].round, sig);  
}*/


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

app.get("/ping", async function(_, res) {
  res.send({
    message: 'online',
  });
});

app.post("/test", async function(req, res) {
  var msg = req.body;
  console.log(msg);
  res.send({
    message: 'msg received',
  });
});

app.post("/connect", async function(req, res) {
  var msg = req.body;
  let state = await channelContract.getChannelByAddresses(msg.address, signer.address);
  if(state.state !== 1){
    res.send({
      message: 'wrong channel state',
    });
    return;
  }


  let channel = {
    used: 0,
    max: state.value,
    round: state.round[0],
    lastMsg: {}
  };
  try{
    channel = {
      used: channels[msg.address].used,
      max: channels[msg.address].max,
      round: channels[msg.address].round,
      lastMsg: channels[msg.address].lastMsg
    }
  }catch{
    channels[msg.address] = channel;
    console.log(channel);
    res.send({
      message: 'channel open',
    });
    return;
  }

  if(state.round[0] !== channel.round){
    channel.used = 0;
    channel.max = state.value;
    channel.round = state.round[0];
  }else if(state.value !== channel.max){
    if(state.value < channel.max){
      throw "invalid state value change"
    }
    channel.max = state.value;
  }else{//no change 
    res.send({
      message: 'channel open',
    });
    return;
  }

  channels[msg.address] = channel;
  console.log(channel);
  res.send({
    message: 'channel open',
  });
});

app.post("/solve", async function(req, res) {
  var msg = req.body;
  msg.round = ethers.BigNumber.from(msg.round)
  let sender = msg.paymentSender;
  let channel = channels[sender];
  console.log(channel);
  if(msg.total >= (channels[sender].used+cost) && msg.total <= channels[sender].max && msg.round.eq(channels[sender].round)){//make sure not pass channel limit
    if(await validSig(sender, msg.total, msg.round, msg.signature)){
      channels[sender].used = msg.total;
      channels[sender].lastMsg = msg;
      let puz = msg.puzzle.map(x => new Uint8Array(x))
      puz = wasm.sol(puz);
      puz = puz.map(x => Array.from(x))
      res.send({
        message: puz,
      });
      return;
    }else{
      res.send({
        message: "invalid signature",
      });
      return;
    }
  }else{
    let reason;
    if(msg.total < (channels[sender].used+cost)){
      reason = "payment to enough"
    }else if(msg.total > channels[sender].max){
      reason = "exceds channel limit"
    }else if(!msg.round.eq(channels[sender].round)){
      reason = "channel needs to be updated"
    }else{
      throw "unknown error"
    }
    res.send({
      message: reason,
    });
  }
});

let port = process.env.PORT;

if(port == null || port == "") {
 port = 5000;
}

app.listen(port, function() {
  console.log("server started");
});