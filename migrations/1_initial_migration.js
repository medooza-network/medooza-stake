var Staker = artifacts.require("./Staker.sol");
var ERC20Factory = artifacts.require("./ERC20Factory.sol");
var MockERC20 = artifacts.require("./MockERC20.sol");
const Web3 = require('web3');
require('dotenv').config()


module.exports = async function(deployer, network, accounts) {
  // Sokol
  let depositToken = process.env.DEPOSITTOKEN; // honeyswap MDZA-xDAI Pair
  let rewardToken = process.env.REWARDTOKEN; // TMDZA on sokol
  let AdminAccount = process.env.ADMINACCOUNT;
  /*  // BSC addresses
    let depositToken = '0xdb44c35cd6c378eb9e593d4c7243118064172fb2'; // PancakeSwap V2: ETB
    let rewardToken = '0x7ac64008fa000bfdc4494e0bfcc9f4eff3d51d2a'; // ETB
    */
  // If deploying to dev network, create mock tokens and use them for staking contract.
  if (network == "development") {
    await deployer.deploy(ERC20Factory);
    const erc20factory = await ERC20Factory.deployed();
    await erc20factory.createToken("Medooza Eccosystem", "MDZA");
    await erc20factory.createToken("LP MDZA-XDAI v2 ", "LPToken v2");
    const tokens = await erc20factory.getTokens()
    console.log(tokens);
    const lpToken = await MockERC20.at(tokens[1]);
    await lpToken.mint(accounts[1], Web3.utils.toWei("1000000"));
    await lpToken.mint(accounts[2], Web3.utils.toWei("1000000"));

    depositToken = tokens[1];
    rewardToken = tokens[0];
  } else if (network == "ganache") {
    await deployer.deploy(ERC20Factory);
    const erc20factory = await ERC20Factory.deployed();
    await erc20factory.createToken("LP MDZA-XDAI v2", "LPToken");
    const tokens = await erc20factory.getTokens()
    console.log(tokens);
    await lpToken.mint(AdminAccount, Web3.utils.toWei("1000000")); // mint to admin account
    depositToken = tokens

  } else if (network == "sokol") {
    /* This will create fake depositToken and fund Admin account.
    Fo testing, transfer some depositTokens to user latter */ 
    await deployer.deploy(ERC20Factory);
    const erc20factory = await ERC20Factory.deployed();
    await erc20factory.createToken("LP MDZA-XDAI v2", "LPToken v2");
    const tokens = await erc20factory.getTokens()

    console.log("tokens:" +tokens);
    const lpToken = await MockERC20.at(tokens[0]);
    await lpToken.mint(AdminAccount, Web3.utils.toWei("1000000"));

    depositToken = tokens[0];
    console.log("depositToken:" +depositToken)

  } else {
    await deployer.deploy(Staker, depositToken, rewardToken);
  }
  
  await deployer.deploy(Staker, depositToken, rewardToken);
};
