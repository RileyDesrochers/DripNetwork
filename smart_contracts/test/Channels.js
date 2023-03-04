const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("Channel", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
  
      const USDC = await ethers.getContractFactory("USDC");
      const usdc = await USDC.deploy(1000000000);
      const Channel = await ethers.getContractFactory("Channel");
      const channel = await Channel.deploy(usdc.address, owner.address, 1);//USDC
  
      return { owner, otherAccount, channel, usdc};
    }
  
    describe("Deployment", function () {
      it("test deploy", async function () {
        const { owner, otherAccount, channel, usdc} = await loadFixture(deploy);//getFactory
        await usdc.approve(channel.address, 1000000000);
        await channel.deposit(1000000000);
        expect(await channel.balanceOf(owner.address)).to.equal(1000000000);
        await channel.transfer(otherAccount.address, 100000)
        expect(await channel.balanceOf(otherAccount.address)).to.equal(100000);
        expect(await channel.balanceOf(owner.address)).to.equal(1000000000-100000);
        await channel.withdrawal(100000)
        expect(await channel.balanceOf(owner.address)).to.equal(1000000000-200000);
        expect(await usdc.balanceOf(owner.address)).to.equal(100000);


        await channel.open(otherAccount.address, 100000)
        let ch = await channel.getChannelByAddresses(owner.address, otherAccount.address);
        expect(await channel.balanceOf(owner.address)).to.equal(1000000000-300000);
        expect(ch.value).to.equal(100000);
        await channel.senderFundChannel(otherAccount.address, 100000);
        ch = await channel.getChannelByAddresses(owner.address, otherAccount.address);
        expect(await channel.balanceOf(owner.address)).to.equal(1000000000-400000);
        expect(ch.value).to.equal(200000);
        //from, address to, address networkProvider, uint256 amount, uint256 round, uint256 marginal, string memory cid
        let amount = 500;
        let round = 0;
        let cid = 'QmY9Q95z6mJA1DTeULHS4vwNMYe8rHwwWTcBD76oYQvFJh';

        const hash = await channel.getMessageHash(owner.address, otherAccount.address, owner.address, amount, round, amount, cid)
        const sig = await owner.signMessage(ethers.utils.arrayify(hash))

        await channel.connect(owner).reciverCollectPayment(owner.address, otherAccount.address, amount, round, amount, cid, sig);
        ch = await channel.getChannelByAddresses(owner.address, otherAccount.address);
        expect(ch.value).to.equal(200000-amount);
        expect(await channel.balanceOf(otherAccount.address)).to.equal(100000+amount);
        expect(ch.round._value).to.equal(1);
      });
  
    
    });
  });
  