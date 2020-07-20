const utils = require('./utils')
const $ = require('./jquery.min.js')
module.exports = {
 // 注册经销商
  newDealer: function (currentAccount,ScoreInstance, account) {
    const address = document.getElementById('registerAddress').value
    const password = document.getElementById('registerPassword').value
    ScoreInstance.newDealer(address, password,{ from: account, gas: 3000000 }).then(function () {
      ScoreInstance.NewDealer(function (error,event) {
        console.log(event);
        layer.msg(event.args.message,{time:2000});
        if(event.args.isSuccess){
            //注册成功
            window.location.href='/login.html';
            return;
          }else{
            //注册失败
            return;
          }
      })
    })
  },
  // 经销商登录
  dealerLogin: function (currentAccount,ScoreInstance, account) {
   const address = document.getElementById('loginAddress').value
    const password = document.getElementById('loginPassword').value
     ScoreInstance.loginDealer(address, password, { from: account, gas: 3000000 }).then(function () {
      ScoreInstance.LoginDealer(function (error, event) {
        if (event.args.isSuccess) {//登录成功
           layer.msg('登录成功，正在跳转......',{time:2000});
           console.log(event.args);
           sessionStorage.setItem("role",1);//用户角色【0：作者；1：经销商；2：平台】
         window.location.href = '/home.html?account=' + address
          return;
        }else{
          layer.msg(event.args.message)
          return;
        }
      })
    })
  },
   //经销商查询所有拥有的商品
getAllGoods:function(currentAccount, ScoreInstance, account){
ScoreInstance.getAllGoods.call(currentAccount,{from:account}).then(function(result){
     layer.msg(result[1]);
      $("#goods  tbody").html("");
      if (result.length === 0) {
        alert('空...');
        return;
      }
      console.log('0个参数:'+result[0]);
      if(result[0]){//查询成功
        if(result[2].length<1){
      layer.msg('Oops,没有任何商品!',{time:3000});
        }else{
           let i=0;
       result[2].forEach(e=>{
         //console.log(hexToASCII(Numeric.toHexStringNoPrefix(e)));
         //console.log(StringUtils.newStringUsAscii(e.getValue()));
        var tr;
        tr =  '<td>'+utils.hexCharCodeToStr(e)+'</td>'+'<td>'+result[3][i]+'</td>'
        +'<td>'+utils.hexCharCodeToStr(result[4][i])+'</td>';
        $("#goods").append('<tr>'+tr+'</tr>');
          i++;
       })
        }
      } 
})
},
//经销商授权给平台作品份额
  dealerToPlatform:function(currentAccount, ScoreInstance, account){
    const receivedAddr = document.getElementById('platformAddress').value;
    const goodsID = document.getElementById('goodsID').value;
    const num = parseInt(document.getElementById('transAmount').value);
    if(isNaN(num)||num<=0){
      alert("作品份额非法!");
      return ;
     }
     ScoreInstance.dealToPlatform(currentAccount,receivedAddr,goodsID, num, { from: account, gas: 3000000 }).then(function () {
      ScoreInstance.DealToPlatform(function (error, event) {
        if (!error) {
         layer.msg(event.args.message);
        }
      })
    })
  }
}

