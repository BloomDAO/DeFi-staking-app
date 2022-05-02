const InBloom = artifacts.require('InBloom');
const GBL = artifacts.require('GBL')
const DecentralBank = artifacts.require('DecentralBank');


module.exports = async function (deployer, network, accounts){
    // deploy InBloom contract
    await deployer.deploy(InBloom);
    const inbloom = await InBloom.deployed();

    // deploy RDW contract
    await deployer.deploy(GBL);
    // create a constant and wait until the GBL contract is deployed
    const gbl = await GBL.deployed();

    // deploy DecentralBank contract
    await deployer.deploy(DecentralBank, gbl.address, inbloom.address);
    const deBank = await DecentralBank.deployed();

    // transfer all the Reward Tokens - GBL to the DecentralBank address
    await gbl.transfer(deBank.address, '1000000000000000000000000');   

    // distribute 100 InBloom tokens to the investor - this is the second account Ganache
    // accounts[1] the second account from Ganache first 10 accounts - transfer 100 tokens
    await inbloom.transfer(accounts[1], '100000000000000000000');
}
