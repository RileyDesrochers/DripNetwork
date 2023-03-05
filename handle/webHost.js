const unDripPayments = require('./atmospherePayments.js');
const axios = require('axios');
const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const rpc = "http://127.0.0.1:8545/";
const port = "http://127.0.0.1:5000/";
const port2 = "http://127.0.0.1:6000/";

const udp = new unDripPayments(rpc, contractAddress);
//const uds = new unDripStorage();

let address = "0x5AdA39e766c416CA083d8c7e43104f2C7cF2194A";
let amount = "50000";
let round = "0";
let cid = "QmY9Q95z6mJA1DTeULHS4vwNMYe8rHwwWTcBD76oYQvFJh";

async function f(){
  await axios.post(port+'connect', {
    address: "0x1eBd2c4cfd2FC8202B06759bd071acfac189047a"
  })
  
  let r = await axios.post(port+'receipt', {
    cid: "City_night.png"
  })

  r = await axios.post(port2+'data', {
    name: "City_night.png"
  })

  console.log(r.data)
  //const sig = await udp.signData(address, address, amount, round);
  //const signer = await udp.getSigner(address, address, amount, round, sig);
  //console.log(signer)

  //const signer = await udp.handleConnect(address, amount);
}

f();
//let x = udp.signData(address, address, address, amount, round, amount, cid);

