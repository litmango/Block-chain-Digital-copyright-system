const utils = require('./utils.js')
const $ = require('./jquery.min.js')
module.exports = {
   //默认coinbase是作者账户
  authorLogin: function (ScoreInstance, account) {
    const address = document.getElementById('loginAddress').value
    ScoreInstance.getOwner({ from: account }).then(function (result) {
      if (address.localeCompare(result) === 0) {
          //layer.msg('登录成功，正在跳转......',{time:2000,btn:'知道了!'});
           layer.msg('登录成功，正在跳转......');
           sessionStorage.setItem("role",0);//用户角色【0：作者；1：经销商；2：平台】
        window.location.href = '/home.html?account=' + address
      } else {
       // layer.msg('不是作者账户，登录失败');
        alert('不是作者账户，登录失败');
       // window.alert('不是作者账户，登录失败')
      }
    })
  },
  // 作者登记一件作品：默认gas会OOG
  addGoods: function (currentAccount, ScoreInstance, account) {
    const goodId = document.getElementById('goodId').value
    const goodNum = parseInt(document.getElementById('goodNum').value)
     const goodDesc = document.getElementById('goodDesc').value;
     if(goodId==null||goodId==""||goodId=="null"){
      layer.msg("作品ID必填!",{time:2000,btn:'知道了!'});
     // alert("作品ID必填!");
      return;
     }
     if(isNaN(goodNum)||goodNum<=0){
     layer.msg("作品份额非法!",{time:2000,btn:'知道了!'});
    //  alert("作品份额非法!");
      return ;
     }
    ScoreInstance.inputGoods(goodId,goodDesc, goodNum, { from: account, gas: 6000000 }).then(function () {
      ScoreInstance.InputGoods(function (error, event) {
        layer.msg(event.args.message,{time:2000});
        //alert(event.args.message);
      })
    })
  },

   // 作者授权经销商作品
  transferToDealer: function (currentAccount, ScoreInstance, account) {
    const address = document.getElementById('dealerAddress').value;
    const goodId = document.getElementById('goodsID').value;
     const amount = parseInt(document.getElementById('transAmount').value);
     if(address==null||address==""||goodId=="null"){
      layer.msg("经销商地址必填!",{time:2000,btn:'知道了!'});
      return;
     }
     if(isNaN(amount)||amount<=0){
      layer.msg("作品份额非法!",{time:2000,btn:'知道了!'});
      return ;
     }
    ScoreInstance.authorToDealer(address,goodId, amount, { from: account, gas: 6000000 }).then(function () {
      ScoreInstance.AuthorToDealer(function (error,event) {
        layer.msg(event.args.message);
      })
    })
  },
  //作者查询所有已登记作品
getAllGoods:function(currentAccount, ScoreInstance, account){
ScoreInstance.getAllGoods.call(currentAccount,{from:account}).then(function(result){
       layer.msg(result[1],{time:2000});
      $("#goods  tbody").html("");
      if (result.length === 0) {
        alert('空...');
        return;
      }
      if(result[0]){//查询成功
        if(result[2].length<1){
      layer.msg('Oops,没有任何作品!',{time:3000});
        }else{
           let i=0;
       result[2].forEach(e=>{
         //console.log(hexToASCII(Numeric.toHexStringNoPrefix(e)));
         //console.log(StringUtils.newStringUsAscii(e.getValue()));
        var tr;
        tr =  '<td>'+utils.hexCharCodeToStr(e)+'</td>'+'<td>'+result[3][i]+'</td>'
        +'<td>'+web3.toUtf8(result[4][i])+'</td>';
        $("#goods").append('<tr>'+tr+'</tr>');
          i++;
       })
        }
      } 
})
},
//查询指定作品交易记录
getGoodsTranslateLog:function(currentAccount, ScoreInstance, account){
    const goodsID = document.getElementById('goodsID').value;
      if(goodsID==null||goodsID==""||goodsID=="null"){
      layer.msg("作品ID必填!");
      return;
     }
      ScoreInstance.getGoodsTransferProcess.call(currentAccount,goodsID,{from:account}).then(function(result){
     console.log("交易地址:"+currentAccount);
      console.log(result)
      $("#logs  tbody").html("");
     if(!result[0]){
      layer.msg('Oops,'+result[1],{time:3000});
     }else if (result[2].length<1) {
      layer.msg('Oops,没有查询任何交易记录',{time:3000});
     }else{
      layer.msg(result[1]);
      //new Date(parseInt(result[5][i]) * 1000).toLocaleString().replace(new RegExp('/',"gm"),'-')
       let i=0;
       result[2].forEach(e=>{
        if(result[3][i]=='0x0000000000000000000000000000000000000000'){
          i++;
          return true;
        }
        var tr;
        tr =  '<td>'+e+'</td>'+'<td>'+result[3][i]+'</td>'+
        '<td>'+result[4][i]+'</td>'
        +'<td>'+new Date(result[5][i]*1000+ 8 * 3600 * 1000).toJSON().substr(0, 19).replace('T', ' ')+'</td>';
        $("#logs").append('<tr>'+tr+'</tr>');
          i++;
       })}
})
}
};
