const unDripPayments = require('./atmospherePayments.js');
//const unDripStorage = require('./unDripStorage.js');
const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const rpc = "http://127.0.0.1:8545/";

const udp = new unDripPayments(rpc, contractAddress);
//const uds = new unDripStorage();

let address = "0x5AdA39e766c416CA083d8c7e43104f2C7cF2194A";
let amount = "50000";
let round = "0";
let cid = "QmY9Q95z6mJA1DTeULHS4vwNMYe8rHwwWTcBD76oYQvFJh";

async function f(){
  const sig = await udp.signData(address, amount, round);
  const signer = await udp.getSigner(address, amount, round, sig);
  console.log(signer)

  //const signer = await udp.handleConnect(address, amount);
}

f();
//let x = udp.signData(address, address, address, amount, round, amount, cid);

