// SPDX-License-Identifier: UNLICENSED
// github.com/MariusVanDerWijden/go-pay
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract Channel {
	using Counters for Counters.Counter;
    //using ECDSA for bytes32;

	mapping(address => uint256) private _balances;
	IERC20 public token;

	//Counters.Counter channelIDs;
	uint64 lockPeriod = 1 days;
	uint8 public decimals = 18;

	enum State {NONEXISTANT,OPEN,LOCKED}

	struct ChannelState {
		uint256 value;
		State state;
		Counters.Counter round;
		uint64 lockTime;
	}

	// channels is a array of channels with the index being the index ID
	//ChannelState[] public channels;
	mapping(address => mapping(address => ChannelState)) channels; //sender => reciver => channel
	mapping(address => address[]) channelReciversBySender;
	mapping(address => address[]) channelSendersByReciver;

	//event Open(uint64 indexed ID, uint256 value);
	event Fund(address indexed from, address indexed to, uint256 amount);
	event Lock(address indexed from, address indexed to, uint64 time);
	event Defund(address indexed from, address indexed to, uint256 amount);
	event Transfer(address from, address to, uint256 amount);
	//FIX add more events

	constructor(address _token) {
        token = IERC20(_token);
    }

	//modifiers--------------------------------------------------------------------------

	modifier requireOpen(address sender, address reciver){
		require(channels[sender][reciver].state == State.OPEN, "Channel is not open");
		_;
	}

	modifier requireLocked(address sender, address reciver){
		require(channels[sender][reciver].state == State.LOCKED, "Channel is not locked");
		_;
	}

	/*modifier requireSender(address sender, address reciver){
		require(channels[id].from == msg.sender, "You are not the channel sender");
		_;
	}

	modifier requireReciver(address sender, address reciver){
		require(channels[id].to == msg.sender, "You are not the channel recipient");
		_;
	}*/

	//deposit and withdrawal functions----------------------------------------------------------------

	function deposit(uint256 amount) public returns (bool){
		address user = msg.sender;
		require(token.transferFrom(user, address(this), amount));
		_balances[user] += amount;

		emit Transfer(address(0), user, amount);

		return true;
	}

	function withdrawal(uint256 amount) public returns (bool){
		address user = msg.sender;
		uint256 Balance = _balances[user];
		require(amount <= Balance);
		unchecked {
			_balances[user] = Balance - amount;
		}
		token.transfer(user, amount);

		emit Transfer(user, address(0), amount);

		return true;
	}

	//ERC20 like functions-----------------------------------------------------------------------------

	function transfer(address to, uint256 amount) public returns(bool){
		address from = msg.sender;
		require(from != address(0), "ERC20: transfer from the zero address");
		require(to != address(0), "ERC20: transfer to the zero address");
		uint256 fromBalance = _balances[from];
		require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
            // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
            // decrementing then incrementing.
            _balances[to] += amount;
        }

		emit Transfer(from, to, amount);

        return true;
    }

	//helpers adn getters------------------------------------------------------------------------

	function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /*function hashState(uint64 id, uint256 amount, uint64 round) internal  returns (bytes32) {
		return keccak256(abi.encodePacked(id, amount, round));
	}*/

	function splitSignature(bytes memory sig) public pure returns(bytes32 r, bytes32 s, uint8 v){
        require(sig.length == 65, "invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

	function getMessageHash(address reciver, uint256 amount, uint64 round) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(reciver, amount, round));
    }

	function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32){
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

	function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address){
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

	function getChannelReciversBySender(address sender) public view returns(address[] memory){
		return channelReciversBySender[sender];
	}

	function getChannelSendersByReciver(address reciver) public view returns(address[] memory){
		return channelSendersByReciver[reciver];
	}

	function getChannelByAddresses(address from, address to) public view returns (ChannelState memory) {
        return channels[from][to];
    }

	//user functions-----------------------------------------------------------------------------

	function open(address to, uint256 value) public {
		uint256 Balance = _balances[msg.sender];
		require(value <= Balance, "you do not have the balance to fund channel");
		require(channels[msg.sender][to].state == State.NONEXISTANT, "channel already opened use senderFundChannel() instead");
		
		unchecked {
			_balances[msg.sender] = Balance - value;
		}

		//uint64 id = uint64(channelIDs.current());

		Counters.Counter memory round;

		channels[msg.sender][to] = ChannelState(value, State.OPEN, round, 0);

		channelReciversBySender[msg.sender].push(to);
		channelSendersByReciver[to].push(msg.sender);

		//channelIDs.increment();
		//channelIDsByAddresses[msg.sender][to] = true;

		emit Fund(msg.sender, to, value);
	}

	function senderFundChannel(address to, uint256 amount) public requireOpen(msg.sender, to){
		uint256 Balance = _balances[msg.sender];
		require(amount <= Balance, "you do not have the balance to fund channel");
		unchecked {
			_balances[msg.sender] = Balance - amount;
			channels[msg.sender][to].value += amount;
		}

		emit Fund(msg.sender, to, amount);
	}

	function senderLock(address to) public requireOpen(msg.sender, to){
		channels[msg.sender][to].state = State.LOCKED;
		uint64 time = uint64(block.timestamp);
		channels[msg.sender][to].lockTime = time;

		emit Lock(msg.sender, to, time);
	}//FIX write sender Unlock function

	function senderWithdrawal(address to) public requireLocked(msg.sender, to){
		uint64 lockTime = channels[msg.sender][to].lockTime;
		require(block.timestamp < lockTime + lockPeriod);

		uint256 amount = channels[msg.sender][to].value;
		channels[msg.sender][to].value = 0;
		_balances[msg.sender] += amount;

		channels[msg.sender][to].state = State.OPEN;//reopen channel

		emit Defund(msg.sender, to, amount);
	}

	//recipient functions-----------------------------------------------------------------------------

	//does no require channel to be open
	function reciverCollectPayment(address from, uint256 amount, uint64 round, bytes memory sig) public {
		require(round == channels[from][msg.sender].round.current());
		require(amount <= channels[from][msg.sender].value);

		//address sender = channels[id].from;
		bytes32 messageHash = getMessageHash(msg.sender, amount, round);
		bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

		require(recoverSigner(ethSignedMessageHash, sig) == from);
		//require(ECDSA.recover(hash, sig) == sender, "invalid signature");
		
		channels[from][msg.sender].value -= amount;
		channels[from][msg.sender].round.increment();
		_balances[msg.sender] += amount;

		emit Defund(from, msg.sender, amount);
	}

	//Testing Only----------------------------

	function airdrop(uint256 amount) public returns(uint256){
		_balances[msg.sender] += amount;
		return _balances[msg.sender];
	}

}