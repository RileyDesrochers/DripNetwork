const express = require("express");
const atmospherePayments = require("./atmospherePayments.js");
const fileObject = require("./fileObject.js");
var fs = require('fs')
require('dotenv').config()

const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const rpc = "http://127.0.0.1:8545/";
port = 4000;
const ap = new atmospherePayments(rpc, contractAddress);
const fo = new fileObject();

const app = express();

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
        amount: 0,
        round: 0,
      },
      senderSig: ""
    }
  }

  async connect(address){
    /*let ch;
    if(address in this.channels){
      ch = this.channels[address];
    }else{
      ch = this.blank;
      ch.offChan.to = address;
    }

    if(ch.onChan.state === 0){
      ch.onChan = await ap.getChannel(address);
    }
    this.channels[address] = ch;*/
  }

  async getChannel(address){
    await this.connect(address);
    return this.channels[address];
  }

  async generateReceipt(cid){
    /*let dat = fo.getFile(cid)
    let receipt = this.channels[dat.providerAddress].offChan;
    receipt.amount += dat.price;
    let sig = await ap.signData(receipt.from, receipt.to, receipt.amount, receipt.round);
    console.log(this.channels[dat.providerAddress])*/
    
    //this.channels[dat.providerAddress].offChan = receipt;
    //this.channels[dat.providerAddress].senderSig = sig;
    //console.log(this.channels[dat.providerAddress])
    return {
      from: contractAddress,
      to: contractAddress,
      amount: "500",
      round: "0",
      sig: ""
    }
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
  res.send({
    message: "success",
  });
});

app.post("/data", async function(req, res) {
  var name = req.body.name;

  res.sendFile("./files/"+name);
});

//let port = process.env.PORT;

/*if(port == null || port == "") {
 port = 5000;
}*/

app.listen(port, function() {
  console.log("server started");
});