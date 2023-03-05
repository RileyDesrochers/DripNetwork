const zksync = require("zksync");
const ethers = require("ethers");
require('dotenv').config()

async function f(){
    const syncProvider = await zksync.getDefaultProvider('goerli');
    const ethersProvider = ethers.getDefaultProvider('goerli');
}

f()
console.log("done")
