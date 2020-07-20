layui.config({
	base : "js/"
}).use(['form','layer'],function(){
	var form = layui.form(),
		layer = parent.layer === undefined ? layui.layer : parent.layer,
		$ = layui.jquery;
	//调转注册页面
	$("#register").click(function(){
		window.location.href="register.html";
	});
	//调转登录页面
	$("#login").click(function(){
		window.location.href="login.html";
	})
})
