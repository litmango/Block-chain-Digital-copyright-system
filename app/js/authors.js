document.write("<script language='javascript' src='/app.js'></script>");
layui.config({
	base : "js/"
}).use(['form','layer'],function(){
	var form = layui.form(),
		layer = parent.layer === undefined ? layui.layer : parent.layer,
      $ = layui.jquery;
	//作者登记商品
	 currentAccount = null;
	$("#inputGoods").click(function(){
     	getAuthorAccount();
      	//作者登记商品
     	 App.addGoods(currentAccount);
       return false;
	});


	//获取作者所用作品
	$("#allGoods").click(function(){
    	 getAuthorAccount();
      	//获取所有作品
     	 App.getAllGoodsByAuthor(currentAccount);
       return false;
	});

  //作者授权经销商作品
    $("#authorize").click(function(){
       getAuthorAccount();
        //作者授权经销商份额
       App.autorToDealer(currentAccount);
       return false;
  });
     //作者查询作品交易记录
    $("#translateLog").click(function(){
       getAuthorAccount();
        //作者查询作品交易记录
       App.getGoodsTranslateLog(currentAccount);
       return false;
  });

});

//获取作者账户
function getAuthorAccount(){
 	const getvalArr = getParentUrl().split('?')[1]
      if(isNull(getvalArr)){
      	alert('账户地址异常,跳转登录页面');
      	layer.msg('账户地址异常,跳转登录页面');
      	top.location.href = '/login.html';
      	return;
      }
      const keyValueArr = getvalArr.split('&')
       currentAccount = keyValueArr[0].split('=')[1]
      console.log('当前商户：'+ currentAccount);
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
//账户登录(经销商、平台)
function accountRegister(accountAddr,accountPassword,role){
  if(!checkData(accountAddr,accountPassword,role)){
    //数据校验不通过
    layer.msg('校验不通过');
    return;
  }
  if (role==0) {
    //作者登录
    App.authorLogin();
  }else if(role == 1){
    //经销商登录
    App.dealerLogin(accountAddr);
  }else if(role == 1){
    //平台登录
    App.platformLogin(accountAddr);
  }
};

//数据校验
function checkData(accountAddr,accountPassword,role){
  if(isNull(accountAddr)){
  //账户地址为空
  layer.msg("请输入账户地址");
  return false;
}
if(isNull(accountPassword)){
  //账户密码为空
  layer.msg("请输入账户密码");
  return false;
}
if(isNull(role)){
  //账户角色
  layer.msg("账户角色为空");
  return false;
}
return true;
}

//判断是否为null
function isNull(str){
  return str==null||str==""||str=="null";
};
