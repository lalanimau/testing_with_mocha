const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const flush = require('flush-cache')

require('events').EventEmitter.prototype._maxListeners = 100;



const Vega_JSON = require('../build/contracts/VegaCoinCrowdsale.json');

let accounts;
let vega;
let decimals = 1000000000000000000;
let getVar;



// beforeEach(flush)

beforeEach(async () => {
  flush()

  accounts = await web3.eth.getAccounts();
  vega = await new web3.eth.Contract(Vega_JSON.abi)
    .deploy({ data: Vega_JSON.bytecode })
    .send({ from: accounts[0], gas: '5500000' });

});


describe('console', () => {
  
  it('has been deployed successfully', () => {
        assert.ok(vega.options.address);
       
      })

  it('balance of owner is 365M',()=>{
    vega.methods.balanceOf(accounts[0]).call().then(function(data) {
      assert.strictEqual(365000000,data/decimals);
    })
  })      
  it('allows account 1 to send ether to contract',()=>{
    
   web3.eth.sendTransaction({
        from:accounts[1],
        to:vega.options.address, 
        value:web3.utils.toHex(web3.utils.toWei("2", "ether")),
        gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'Gwei')),
          gas: web3.utils.toHex('3000000'),
      }).then(function() {
        web3.eth.getBalance(accounts[1], function (error, result) {
          assert(result/decimals<100);
        });
      });

  })
  it('ethers are raised by contract',()=>{
    
   web3.eth.sendTransaction({
        from:accounts[1],
        to:vega.options.address, 
        value:web3.utils.toHex(web3.utils.toWei("2", "ether")),
        gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'Gwei')),
          gas: web3.utils.toHex('3000000'),
      }).then(function() {
        web3.eth.getBalance(accounts[1], function (error, result) {
          
          vega.methods.totalEtherRaised().call().then(function(data) {
                assert.strictEqual(2,data/decimals);
              })
        });
      });

  })

   it('tokens are transfered to account 1',()=>{

        web3.eth.sendTransaction({
          from:accounts[1],
          to:vega.options.address, 
          value:web3.utils.toHex(web3.utils.toWei("2", "ether")),
          gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'Gwei')),
            gas: web3.utils.toHex('3000000'),
        })
        vega.methods.balanceOf(accounts[1]).call().then(function(data1) {
            assert.strictEqual(10000,data1/decimals);
          })
    })  

    it('tokens are deducted from account 0',()=>{

      web3.eth.sendTransaction({
        from:accounts[1],
        to:vega.options.address, 
        value:web3.utils.toHex(web3.utils.toWei("2", "ether")),
        gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'Gwei')),
          gas: web3.utils.toHex('3000000'),
      }).then(function() {
      vega.methods.balanceOf(accounts[0]).call().then(function(data1) {        
          assert.strictEqual(364990000,data1/decimals);
        })
      });
    })
    it('sets round 2',()=>{

      vega.methods.setCrowdsaleStage("2").send({
        from:accounts[0], 
        gas: 400000
      }).then(function() {
        vega.methods.currentRoundBonus().call().then(function(data1) {          
           assert.strictEqual('20',data1);
        });
      })
    })

   
    it('returns CrowdsaleStage details',()=>{

        vega.methods.setCrowdsaleStage("2").send({
          from:accounts[0], 
          gas: 400000
        }).then(function() {
          vega.methods.getCrowdsaleStage().call().then(function(data) {
            assert.ok(data);
          });
        });
    })
      
    

    it('owner can withdraw ether', ()=>{
  

      web3.eth.sendTransaction({
        from:accounts[1],
        to:vega.options.address, 
        value:web3.utils.toHex(web3.utils.toWei("0.72", "ether")),
        gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'Gwei')),
          gas: web3.utils.toHex('3000000'),
      }).then(function() {

      vega.methods.withdrawEther().send({
        from:accounts[0], 
        gas: 800000
      }).then(function(){
        web3.eth.getBalance(accounts[0], function (result) {
          assert(result/decimals > 100);

         })
      })
        vega.methods.totalEtherRaised().call().then(function(data) {
          assert.strictEqual(0.72,data/decimals);

        })

        
      });

    })

    it('user can refund ether', ()=>{


      vega.methods.refundEther(accounts[1]).send({
        from:accounts[0], 
        gas: 400000
      }).then(function() {
        web3.eth.getBalance(accounts[1], function (result) {
          assert.strictEqual(0.72,result/decimals);

        })
      });


    })
    
    it('able to send bounty tokens', ()=>{

      vega.methods.sendBounty(accounts[1],"444").send({
        from:accounts[0], 
        gas: 400000
      }).then(function() {
        vega.methods.balanceOf("0x453990C0AA4b3C616CEeC05f5D909539920432F4").call().then(function(data1) {
         assert.ok(data1/decimals);

        })
        vega.methods.balanceOf(accounts[1]).call().then(function(data1) {
         assert.strictEqual(444,data1/decimals);

        })
            
      });

    })
  })
  





