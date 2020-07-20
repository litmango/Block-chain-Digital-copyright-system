document.write("<script language='javascript' src='./app.js'></script>");
layui.config({
	base : "js/"
}).use(['form','layer'],function(){
	var form = layui.form(),
		layer = parent.layer === undefined ? layui.layer : parent.layer,
		$ = layui.jquery;
	//注册
	$("#register").click(function(){
 		const address = document.getElementById('registerAddress').value;
 		 const password = document.getElementById('registerPassword').value;
 		  const role = document.getElementById('role').value;
 		  console.log('address:'+address+'\n密码:'+password+'\n角色:'+role);
 		  accountRegister(address,password,role);
		//window.location.href = "../../index.html";
		return false;
	})
});

//账户注册(经销商、平台)
function accountRegister(accountAddr,accountPassword,role){
	if(!checkData(accountAddr,accountPassword,role)){
		//数据校验不通过
		layer.msg('校验不通过');
		return;
	}
	if (role==1) {
		//经销商注册
		App.newDealer(accountAddr);
		return;
	}else if(role == 2){
		//平台注册
		App.newPlatform(accountAddr);
		return;
	}
	layer.msg('账户注册失败!');
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
