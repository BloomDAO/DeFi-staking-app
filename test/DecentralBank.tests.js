// const assert = require('console');

const InBloom = artifacts.require('InBloom');
const GBL = artifacts.require('GBL')
const DecentralBank = artifacts.require('DecentralBank');

require('chai').use(require('chai-as-promised')).should();

contract('DecentralBank', ([owner, investor]) =>{
    let inbloom, gbl, decentralBank;

    // helper function
    // convert ether into wei
    function tokens(stringNum){
        return web3.utils.toWei(stringNum, 'ether');
    }

    before( async() =>{
        // load contracts
        inbloom = await InBloom.new();
        gbl = await GBL.new();
        decentralBank = await DecentralBank.new(inbloom.address, gbl.address);

        // transfer 1000000 GBL tokens to DecentralBank 
        await gbl.transfer(decentralBank.address, tokens('1000000'));

        // transfer 100 USDT (Mock InBloom) to investor account (second Ganache account)
        await inbloom.transfer(investor, tokens('100'), {from: owner});
    });

    describe('Mock InBloom Deployment', async() => {
        it('Matches name successfully', async () => {
            const name = await inbloom.name();
            assert.equal(name, 'Mock InBloom Token');
        });
    });

    describe('GBL Deployment', async() => {
        it('Matches name successfully', async () => {
            const name = await gbl.name();
            assert.equal(name, 'Reward Token');
        });
    });

    describe('Decentral Bank Deployment', async() => {
        it('Matches name successfully', async () => {
            const name = await decentralBank.name();
            assert.equal(name, 'Decentral Bank');
        });

        it('Contract has GBL tokens', async () => {
            let balance = await gbl.balanceOf(decentralBank.address);
            assert.equal(balance, tokens('1000000'));
        });
    });

    describe('Yield Farming', async() => {
        it('Rewards tokens for staking', async () => {
            let result;
            // check investor balance
            result = await inbloom.balanceOf(investor);
            assert.equal(result, tokens('100'), 'investor mock inbloom wallet balance BEFORE staking');

            // checking Staking for Investor
            // first approve from Decentral Bank to stake the amount of tokens from investor
            await inbloom.approve(decentralBank.address, tokens('100'), {from: investor});
            // second deposit tokens for staking
            await decentralBank.depositTokens(tokens('100'), {from: investor});

            // check investor updated balance (after depositing tokens with the Decentral Bank)
            result = await inbloom.balanceOf(investor);
            assert.equal(result, tokens('0'), 'investor mock inbloom wallet balance AFTER staking');

            // check the updated balance of the Decentral Bank after staking
            // work both statements
            //result = await decentralBank.stakingBalance(investor);
            result = await inbloom.balanceOf(decentralBank.address);
            assert.equal(result, tokens('100'), 'Decentral Bank wallet balance AFTER staking');

            // check the isStaking status
            result = await decentralBank.isStaking(investor);
            assert.equal(result.toString(), 'true', 'investor is staking status is true');

            // issue GBL tokens
            await decentralBank.issueTokens({from:owner});

            // Only owner can issue tokens
            await decentralBank.issueTokens({from:investor}).should.be.rejected;

            // Unstake tokens
            await decentralBank.unstakedTokens({from:investor});

            // check investor updated balance (after unstaking)
            result = await inbloom.balanceOf(investor);
            assert.equal(result, tokens('100'), 'investor mock inbloom wallet balance AFTER unstaking');

            // check the updated balance of the Decentral Bank after unstaking
            result = await inbloom.balanceOf(decentralBank.address);
            assert.equal(result, tokens('0'), 'Decentral Bank wallet balance AFTER unstaking');

            // check the isStaking status
            result = await decentralBank.isStaking(investor);
            assert.equal(result.toString(), 'false', 'investor is staking status is true');

        });
    });

});
