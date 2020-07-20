
pragma solidity ^0.5.0;

contract Utils {

    function stringToBytes32(string memory source)  internal pure  returns (bytes32 result) {
        assembly {
            result := mload(add(source, 32))
        }
    }

    function bytes32ToString(bytes32 x)  internal pure  returns (string memory) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (uint j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }
}

contract Score is Utils {


    address owner; //版权拥有者，作者
    uint issuedScoreAmount; //银行已经发行的积分总数
    uint settledScoreAmount; //银行已经清算的积分总数

    struct Author{//作者
        //Num[] authorGoods;//作者作品数量
        uint num;//作品个数
     
    }
    struct Dealer{//经销商
        address dealerAddr;//经销商地址
        bytes32 password;//经销商密码
        Num[]  dealerGoods;//经销商作品数量
    }
    struct Platform{//大平台
        address platformAddr;//大平台地址
        bytes32 password;//大平台密码
        Num[] platformGoods;//大平台数量
          
    }

    struct Num{
        bytes32 goodsId;//作品Id
        uint    num;//作品数量
    }
    struct Good {
        bytes32 goodId; //作品Id;
        bytes32 goodsDesc;//作品描述
    }
    struct TransferProcess{
        bytes32 goodsId;//作品ID
        address sellerAdr;//卖方地址
        address buyerAdr;//买方地址
        uint   num;//交易数目
        uint transTime;//交易时间
    }
    struct TransferProcesses{
        bytes32 goodsId;
        TransferProcess[] process;
    }
    mapping(bytes32 => Good) good; //根据作品Id查找该件作品
    mapping(bytes32 => TransferProcesses) transferProcess;//根据作品ID查找交易记录
    mapping(address => Platform) platform;//根据平台账户ID查询作户信息
    mapping(address => Dealer) dealer;//根据经销商账户ID查询经销商信息
    mapping(bytes32 => Author) author;//作品ID->作品数量
    mapping(address => bytes32[]) addrGoodsID;//根据账户ID查询拥有的作品IDs(经销商、平台)

    bytes32[] goodsID;//所有作品IDs
    address[] dealers;//已注册经销商组
    address[] platforms;//已注册平台组
    

    //增加权限控制，某些方法只能由合约的创建者调用
    modifier onlyOwner(){
        if (msg.sender == owner) _;
    }

    //构造函数
    constructor() public {
        owner = msg.sender;
    }


    //返回合约调用者地址
    function getOwner() view  public  returns (address) {
        return owner;
    }

    //注册一个平台
    event NewPlatform(address sender,bool isSuccess,string message);
    function newPlatform(address _platformAddr,string memory _password) public{
        //判断是否已经注册
        if(!isPlatformAlreadyRegister(_platformAddr)){
            //还未注册
            platform[_platformAddr].platformAddr = _platformAddr;
            platform[_platformAddr].password = stringToBytes32(_password);
            platforms.push(_platformAddr);
            emit NewPlatform(msg.sender,true,"平台注册成功");
            return;
        }else{//已注册
             emit NewPlatform(msg.sender,false,"该平台已被注册");
        }
    }
    
    //平台登录
    event LoginPlatform(address sender,bool isSuccess,string message);
    function loginPlatform(address _platformAddr,string memory _password) public {
        //判断是否已经注册
        if(isPlatformAlreadyRegister(_platformAddr)){
            if(platform[_platformAddr].password == stringToBytes32(_password)){
                //登录成功
                emit LoginPlatform(msg.sender,true,"登录成功");
                return;
            }else{
                //登录失败
                emit LoginPlatform(msg.sender,false,"登录失败,密码错误！");
            }
        }else{
            emit LoginPlatform(msg.sender,false,"登录失败,该平台尚未注册！");
        }
    }
    //判断一个平台是否已经注册
    function isPlatformAlreadyRegister(address _platformAddr) public view returns (bool) {
        for (uint i = 0; i < platforms.length; i++) {
            if (platforms[i] == _platformAddr) {
                return true;
            }
        }
        return false;
    }
    //注册一个经销商账户
    event NewDealer(address sender,bool isSuccess,string message);
    function newDealer(address _dealerAddr,string memory _password) public {
        //判断是否已经注册
        if(!isDealerAlreadyRegister(_dealerAddr)){
            //还未注册
            dealer[_dealerAddr].dealerAddr=_dealerAddr;
            dealer[_dealerAddr].password=stringToBytes32(_password);
            dealers.push(_dealerAddr);
            emit NewDealer(msg.sender,true,"经销商注册成功");
            return;
        }else{
            emit NewDealer(msg.sender,false,"经销商已被注册");
        }
    }
       //经销商账户登录
    event LoginDealer(address sender,bool isSuccess,string message);
    function loginDealer(address _dealerAddr,string memory _password) public {
        //判断是否已经注册
        if(isDealerAlreadyRegister(_dealerAddr)){
            if(dealer[_dealerAddr].password == stringToBytes32(_password)){
                //登录成功
                emit LoginDealer(msg.sender,true,"登录成功");
                return;
            }else{
                //登录失败
                emit LoginDealer(msg.sender,false,"登录失败,密码错误！");
            }
        }else{
            emit LoginDealer(msg.sender,false,"登录失败,该经销商未注册！");
        }
    }
    //判断一个经销商是否已经注册
    function isDealerAlreadyRegister(address _dealerAddr) public view returns(bool){
         for (uint i = 0; i < dealers.length; i++) {
            if (dealers[i] == _dealerAddr) {
                return true;
            }
        }
        return false;
    }
    
    //作者向经销商授权（只能作者调用）
    event AuthorToDealer(address sender,bool isSuccess,string message);
    function authorToDealer(address _receiver,string  memory  _goodsId, 
            uint _goodsNum) onlyOwner public {
        // _receiver：作者授权的经销商账户，_goodsId：作品ID,_goodsNum:作品的数量
        //判断一个经销商是否已经注册
        if(!isDealerAlreadyRegister(_receiver)){
            //经销商账户不存在
              emit AuthorToDealer(msg.sender,false,"经销商账户不存在！");
              return;
        }
        bytes32 goodsId = stringToBytes32(_goodsId);
        //判断作品是否已存在
        if(!isGoodExisted(goodsId)){
            //作品不存在
            emit AuthorToDealer(msg.sender,false,"作品ID不存在！");
            return;
        }
        if(_goodsNum<=0||_goodsNum> author[goodsId].num){
            //交易数目非法
             emit AuthorToDealer(msg.sender,false,"作品交易数目非法！"); 
            return;
        }
        //遍历该账户已有用的作品IDS
        uint length = addrGoodsID[_receiver].length;
       bytes32[] memory ids = new bytes32[](length+1);
       bool flag = false;//标记是否已存在当前作品（默认不包括）
       for(uint i =0;i<length;i++){
           ids[i] = addrGoodsID[_receiver][i];
           if(ids[i]==goodsId){
               flag = true;
               //当前交易作品ID(多次交易同一作品)，已存在当前数组中。无需继续
               break;
           }
       }
       if(!flag){
           //经销商还未有任何作品或不包括当前作品，将当前作品ID追加到数组中
            ids[length] = goodsId;
            addrGoodsID[_receiver] = ids;
       }
       //将作者作品数减少
       author[goodsId].num -=_goodsNum;
       //将当前作品数追加到经销商
      Num[]  memory dealerGoods=dealer[_receiver].dealerGoods;
      bool flag1 = false;
       for(uint i=0;i<dealerGoods.length;i++){
           if(dealerGoods[i].goodsId == goodsId){
               //当前ID已存在,更新经销商作品数量
               flag1 = true;
               dealer[_receiver].dealerGoods[i].num += _goodsNum;
               break;
           }
       }
       if(!flag1){
           //当前作品ID不存在，需新增至经销商
      dealer[_receiver].dealerGoods.push(Num(goodsId,_goodsNum));
       }
       //记录日志
       transferProcess[goodsId].goodsId = goodsId;
       transferProcess[goodsId].process.push(TransferProcess(goodsId,owner,_receiver,_goodsNum,now));
        emit AuthorToDealer(msg.sender,true,"交易成功！"); 
        return;
    }
    
  //经销商授权给各个平台
  event DealToPlatform(address _dealerAddr,address _platformAddr,string message);
  function dealToPlatform(address _dealerAddr,address _platformAddr,string memory _goodsId,uint _goodsNum) public{
      //判断经销商账户户是否存在
      if(!isDealerAlreadyRegister(_dealerAddr)){
          //经销商账户不存在,中断操作
          emit DealToPlatform(_dealerAddr,_platformAddr,"经销商账户不存在");
          return;
      }
      //判断平台账户是否存在
      if(!isPlatformAlreadyRegister(_platformAddr)){
          //平台不存在，中断操作
          emit DealToPlatform(_dealerAddr,_platformAddr,"平台账户不存在");
          return;
      }
      //判断作品是否已存在
      if(!isGoodExisted(stringToBytes32(_goodsId))){
          //待交易作品ID不存在，中断操作
          emit DealToPlatform(_dealerAddr,_platformAddr,"作品ID不存在");
          return ;
      }
      //判断交易数目是否非法
      if(_goodsNum<=0){
          //判断交易数目非法
           emit DealToPlatform(_dealerAddr,_platformAddr,"交易数目非法");
          return ;
      }
      //判断作品是否属于当前经销商
      Num[] memory gds = dealer[_dealerAddr].dealerGoods;
      if(gds.length<1){
          //当前经销商不存在任何作品，不能进行此交易
           emit DealToPlatform(_dealerAddr,_platformAddr,"作品不属于当前经销商");
          return ; 
      }
      bool flag = false;//记录当前作品是否在当前经销商，判断交易数目是否合法（默认非法）
      bytes32 goodsId = stringToBytes32(_goodsId);
      for(uint i=0;i<gds.length;i++){
          if((gds[i].goodsId==goodsId)&&(gds[i].num>=_goodsNum)){
              flag = true;
              break;
          }
      }
      if(!flag){
          //交易数目非法，或则作品不属于当前经销商
           emit DealToPlatform(_dealerAddr,_platformAddr,"作品不属于当前经销商，或交易数目非法");
          return ;
      }
      
       //遍历平台，是否已有该作品IDS
        uint length = addrGoodsID[_platformAddr].length;
       bytes32[] memory ids = new bytes32[](length+1);
       bool flag1 = false;//标记是否已存在当前作品（默认不包括）
       for(uint i =0;i<length;i++){
           ids[i] = addrGoodsID[_platformAddr][i];
           if(ids[i]==goodsId){
               flag = true;
               //当前交易作品ID(多次交易同一作品)，已存在当前数组中。无需继续
               break;
           }
       }
       if(!flag){
           //平台还未有任何作品或不包括当前作品，将当前作品ID追加到数组中
            ids[length] = goodsId;
            addrGoodsID[_platformAddr] = ids;
       }
       //将经销作品数减少
     Num[] memory dGoods =  dealer[_dealerAddr].dealerGoods;
     for(uint i=0;i<dGoods.length;i++){
         if(dGoods[i].goodsId == goodsId){
              dealer[_dealerAddr].dealerGoods[i].num -=_goodsNum;
              break;
         }
     }
       //将当前作品数追加到平台
      Num[]  memory platgoods=platform[_platformAddr].platformGoods;
      bool flag2 = false;
       for(uint i=0;i<platgoods.length;i++){
           if(platgoods[i].goodsId == goodsId){
               //当前ID已存在,更新平台做品数量
               flag1 = true;
               platform[_platformAddr].platformGoods[i].num += _goodsNum;
               break;
           }
       }
       if(!flag2){
           //当前作品ID不存在，需新增至平台
      platform[_platformAddr].platformGoods.push(Num(goodsId,_goodsNum));
       }
       //记录日志
       transferProcess[goodsId].goodsId = goodsId;
       transferProcess[goodsId].process.push(TransferProcess(goodsId,_dealerAddr,_platformAddr,_goodsNum,now));
        emit DealToPlatform(_dealerAddr,_platformAddr,"交易成功！"); 
       return;
  }
  //通过地址查询所有作品，返回数据：状态、说明、作品ID、作品数目作作品描述
  function getAllGoods(address _address)view public returns(bool,string memory,bytes32[] memory ,uint[] memory,bytes32[] memory){
     bytes32[] memory ids;
     uint[] memory nums;
     bytes32[] memory desc;
     uint  length;
      if(_address==owner){
          //作者查询所有作品详情
          length = goodsID.length;
          ids = new bytes32[](length);
          nums = new uint[](length);
          desc = new bytes32[](length);
          for(uint i=0;i<length;i++){
              ids[i]=goodsID[i];
              nums[i]=author[goodsID[i]].num;
              desc[i]=good[goodsID[i]].goodsDesc;
          }
          return (true,"作者查询作品成功！",ids,nums,desc);
      }
      if(isDealerAlreadyRegister(_address)){
          //经销商账户查询所有作品
          Num[] memory nus = dealer[_address].dealerGoods;
          length = nus.length;
          ids = new bytes32[](length);
          nums = new uint[](length);
          desc = new bytes32[](length);
          for(uint i=0;i<length;i++){
              ids[i] = nus[i].goodsId;
              nums[i] = nus[i].num;
              desc[i] = good[nus[i].goodsId].goodsDesc;
          }
           return (true,"经销商查询作品成功！",ids,nums,desc);
      }
      if(isPlatformAlreadyRegister(_address)){
          //平台账户查询所有作品
           Num[] memory nus = platform[_address].platformGoods;
           length = nus.length;
          ids = new bytes32[](length);
          nums = new uint[](length);
          desc = new bytes32[](length);
          for(uint i=0;i<length;i++){
              ids[i] = nus[i].goodsId;
              nums[i] = nus[i].num;
              desc[i] = good[nus[i].goodsId].goodsDesc;
          }
           return (true,"平台查询作品成功！",ids,nums,desc);
      }
      return(false,"输入的账户不存在",new bytes32[](0),new uint[](0),new bytes32[](0));
  }
   

   

    //作者登记一件作品
    event InputGoods(address sender,bool isSuccess,string message);
   
    function inputGoods(string  memory _goodsId,string memory _goodsDesc,uint _goodsNum)onlyOwner
    public {
        bytes32 goodsId = stringToBytes32(_goodsId);
        bytes32 goodsDesc = stringToBytes32(_goodsDesc);
        if(!isGoodExisted(goodsId)){
         //不存在
           goodsID.push(goodsId);
           author[goodsId].num =_goodsNum;//个数
           good[goodsId].goodId=goodsId;
           good[goodsId].goodsDesc=goodsDesc;
            emit InputGoods(msg.sender, true, "登记新作品成功！");
           }else{
            //已存在
           author[goodsId].num +=_goodsNum;//更新总仓个数
           emit InputGoods(msg.sender, true, "更新作者作品数成功！");
        }
        return;
    }
     //查询作者作品个数
    function getAuthor(string memory _goodsId)view public returns(uint){
        bytes32 id = stringToBytes32(_goodsId);
        if(!isGoodExisted(id)){
            //作品不存在
            return 0;
        }else{
           return author[id].num; 
        }
    }
    //查询作品交易日志(请求字段：账户地址、作品ID；响应字段：查询状态、说明、交易发起发地址、交易接收方地址、交易数量、交易时间)
    function getGoodsTransferProcess(address _owner,string memory _goodsId)view public returns(bool,string memory,address[] memory,address[] memory,uint[] memory,uint[] memory){
       //判断查询作品是否存在
       bytes32 goodsId = stringToBytes32(_goodsId);
       if(!isGoodExisted(goodsId)){
           //作品ID不存在
            return (false,"作品ID不存在！",new address[](1),new address[](1),new uint[](1),new uint[](1));
       }
        TransferProcess[] memory processes = transferProcess[goodsId].process;
            address[] memory senderAdr = new address[](processes.length);//交易发起方
            address[] memory receiverAdr=new address[](processes.length);//交易接收方
            uint[] memory nums=new uint[](processes.length);//交易数目
            uint[] memory transTime=new uint[](processes.length);//交易时间
        //判断账号类型
        if(_owner == owner){
            //账号为作者账号
          for(uint i=0;i<processes.length;i++){
              senderAdr[i]=processes[i].sellerAdr;
              receiverAdr[i]= processes[i].buyerAdr;
              nums[i]=processes[i].num;
              transTime[i]=processes[i].transTime;
          }
           return (true,"查询成功",senderAdr,receiverAdr,nums,transTime);
        }else if(isDealerAlreadyRegister(_owner)){
            //账户为经销商账户
             for(uint i=0;i<processes.length;i++){
                 if(processes[i].sellerAdr!=_owner){
                     //非当前账户发出的交易，自动过滤
                     continue;
                 }
              senderAdr[i]=processes[i].sellerAdr;
              receiverAdr[i]= processes[i].buyerAdr;
              nums[i]=processes[i].num;
              transTime[i]=processes[i].transTime;
          }
           return (true,"查询成功",senderAdr,receiverAdr,nums,transTime);
        }else if(isPlatformAlreadyRegister(_owner)){
            //账户为平台账户，不支持查询
            return (false,"平台账户不支持查询",new address[](0),new address[](0),new uint[](0),new uint[](0));
        }
    }
      //判断作品是否已存在
    function isGoodExisted(bytes32 _goodID) internal view returns (bool) {
        bool isExisted = false;
        for(uint i = 0; i < goodsID.length; i++) {
            if(goodsID[i] == _goodID) {
                return isExisted = true;
            }
        }
        return isExisted;
    }

       

}
