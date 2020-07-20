const utils = require('./utils')
const $ = require('./jquery.min.js')
module.exports = {
// 注册平台
  newPlatform: function (currentAccount,ScoreInstance, account) {
    const address = document.getElementById('registerAddress').value
    const password = document.getElementById('registerPassword').value
    ScoreInstance.newPlatform(address, password,{ from: account, gas: 3000000 }).then(function () {
      ScoreInstance.NewPlatform(function (error,event) {
        if (!error) {
           layer.msg(event.args.message,{time:2000});
         if(event.args.isSuccess){
            //注册成功
            window.location.href='/login.html';
            return;
          }else{
            //注册失败
            return;
          }
          return;
        }
      })
    })
  },
  // 平台登录
  platformLogin: function (currentAccount,ScoreInstance, account) {
   const address = document.getElementById('loginAddress').value;
    const password = document.getElementById('loginPassword').value;
     ScoreInstance.loginPlatform(address, password, { from: account, gas: 3000000 }).then(function () {
      ScoreInstance.LoginPlatform(function (error, event) {
        if (event.args.isSuccess) {//登录成功
            layer.msg('登录成功，正在跳转......',{time:2000});
            console.log(event.args);
             sessionStorage.setItem("role",2);//用户角色【0：作者；1：经销商；2：平台】
           window.location.href = '/home.html?account=' + address
          return;
        }else{
          layer.msg(event.args.message)
          return;
        }
      })
    })
  },
  //平台查询拥有的所有作品
  getAllGoods:function(currentAccount, ScoreInstance, account){
  ScoreInstance.getAllGoods.call(currentAccount,{from:account}).then(function(result){
      console.log(result)
      $("#goods  tbody").html("");
      if (result.length === 0) {
        alert('空...');
        return;
      }
      if(result[0]){//查询成功
        if(result[2].length<1){
      layer.msg('Oops,没有任何作品!',{time:3000});
        }else{
          layer.msg(result[1],{time:3000});
           let i=0;
       result[2].forEach(e=>{
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
  // 查看当前账户信息
  showCurrentAccount: function (currentAccount) {
    window.App.setStatus(currentAccount)
  }
}
