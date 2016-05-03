/**
 * Created by lenovoa on 2015/9/23.
 */
var urlObj={"desktop": "m.13322.com", //192.168.10.78
		"development": "m.1332255.com",
		"production": window.location.host
	}
var server_ip = urlObj["production"].split("m.")[1]?urlObj["production"]:'m.13322.com';    //m.13322.com
var server_host=server_ip.split("m.")[1]?server_ip.split("m.")[1]:'13322.com';  //13322.com
var server_port = "80";  //80,8181
var baseUrl = "http://"+server_ip+":"+server_port+"/mlottery";

var pageSize = 20;
var maxAttentionMatchCount = 30;
var defaultLanguageKey = "zh";//zh: 简体中文，zh-TW: 繁体中文

var asiaLetOdds = "asiaLet";//亚盘
var asiaSizeOdds = "asiaSize";//大小球
var euroOdds = "euro";//欧赔

var websocketUrl = "ws://"+server_ip+"/ws";//ws://"+server_ip+"/ws
var websocketLogin = "happywin";
var websocketPasscode = "happywin";
var websocketDestination = "/topic/USER.topic.app";

var fullMatchesRefreshDelay = 30000;//30s, 全场次延时刷新时间
var oddsConvertToSealAtKeepTime = 89;//比赛时间到89分钟时，赔率转换为封
var websocketAttemptMaxCount = 3;//websocket最大尝试次数
var websocketReconnectPeriod = 10000;//websocket重连间隔时间, 10s
var incrementPollingPeriod = 5000;//增量数据轮询间隔时间,5s
var incrementPollingPeriodDifference = 10000;//增量数据轮询间隔时间差(10s)，大于等于该差值，则重新加载数据。此值要大于incrementPollingPeriod

var apkDownloadUrlPrefix = "http://"+server_ip+"/fileServer/apk/download/";

//视频直播相关
var teamLogoUrl = "http://pic."+server_host+"/icons/teams/100/tm_logo_{teamId}.png";
var liveTVRefreshPeriod = 300000;//视频直播每5分钟刷新数据
var liveMatchPageSize = 20;//视频直播每次加载的赛事场次
var defaultTeamLogoUrl = "http://pic."+server_host+"/icons/teams/100/no_lq.png";

//篮球相关
var baWebsocketDestination = "/topic/USER.topic.basketball";
var basketPageSize=100;   //每次加载赛事场次
var deBsketTeamLogoUrl = "@@IMGURL/ba_teamLogo.png";
var deBsketLeagueLogoUrl = "@@IMGURL/ba_teamLogo.png";

//国际版下载相关
var downUrl="http://"+server_ip;
var enChannel="17e23dcf30474f9d39a1ff2b288a46b8";//英文国际版本
var thChannel="ac29b9091b95bcea065fc30bb1d3f8b6";//泰国官方版本
var inChannel="b11d33eda7b336e554484b27c712a0de";//印尼官方版本
var koChannel="30c9a04ec9ee7d4ccebdec8396a3f049";//韩国官方版本
var viChannel="9bf99a4ee4d28a13c174939804a40638";//越南官方版本

