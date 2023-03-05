// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [owner, otherAccount] = await ethers.getSigners();

  const USDC = await ethers.getContractFactory("USDC");
  const usdc = await USDC.deploy(1000000000);

  await usdc.deployed();

  const Channel = await hre.ethers.getContractFactory("Channel");
  const channel = await Channel.deploy(usdc.address);

  await channel.deployed();
  
  await otherAccount.sendTransaction({
    to: '0x5AdA39e766c416CA083d8c7e43104f2C7cF2194A',
    // Convert currency unit from ether to wei
    value: ethers.utils.parseEther('20')
  })

  console.log(
    `USDC deployed to ${usdc.address}, channel deployed to ${channel.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
