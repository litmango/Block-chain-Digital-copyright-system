// Import the page's CSS. Webpack will know what to do with it.
import '../stylesheets/app.css'

const author = require('./author')
const dealer = require('./dealer')
const platform = require('./platform')
// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import ScoreArtifacts from '../../build/contracts/Score'

// MetaCoin is our usable abstraction, which we'll use through the code below.
let ScoreContract = contract(ScoreArtifacts)
let ScoreInstance
// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account

window.App = {
  // 获得合约实例
  init: function () {
    // 设置web3连接
    ScoreContract.setProvider(window.web3.currentProvider)
    // Get the initial account balance so it can be displayed.
    window.web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        window.App.setStatus('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        window.App.setStatus('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.')
        return
      }
      accounts = accs
      account = accounts[0]
    })

    ScoreContract.deployed().then(function (instance) {
      ScoreInstance = instance
    }).catch(function (e) {
      console.log(e, null)
    })
  },
  // 作者登录
  authorLogin: function () {
    author.authorLogin(ScoreInstance, account)
  },
//作者登记作品
  addGoods: function(currentAccount){
   author.addGoods(currentAccount, ScoreInstance, account)
  },
  //作者查询所有登记作品
  getAllGoodsByAuthor: function(currentAccount){
    author.getAllGoods(currentAccount,ScoreInstance,account)
  },
  //作者授权作品份额至经销商
  autorToDealer:function(currentAccount){
    author.transferToDealer(currentAccount,ScoreInstance,account)
  },
  //查询指定商品交易记录
  getGoodsTranslateLog:function(currentAccount){
    author.getGoodsTranslateLog(currentAccount,ScoreInstance,account)
  },
  //经销商查询所有作品
  getAllGoodsByDealer: function(currentAccount){
    dealer.getAllGoods(currentAccount,ScoreInstance,account)
  },
  //注册一个经销商
  newDealer:function(currentAccount){
    dealer.newDealer(currentAccount,ScoreInstance,account)
  },
  //经销商登录
  dealerLogin:function(currentAccount){
  dealer.dealerLogin(currentAccount,ScoreInstance,account)
  },
  //经销授权平台份额
  dealerToPlatform:function(currentAccount){
    dealer.dealerToPlatform(currentAccount,ScoreInstance,account)
  },
  //注册一个平台
  newPlatform:function(currentAccount){
    platform.newPlatform(currentAccount,ScoreInstance,account)
  },
  //平台账户登录
  platformLogin:function(currentAccount){
  platform.platformLogin(currentAccount,ScoreInstance,account)
  },
 //平台查询拥有的所有作品
  getAllGoodsByPlatform: function(currentAccount){
    platform.getAllGoods(currentAccount,ScoreInstance,account)
  },
  // 查询所有的区块链账户
  allAccounts: function () {
    let allAccount = ''
    window.web3.eth.accounts.forEach(e => {
       allAccount += e + '<br/>'
       /*allAccount += e + '\n'*/
    })
    window.App.setConsole(allAccount)
  },
  // 状态栏显示
  setStatus: function (message) {
    alert(message);
    const status = document.getElementById('status')
    status.innerHTML = message
  },
  // 显示console
  setConsole: function (message) {
    const status = document.getElementById('console')
    status.innerHTML = message
  }
}

window.addEventListener('load', function () {
  // 设置web3连接 http://127.0.0.1:8545
  window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
  window.App.init()
})
