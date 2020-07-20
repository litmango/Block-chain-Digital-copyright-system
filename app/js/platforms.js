document.write("<script language='javascript' src='/app.js'></script>");
layui.config({
	base : "js/"
}).use(['form','layer'],function(){
	var form = layui.form(),
		layer = parent.layer === undefined ? layui.layer : parent.layer,
		$ = layui.jquery;

	 currentAccount = null;
    //获取平台所有商品
	$("#allGoods").click(function(){
     	getPlatformAccount();
      	//获取平台所有作品
     	 App.getAllGoodsByPlatform(currentAccount);
       return false;
	})
});

//获取经销商账户
function getPlatformAccount(){
 	const getvalArr = getParentUrl().split('?')[1]
      if(isNull(getvalArr)){
      	alert('账户地址异常,跳转登录页面');
      	layer.msg('账户地址异常,跳转登录页面');
      	top.location.href = '/login.html';
      	return;
      }
      const keyValueArr = getvalArr.split('&')
       currentAccount = keyValueArr[0].split('=')[1]
      console.log('当前经销商：'+ currentAccount);
      if(!checkAccount(currentAccount)){
      	layer.msg('账户地址异常,跳转登录页面',{time:3000,btn:'知道了!'});
      	top.location.href = '/login.html';
      	return;
      }
      return;
};
function getParentUrl() { 
    var url = null;
    if (parent !== window) { 
        try {
           url = parent.location.href; 
        }catch (e) { 
           url = document.referrer; 
        } 
     }
     if(isNull(url)){
	url = document.URL.split('?')[1];
     }
     return url;
};
function checkAccount(currentAccount){
	if(isNull(currentAccount)){
	//账户地址为空
	return false;
	}
	return true;
};


//判断是否为null
function isNull(str){
	return str==null||str==""||str=="null";
};
