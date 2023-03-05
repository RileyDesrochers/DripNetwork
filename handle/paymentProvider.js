const express = require("express");
const atmospherePayments = require("./atmospherePayments.js");
const fileObject = require("./fileObject.js");
require('dotenv').config()

const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const rpc = "http://127.0.0.1:8545/";
port = 5000;
const ap = new atmospherePayments(rpc, contractAddress);
const fo = new fileObject();

const app = express();

let cost = 100;

class storage {
  constructor() {
    this.channels = {};
    this.blank = {
      onChan: {
        value: "0",
        state: 0,
        round: "0",
        lockTime: "0"
      },
      offChan: {
        from: process.env.ADDRESS,
        to: "0x0",
        amount: "0",
        round: "0",
        marginal: "0",
        cid: ""
      },
      senderSig: ""
    }
  }

  connect(address){
    let ch;
    if(address in this.channels){
      ch = this.channels[address];
    }else{
      ch = this.blank;
      ch.offChan.to = address;
    }

    if(ch.onChan.state === 0){
      ch.onChan = ap.getChannel(address);
    }
    this.channels[address] = ch;
  }

  getChannel(address){
    this.connect(address);
    return this.channels[address];
  }

  generateReceipt(cid){
    let dat = fo.getFile(cid)
    
    //let ap
  }
}

let data = new storage();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

/*app.get("/ping", async function(_, res) {
  res.send({
    message: 'online',
  });
});*/

/*app.post("/test", async function(req, res) {
  var msg = req.body;
  console.log(msg);
  res.send({
    message: 'msg received',
  });
});*/

app.post("/connect", async function(req, res) {
  var address = req.body.address;
  data.connect(address);
});

app.post("/receipt", async function(req, res) {
  var msg = req.body;
  msg.round = ethers.BigNumber.from(msg.round)
  
  res.send({
    message: reason,
  });
});

//let port = process.env.PORT;

/*if(port == null || port == "") {
 port = 5000;
}*/

app.listen(port, function() {
  console.log("server started");
});