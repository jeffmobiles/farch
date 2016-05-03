/**
 * Created by Administrator on 2016/4/19.
 */

//angular
//    .module("basketball",[])
//    .controller("basketballCon",function($scope){
//        $scope.name = "welcome basket";
//
//        //$scope.$on("$viewContentLoaded",function(){
//        //    swiperInit();
//        //})
//    })
//    // directive..


var fullMatchesRefreshDelay = 30000;//30s, ȫ������ʱˢ��ʱ��
var oddsConvertToSealAtKeepTime = 89;//����ʱ�䵽89����ʱ������ת��Ϊ��
var websocketAttemptMaxCount = 3;//websocket����Դ���
var websocketReconnectPeriod = 10000;//websocket�������ʱ��, 10s
var incrementPollingPeriod = 5000;//����������ѯ���ʱ��,5s
var incrementPollingPeriodDifference = 10000;//����������ѯ���ʱ���(10s)�����ڵ��ڸò�ֵ�������¼������ݡ���ֵҪ����incrementPollingPeriod

var maxAttentionMatchCount = 30;
var urlObj={"desktop": "m.13322.com", //192.168.10.78
    "development": "m.1332255.com",
    "production": window.location.host
}
var server_ip = urlObj["production"].split("m.")[1]?urlObj["production"]:'m.13322.com';    //m.13322.com
var server_host=server_ip.split("m.")[1]?server_ip.split("m.")[1]:'13322.com';  //13322.com
var server_port = "80";  //80,8181
var baseUrl = "http://"+server_ip+":"+server_port+"/mlottery";
define(function (require) {
    var app = require('../app');
    // dynamic load services here or add into dependencies of state config
    // require('../services/usersService');
    app.controller('basketballCon', [ "$http",
        "$scope",
        "$document",
        '$window',
        '$timeout',
        '$interval',
        '$cookieStore',
        '$translate',
        'FindLiveServiceFactory',
        'ResultServiceFactory',
        'ScheduleServiceFactory',
        'AttentionServiceFactory',
        'WebSocket',
        function ($http, $scope, $document, $window, $timeout, $interval, $cookieStore,$translate, FindLiveServiceFactory,
                  ResultServiceFactory,ScheduleServiceFactory,AttentionServiceFactory, WebSocket) {
            var tabsSwiper = null;
            var websocketAttemptCountCookieId = "baWebsocketAttemptCount";
            $scope.tabsSwiperInited = false;
            $scope.$on("$viewContentLoaded", function ($window) {
                $scope.maxAttentionMatchCount = maxAttentionMatchCount;
                $scope.eventLst = {};
                $scope.tabActiveIndex = $scope.getClickedTabsSwiper();
                $scope.showFilterIcon = true;
                var callbacks_list = $('.demo-callbacks ul');
                $(".css_select").selectCss();

                if (!window.WebSocket) {//��֧��websocket
                    $scope.intervalId = $scope.incrementMatchDataPollingIntervalTask();
                } else {
                    $scope.websocketIntervalTask();
                }

                var initialSlide = $scope.getClickedTabsSwiper();
                if(initialSlide == 0) {
                    $scope.initMatchData(initialSlide);
                } else{
                    $scope.initSwiper(initialSlide, false);
                }
            });
            /*****************************�������ܲ�*******************************/
                //swiper����
            $scope.initSwiper = function(initialSlide, loadFindLive) {
                $scope.manualSwitch = false;
                tabsSwiper = new Swiper('#tabs-container', {
                    speed: 300,
                    resistanceRatio: 0,//�ֿ��ʡ���Ե�ֿ����Ĵ�С������ֵԽС�ֿ�Խ��Խ�ѽ�slide�����Ե��0ʱ��ȫ�޷����롣
                    //shortSwipes: false,//���п��ٶ̾�����϶��޷�����Swiper
                    threshold: 50,//�϶����ٽ�ֵ����λΪpx���������������С�ڸ�ֵ���鲻�ᱻ�϶�
                    initialSlide : initialSlide,
                    onInit: function(tabsSwiper) {
                        $scope.tabsSwiperInited = true;
                        $scope.initTabsSwiper(tabsSwiper.activeIndex, loadFindLive);
                    },
                    onSlideChangeStart: function () {
                        if(tabsSwiper != null) {
                            $scope.initTabsSwiper(tabsSwiper.activeIndex, true);
                        }
                    },
                    onSlideChangeEnd: function () {
                    }
                })
                $(".tabs a").on('touchstart mousedown', function (e) {
                    e.preventDefault()
                    $(".tabs .active").removeClass('active')
                    $(this).addClass('active')
                    tabsSwiper.slideTo($(this).index())
                })
                $(".tabs a").click(function (e) {
                    e.preventDefault()
                });
            }
            $scope.getClickedTabsSwiper = function() {
                var baSwiperActiveIndex = 0;
                var baSwiperActiveIndexStr = $scope.getObjectFromSessionStorage("baSwiperActiveIndex");
                if(baSwiperActiveIndexStr != null) {
                    baSwiperActiveIndex = parseInt(baSwiperActiveIndexStr, 10);
                }
                return baSwiperActiveIndex;
            }
            $scope.initTabsSwiper = function(activeIndex, loadFindLive) {
                $(".tabs .active").removeClass('active');
                $(".tabs a").eq(activeIndex).addClass('active');

                $scope.tabActiveIndex = activeIndex;
                $scope.clearMatchData();
                $scope.maxAttentionMatchesCountWarn = false;
                $scope.showLoadingImg();
                //��ʼ������
                if(activeIndex != 0 || loadFindLive == true) {
                    $scope.initMatchData(activeIndex);
                }
                if (!window.WebSocket) {
                    if ($scope.tabActiveIndex == 1 || $scope.tabActiveIndex == 2) {
                        if ($scope.intervalId != null) {
                            $interval.cancel($scope.intervalId);
                        }
                    } else {
                        $scope.intervalId = $scope.incrementMatchDataPollingIntervalTask();
                    }
                }else {
                    if ($scope.tabActiveIndex == 1 || $scope.tabActiveIndex == 2) {
                        if ($scope.websocketIntervalId != null) {
                            $interval.cancel($scope.websocketIntervalId);
                        }
                    } else {
                        if($scope.websocketIntervalId == null) {
                            $scope.websocketIntervalTask();
                        }
                    }
                }
                $scope.putObjectToSessionStorage("baSwiperActiveIndex", activeIndex);
            }
            //loading
            $scope.showLoadingImg = function () {
                $scope.loadingImg = true;
            };

            $scope.hideLoadingImg = function () {
                $scope.loadingImg = false;
            };
            //langulage
            $scope.getLanguage = function () {
                var language = $scope.getObjectFromLocalStorage("language");
                if (language == null) {
                    language = defaultLanguageKey;
                }
                return language;
            };
            $scope.websocketInit = function () {
                if (window.WebSocket) {
                    WebSocket.close();
                    WebSocket.connect(websocketUrl, $scope);
                }
            };

            $scope.websocketClose = function () {
                if (window.WebSocket) {
                    WebSocket.close();
                }
            };
            //localStorage��ز�������
            //����key��localStorage�л�ȡ����
            $scope.getObjectFromLocalStorage = function (key) {
                return localStorage.getItem(key);
            }

            $scope.putObjectToLocalStorage = function (key, value) {
                localStorage.setItem(key, value);
            }

            $scope.removeObjectFromLocalStorage = function (key) {
                localStorage.removeItem(key);
            }

            //sessionStorage��ز�������
            $scope.getObjectFromSessionStorage = function (key) {
                return sessionStorage.getItem(key)
            };

            $scope.putObjectToSessionStorage = function (key, value) {
                sessionStorage.setItem(key, value);
            }

            $scope.removeObjectFromSessionStorage = function (key) {
                sessionStorage.removeItem(key);
            }

            //��ȡָ�����ڶ�ӦΪ�ܼ�
            $scope.initWeekI18n = function() {
                $translate(['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'ERROR_DAY']).then(
                    function (translations) {
                        $scope.getWeek = function (date) {
                            var myxingqi = date.getDay();
                            var text = "";
                            switch (myxingqi) {
                                case 0:
                                    text = translations.SUNDAY;
                                    break;
                                case 1:
                                    text = translations.MONDAY;
                                    break;
                                case 2:
                                    text = translations.TUESDAY;
                                    break;
                                case 3:
                                    text = translations.WEDNESDAY;
                                    break;
                                case 4:
                                    text = translations.THURSDAY;
                                    break;
                                case 5:
                                    text = translations.FRIDAY;
                                    break;
                                case 6:
                                    text = translations.SATURDAY;
                                    break;
                                default:
                                    text = translations.ERROR_DAY;
                            }
                            return text;
                        }
                    }
                );
            };

            //websocket��ʱ����ÿ3s����һ�Σ����ڼ��websocket״̬
            $scope.websocketIntervalTask = function () {
                $scope.websocketIntervalId = $interval(function () {
                    if($scope.tabActiveIndex == 0 || $scope.tabActiveIndex == 3) {
                        var websocketState = WebSocket.state();
                        var count = $scope.getWebsocketAttemptCount();
                        if (websocketState != 1) {
                            if(count >= websocketAttemptMaxCount) {
                                $interval.cancel($scope.websocketIntervalId);
                                $scope.intervalId = $scope.incrementMatchDataPollingIntervalTask();
                            } else {
                                $scope.putObjectToLocalStorage(websocketAttemptCountCookieId, ++count);
                                $scope.websocketClose();
                                $window.location.reload();
                            }
                        } else {
                            if(count != 0) {
                                $scope.putObjectToLocalStorage(websocketAttemptCountCookieId, 0);
                            }
                            if ($scope.intervalId != null) {
                                $interval.cancel($scope.intervalId);
                            }
                        }
                    }
                }, websocketReconnectPeriod);
            }

            $scope.getWebsocketAttemptCount = function() {
                var attemptCount = 0;
                var attemptCountStr = $scope.getObjectFromLocalStorage(websocketAttemptCountCookieId);
                if(attemptCountStr != null) {
                    attemptCount = parseInt(attemptCountStr, 10);
                }
                return attemptCount;
            }

            $scope.incrementMatchDataPollingIntervalTask = function () {
                return $interval(function () {
                    var now = new Date().getTime();
                    if ($scope.incrmentTaskStartTime != null && now - $scope.incrmentTaskStartTime >= incrementPollingPeriodDifference) {
                        $window.location.reload();
                    } else {
                        $scope.incrmentTaskStartTime = now;
                        //IncrementServiceFactory.processIncrementMatchData($scope);
                    }
                }, incrementPollingPeriod);
            };
            $scope.initScroll = function () {
                scrollCount = 0;
                isScrolling = false;
            };
            $scope.loadAttentionMatchCountFromCookie = function () {
                var baAttentionMatchCount = $scope.getObjectFromLocalStorage("baAttentionMatchCount");
                if (baAttentionMatchCount == null) {
                    baAttentionMatchCount = 0;
                } else {
                    baAttentionMatchCount = parseInt(baAttentionMatchCount);
                }
                $scope.baAttentionMatchCount = baAttentionMatchCount;
                if (baAttentionMatchCount == 0) {
                    $scope.showAttentionMatchCount = false;
                } else {
                    $scope.showAttentionMatchCount = true;
                }
            }
            /*****************************���ݲ�*******************************/

                //���ؼ�ʱ�����������̡���ע��ʼ����
            $scope.initMatchData = function (index) {
                $scope.initScroll();
                $scope.noAttentionMatches = false;
                $scope.noFindLiveMatches = false;
                $scope.noInitFindLiveMatches = false;
                $scope.maxAttentionMatchesCountWarn = false;
                $scope.loadAttentionMatchCountFromCookie(); //�ղ�����
                $scope.mdayTimeing0=true;
                $scope.mdayTimeing1=false;
                if(index>0){  //���������̡���ע
                    $scope.mdayTimeing2=false;
                    $scope.mdayTimeing3=false;
                    $scope.mdayTimeing4=false;
                    $scope.mdayTimeing5=false;
                    $scope.mdayTimeing6=false;
                }
                //����������ʾ������Ϣ
                var oddsFilterCookieValue = $scope.getOddsFilterCookieValue();
                if (oddsFilterCookieValue == null) {
                    $scope.oddsFilterCookieValue = 0;//Ĭ�ϲ���ʾ
                } else {
                    $scope.oddsFilterCookieValue = oddsFilterCookieValue;
                }
                $scope.gameList = null;
                $scope.baOddsFilterValue = null;
                $scope.medalScore=true;
                $scope.totalScore=true;
                $scope.singleQuarter=true;
                $scope.hostRanking=true;
                // $scope.middState=false;
                $scope.initMatchFilter(); //����������ʾ������Ϣ
                $scope.initFilterSetValuesI18n();  //��������
                $scope.initBasketballStateI18n();  //����״̬
                $scope.initHandicapValueMap();   //��������չʾת��
                $scope.initWeekI18n();  //����
                echo.init();  //��ʼ�������ط���
                $scope.viewNum=5;  //��ǰ��������Ϊ5��
                if (index == 0) {//��ʱ��������
                    $scope.websocketClose();
                    $scope.loadFindLiveMatchData();
                }else if (index == 1) {//������������
                    $scope.loadResultMatchData();
                    $scope.websocketClose();
                }else if (index == 2) {//����
                    $scope.loadScheduleMatchData();
                    $scope.websocketClose();
                }else if (index == 3) {//��ע
                    $scope.websocketClose();
                    $scope.loadAttentionMatchData();
                }
                $window.document.body.scrollTop = 0;
                setheight();//�������ݸ߶�
            }
            //���ؼ�ʱ��������
            $scope.loadFindLiveMatchData = function () {
                $scope.eventLst = {};
                $scope.goalEventTimeOutList = {};
                $scope.fullThirdIdMap = null;
                $scope.showFilterIcon = true;
                $scope.findLiveMatchesBak = null;
                FindLiveServiceFactory.loadFindLiveMatchData($scope, $cookieStore, $timeout);
            }
            //����������������
            $scope.loadResultMatchData = function () {
                $scope.showFilterIcon = true;
                $scope.resultMatchsBak = null;
                ResultServiceFactory.loadResultMatchData($scope, $cookieStore, true);
            };
            //�������̱�������
            $scope.loadScheduleMatchData = function () {
                $scope.showFilterIcon = true;
                $scope.scheduleMatchsBak = null;
                ScheduleServiceFactory.loadScheduleMatchData($scope, $cookieStore, true);
            };
            //���ع�ע��������
            $scope.loadAttentionMatchData = function () {
                $scope.goalEventTimeOutList = {};
                $scope.showFilterIcon = false;
                var baAttentionThirdIds = $scope.getObjectFromLocalStorage("baAttentionThirdIds");
                AttentionServiceFactory.loadAttentionMatchData($scope, $cookieStore, $timeout, baAttentionThirdIds);
            };
            var isScrolling = false;
            var scrollCount = 0;
            //�������ظ��༴ʱ����
            $scope.loadMoreFindLiveMatches = function () {
                if ($scope.tabActiveIndex != 0 || $scope.loadingImg || isScrolling) {
                    return;
                }
                isScrolling = true;
                var matches = null;
                var todayHasCheckRaceId = $scope.getObjectFromSessionStorage("liveTodayHasCheckLeagueId");
                if (todayHasCheckRaceId != null && todayHasCheckRaceId == "true") {
                    matches = $scope.filterImmediateMatches;
                } else {
                    matches = $scope.findLiveMatchesBak;
                }
                if (matches != null && matches.length > (scrollCount + 1) * basketPageSize) {
                    $scope.loadingImg = true;
                } else {
                    isScrolling = false;
                    $scope.loadingImg = false;
                    return;
                }
                $timeout(function () {
                    if (matches && matches.length > (scrollCount + 1) * basketPageSize) {
                        scrollCount++;
                        var arr = matches.slice(scrollCount * basketPageSize, (scrollCount + 1) * basketPageSize);
                        if (arr.length > 0) {
                            for (var i in arr) {
                                $scope.findLiveMatches.push(arr[i]);
                                $scope.fullThirdIdMap[arr[i].thirdId] = arr[i];
                            }
                        }
                    }
                    isScrolling = false;
                    $scope.loadingImg = false;
                }, 100);
            };

            //����������
            $scope.dayTimeClick=function($event,day){
                if(day){
                    var tabN=$scope.getClickedTabsSwiper();
                    $scope.showLoadingImg();
                    // console.log(day);
                    if(tabN==1){
                        if($scope.resultFirObjBak[day].length==0){
                            $scope.resultFirObjBak[day]=$scope.resultObjBak[day];
                        }
                    }else if(tabN==2){
                        if($scope.scheduleFirObjBak[day].length==0){
                            $scope.scheduleFirObjBak[day]=$scope.scheduleObjBak[day];
                        }
                    }
                }
                var target=$event.currentTarget;
                var today=$(target).attr('data-day');
                var text=$(target).attr('data-text');
                var parentObj=$(target).closest(".white_bg");
                // echo.init(target);  //��ʼ�������ط���
                var mdayCon=parentObj.find("div[ng-show='"+text+"']");
                mdayCon.fadeToggle("fast");  //����Ч��
                switch(text){
                    case 'mdayTimeing0':
                        $scope.mdayTimeing0=!$scope.mdayTimeing0;
                        break;
                    case 'mdayTimeing1':
                        $scope.mdayTimeing1=!$scope.mdayTimeing1;
                        break;
                    case 'mdayTimeing2':
                        $scope.mdayTimeing2=!$scope.mdayTimeing2;
                        break;
                    case 'mdayTimeing3':
                        $scope.mdayTimeing3=!$scope.mdayTimeing3;
                        break;
                    case 'mdayTimeing4':
                        $scope.mdayTimeing4=!$scope.mdayTimeing4;
                        break;
                    case 'mdayTimeing5':
                        $scope.mdayTimeing5=!$scope.mdayTimeing5;
                        break;
                    case 'mdayTimeing6':
                        $scope.mdayTimeing6=!$scope.mdayTimeing6;
                        break;
                }
                var icon=$(target).find('i.icon_up');
                icon.toggleClass("icon_down");
                $scope.hideLoadingImg();
            }
            //ˢ�¼�ʱ�͹�ע����
            $scope.refreshImmediateAndAttentionData = function (data) {
                var refreshData = angular.fromJson(data);
                var rData=refreshData.data;
                // console.log(refreshData);
                var tempMatch = null;
                if (refreshData.type == 100) {//ˢ��״̬��ʱ��
                    if ($scope.tabActiveIndex == 0) {//ˢ�¼�ʱ
                        try {
                            tempMatch = $scope.fullThirdIdMap[refreshData.thirdId];
                        } catch (e) {
                        }
                    } else if ($scope.tabActiveIndex == 3) {//ˢ�¹�ע
                        tempMatch = $scope.attentionThirdIdMap[refreshData.thirdId];
                    }
                    //�곡����ˢ��ҳ��
                    if (rData.matchStatus == "-1") {
                        if(tempMatch){
                            $scope.convertState(tempMatch);  //״̬
                            if(tempMatch.matchScore){
                                //��ֹ�곡���ͱȷ���Ч
                                tempMatch.lFullScore=rData.guestScore;
                                tempMatch.lBackScore=rData.guestScore;
                                tempMatch.rFullScore=rData.homeScore;
                                tempMatch.rBackScore=rData.homeScore;
                                //���ʱ��
                                tempMatch.remainTime=null;
                                tempMatch.matchScore.remainTime=null;
                                // console.log("100----id-"+refreshData.thirdId+"----"+rData.guestScore+"----"+rData.homeScore);
                            }
                            tempMatch.finish=true;  //�곡
                        }
                        // console.log("100---false"+rData.matchStatus+"id==="+refreshData.thirdId);
                        return;
                    }
                    if (tempMatch != null) {
                        $scope.isImm=true;
                        // $scope.middState=false;
                        $scope.refreshStateAndTimeData(rData, tempMatch);
                        $scope.handleScore(tempMatch);  //�ȷ�
                        $scope.basketPoor(tempMatch);  //�ֲ�
                        $scope.convertState(tempMatch);  //״̬
                    }
                } else if (refreshData.type == 101) {//ˢ������
                    if ($scope.tabActiveIndex == 0) {
                        try {
                            tempMatch = $scope.fullThirdIdMap[refreshData.thirdId];
                        } catch (e) {

                        }
                    } else if ($scope.tabActiveIndex == 3) {
                        try {
                            tempMatch = $scope.attentionThirdIdMap[refreshData.thirdId];
                        } catch (e) {

                        }
                    }
                    if (tempMatch != null) {
                        $scope.handleOddsState(tempMatch, rData);
                    }
                } else if (refreshData.type == 102) {//���±仯
                    // console.log("102---"+rData.matchStatus );
                    //ˢ�µ�ǰ����ҳ��
                    $scope.initMatchData($scope.tabActiveIndex);
                }
            }
            //���ԭ��������
            $scope.clearMatchData = function () {
                switch ($scope.tabActiveIndex) {
                    case 0:
                        $scope.clearResultMatchData();  //����
                        $scope.clearScheduleMatchData(); //����
                        $scope.clearAttentionMatchData();  //��ע
                        break;
                    case 1:
                        $scope.clearFindLiveMatchData();
                        $scope.clearScheduleMatchData();
                        $scope.clearAttentionMatchData();
                        break;
                    case 2:
                        $scope.clearFindLiveMatchData();
                        $scope.clearResultMatchData();
                        $scope.clearAttentionMatchData();
                        break;
                    case 3:
                        $scope.clearFindLiveMatchData();
                        $scope.clearResultMatchData();
                        $scope.clearScheduleMatchData();
                        break;
                }
            }

            //��ռ�ʱ��������
            $scope.clearFindLiveMatchData = function () {
                $scope.findLiveMatches = null;
                $scope.findLiveMatchesBak = null;
                $scope.fullThirdIdMap = null;
                $scope.resultThirdIdMap = null;
            }
            //���������������
            $scope.clearResultMatchData = function () {
                $scope.resultObjBak = [];
                $scope.resultFirObjBak=[];
                $scope.filterResMatches = null;
            }

            //������̱�������
            $scope.clearScheduleMatchData = function () {
                $scope.scheduleObjBak=[];
                $scope.scheduleFirObjBak=[];
                $scope.filterScheduleMatches = null;
            }

            //��չ�ע��������
            $scope.clearAttentionMatchData = function () {
                $scope.attentionMatches = null;
            }
            //�ȷִ���
            $scope.handleScore=function(match){
                match.remainTime=null,match.addTime=null;
                var matchObj=match.matchScore,emptyStr="--";
                if (matchObj == null) {
                    //null����
                    match.lFullScore=emptyStr;
                    match.rFullScore=emptyStr;
                    match.totalScore=emptyStr;
                    match.poor=emptyStr;
                    match.halfScore=emptyStr;
                    return;
                }
                match.remainTime=matchObj.remainTime;
                match.addTime=matchObj.addTime;
                //�Ƿ�Ϊ��ʱ��Ϣ
                if(!$scope.isImm){
                    $scope.fullScore(match,matchObj);  //�ܱȷ�
                }
                $scope.secScore(match,matchObj);   //С�ڱȷ�
            }
            //�����ܱȷ�
            $scope.fullScore = function (match,matchObj) {
                var homeScore = matchObj.homeScore;
                var guestScore = matchObj.guestScore;
                if (homeScore != null && guestScore != null) {
                    // match.fullScore = guestScore + ":" + homeScore;
                    match.lFullScore=guestScore;
                    match.rFullScore=homeScore;
                } else {
                    match.lFullScore=0;
                    match.rFullScore=0;
                }
                match.lBackScore=match.lFullScore;
                match.rBackScore=match.rFullScore;
            };
            //����С�ڱȷ�
            $scope.secScore = function (match,matchObj) {
                var homeSecScore=0,guestSecScore=0,home2=0,guest2=0;
                match.middFinish=false;//С�ڱȷ�Ĭ��ֵ
                if(match.matchStatus){
                    switch(match.matchStatus){
                        case 1:
                            homeSecScore=matchObj.home1;
                            guestSecScore=matchObj.guest1;
                            break;
                        case 2:
                            homeSecScore=matchObj.home2;
                            guestSecScore=matchObj.guest2;
                            break;
                        case 3:
                            homeSecScore=matchObj.home3;
                            guestSecScore=matchObj.guest3;
                            break;
                        case 4:
                            homeSecScore=matchObj.home4;
                            guestSecScore=matchObj.guest4;
                            break;
                        case 5:
                            homeSecScore=matchObj.homeOt1;
                            guestSecScore=matchObj.guestOt1;
                            break;
                        case 6:
                            homeSecScore=matchObj.homeOt2;
                            guestSecScore=matchObj.guestOt2;
                            break;
                        case 7:
                            homeSecScore=matchObj.homeOt3;
                            guestSecScore=matchObj.guestOt3;
                            break;
                        default:  //50,-1�г����곡С�ڱȷ�
                            home2=matchObj.home2?matchObj.home2:home2;
                            guest2=matchObj.guest2?matchObj.guest2:guest2;
                            homeSecScore=matchObj.home1+home2;
                            guestSecScore=matchObj.guest1+guest2;
                            match.middFinish=true;//�г�����С�ڱȷ�
                            break;
                    }
                }
                if (homeSecScore || guestSecScore) {
                    match.halfScore = guestSecScore + ":" + homeSecScore;
                } else {
                    match.halfScore = "0:0";
                }
            };
            //״̬ת��
            $scope.convertState = function (match) {
                if (match == null) {
                    return;
                }
                if (match.matchStatus!='0') {
                    // $scope.middState=match.matchStatus=='50'?true:false; //�Ƿ�Ϊ�г�
                    if (match.matchStatus=='-2'||match.matchStatus=='-3'
                        ||match.matchStatus=='-4'||match.matchStatus=='-5') {
                        match.matchState = null;
                    } else { //����-1�곡
                        if (match.section=='2') {
                            if(match.matchStatus=='1'||match.matchStatus=='2'){
                                match.matchStatus='51';  //�ϰ볡
                            }else if(match.matchStatus=='3'||match.matchStatus=='4'){
                                match.matchStatus='52';  //�°볡
                            }
                        };
                        match.matchState = $scope.basketballStateMap[match.matchStatus];
                    }
                    match.matchStateInfo = $scope.basketballStateMap[match.matchStatus];
                }else{
                    match.matchState = null;
                    match.matchStateInfo =null;
                }
            };
            //�ֲ����
            $scope.basketPoor=function(match){
                if(match==null){return;}
                if(match.section){
                    var section=match.section;
                    //С�ڷֲ�
                    var ts=0,homeScore1,guestScore1,homeScore2=0,guestScore2=0,
                        matchObj=match.matchScore,home2=0,guest2=0;
                    if(matchObj){
                        home2=matchObj.home2?matchObj.home2:home2;
                        guest2=matchObj.guest2?matchObj.guest2:guest2;
                        homeScore1=matchObj.home1+home2;
                        guestScore1=matchObj.guest1+guest2;
                        homeScore2=matchObj.homeScore;
                        guestScore2=matchObj.guestScore;
                        if(Number(match.matchStatus)<3&&Number(match.matchStatus)>0){  //1��2�ڱȷ�
                            ts=homeScore1+guestScore1;
                        }else if(Number(match.matchStatus)<5&&Number(match.matchStatus)>2){  //3��4�ڱȷ�
                            ts=(homeScore1+guestScore1)+"/"+(homeScore2+guestScore2);
                        }else{
                            ts=(homeScore1+guestScore1)+"/"+(homeScore2+guestScore2);//�곡���г�
                        }
                        if(ts||homeScore2||guestScore2){
                            match.totalScore=ts;
                            match.poor=homeScore2-guestScore2;
                        }else{
                            match.totalScore=0;
                            match.poor=0;
                        }
                    }
                }
            }
            /**
             * ˢ��״̬��ʱ������
             * @param sourceImmediateMatch  Դ��ʱ��������
             * @param targetImmediateMatch  Ŀ�꼴ʱ��������
             */
            $scope.refreshStateAndTimeData = function (sourceImmediateMatch, targetImmediateMatch) {
                //console.log(sourceImmediateMatch);
                targetImmediateMatch.matchStatus = sourceImmediateMatch.matchStatus;//����״̬
                var matchObj=targetImmediateMatch.matchScore;  //�ȷֶ���
                var array=[],tHomeS=0,tGuestS=0,sHomeS=0,sGuestS=0;
                if(sourceImmediateMatch){
                    if(!matchObj){
                        //ΪNull ����Ĭ��ֵ
                        matchObj=$scope.fieldScore();
                        targetImmediateMatch.matchScore=$scope.fieldScore();
                        targetImmediateMatch.lFullScore=tGuestS;
                        targetImmediateMatch.lBackScore=tGuestS;
                        targetImmediateMatch.rFullScore=tHomeS;
                        targetImmediateMatch.rBackScore=tHomeS;
                        // console.log(targetImmediateMatch);
                    }
                    for(var i in matchObj){ //obj����
                        array.push(i);
                    }
                    tHomeS=matchObj.homeScore,
                        tGuestS=matchObj.guestScore;
                    sHomeS=sourceImmediateMatch.homeScore,
                        sGuestS=sourceImmediateMatch.guestScore;
                    //targetImmediateMatch.addTime=sourceImmediateMatch.addTime;//��ʱ
                    // targetImmediateMatch.section=sourceImmediateMatch.section;//С��
                    if(tHomeS||tGuestS||sHomeS||sGuestS){
                        if(tGuestS!=sGuestS){  //���
                            $scope.animScore(sGuestS,targetImmediateMatch,"left");
                            /*console.log(targetImmediateMatch.thirdId+'-----��������ʽguest-----'
                             +tGuestS+'====='+sGuestS+'=========');*/
                        }
                        if(tHomeS!=sHomeS){  //�ұ�
                            $scope.animScore(sHomeS,targetImmediateMatch,"right");
                            /*console.log(targetImmediateMatch.thirdId+
                             '----��������ʽhome-------'+tHomeS+'------'+sHomeS+'----');*/
                        }
                    }
                    for (var j in array) {
                        if(sourceImmediateMatch[array[j]]){
                            matchObj[array[j]]=sourceImmediateMatch[array[j]];
                        }
                    };
                }
                //console.log(targetImmediateMatch);
            }
            /**
             *�ȷ��ֶ�Ԥ����
             */
            $scope.fieldScore=function(){
                var fieldArr=['addTime','guest1','guest2','guest3','guest4','guestOt1','guestOt2','guestOt3',
                    'guestScore','home1','home2','home3','home4','homeOt1','homeOt2','homeOt3','homeScore','remainTime'];
                var matchScore={};
                for (var i = 0; i < fieldArr.length; i++) {
                    if(fieldArr[i]=='remainTime'){
                        matchScore[fieldArr[i]]=null;
                    }else{
                        matchScore[fieldArr[i]]=0;
                    }
                };
                return matchScore;
            }
            /**
             *�ȷֶ�������
             */
            $scope.animScore=function(score,match,dire){
                var totalScObj=$("span[data-text='"+match.thirdId+"']");
                var scoreObj,frontObj,oldVal;
                if(dire=='left'){
                    scoreObj=totalScObj.find("span").first();  //��ߵķ���

                }else if(dire=='right'){
                    scoreObj=totalScObj.find("span").last();   //�ұߵķ���
                }
                frontObj=scoreObj.find("label.v_front");     //��ǰ��ʾ����
                oldVal=frontObj.attr("data-text");
                // score=score!=null?score:null;
                if(oldVal=="vf"){
                    if(dire=='left'){
                        match.lBackScore=score;
                    }else{
                        match.rBackScore=score;
                    }
                }else{
                    if(dire=='left'){
                        match.lFullScore=score;
                    }else{
                        match.rFullScore=score;
                    }
                }
                //�����ܱȷֶ���Ч��
                // setTimeout(function(){
                frontObj.attr("class","v_back");
                frontObj.siblings().attr("class","v_front");
                // },100);
            }
            /**
             * �Ƴ���ʱ��ǩ�е��곡����
             * @param thirdId   ����id
             */
            $scope.removeResultMatch = function (thirdId) {
                //console.log(thirdId);
                $timeout(function () {
                    if ($scope.findLiveMatches != null && $scope.findLiveMatches.length > 0) {
                        var index = $scope.getImmediateMatchIndex(thirdId, $scope.findLiveMatches);
                        if (index > -1) {
                            $scope.findLiveMatches.splice(index, 1);
                            $scope.fullThirdIdMap[thirdId] == undefined;
                        }
                        index = $scope.getImmediateMatchIndex(thirdId, $scope.findLiveMatchesBak);
                        if (index > -1) {
                            $scope.findLiveMatchesBak.splice(index, 1);
                        }
                        index = $scope.getIndexFromHotImmediateThirdArr(thirdId);
                        if(index > -1) {
                            $scope.hotImmediateMatchThirdArr.splice(index, 1);
                        }
                        $scope.toggleNoImmediateMatchesFlag();
                    }
                }, 60000);
            }
            $scope.getImmediateMatchIndex = function (thirdId, findLiveMatches) {
                for (var i in findLiveMatches) {
                    if (thirdId == findLiveMatches[i].thirdId) {
                        return i;
                    }
                }
                return -1;
            }
            //��cookie�л�ȡ��ѡ��������������
            $scope.getCheckedRaceIdArrFromCookie = function () {
                var checkedRaceIdList = null;
                if ($scope.tabActiveIndex == 0) {
                    checkedRaceIdList = $scope.getObjectFromSessionStorage("checkedLiveLeagueIdList");
                } else if ($scope.tabActiveIndex == 1) {
                    checkedRaceIdList = $scope.getObjectFromSessionStorage("checkedResultLeagueIdList");
                } else if ($scope.tabActiveIndex == 2) {
                    checkedRaceIdList = $scope.getObjectFromSessionStorage("checkedScheduleLeagueIdList");
                }else if ($scope.tabActiveIndex == 3) {
                    checkedRaceIdList = $scope.getObjectFromSessionStorage("checkedAttentionLeagueIdList");
                }
                var checkedRaceIdArr = [];
                if (checkedRaceIdList != null) {
                    checkedRaceIdArr = checkedRaceIdList.split(",");
                }
                return checkedRaceIdArr;
            }
            //��ȡ��������ThirdId����
            $scope.getHotThirdIdArr = function () {
                var hotThirdIdArr = [];
                var curGame = null;
                for (var i in $scope.gameList) {
                    curGame = $scope.gameList[i];
                    if (curGame.hot) {
                        //for (var j in curGame.thirdIds) {
                        hotThirdIdArr = hotThirdIdArr.concat(curGame.thirdIds);
                        //};
                    }
                }
                return hotThirdIdArr;
            }

            //�Ƿ����ű���
            $scope.isHotMatch = function(thirdId) {
                var hotThirdIdArr = $scope.getHotThirdIdArr();
                if(hotThirdIdArr.indexOf(thirdId) > -1 ) {
                    return true;
                }
                return false;
            }
            $scope.getIndexFromHotImmediateThirdArr = function(thirdId) {
                for (var i in $scope.hotImmediateMatchThirdArr) {
                    if (thirdId == $scope.hotImmediateMatchThirdArr[i]) {
                        return i;
                    }
                }
                return -1;
            }
            $scope.toggleNoImmediateMatchesFlag = function() {
                var raceIdArr = $scope.getCheckedRaceIdArrFromCookie();
                if(raceIdArr == null ||  raceIdArr.length == 0) {//���û��ѡ��ɸѡ����
                    //���������������
                    var hotThirdIdArr = $scope.hotImmediateMatchThirdArr;
                    if(hotThirdIdArr != null && hotThirdIdArr.length > 0) {
                        $scope.noFindLiveMatches = false;
                        $scope.noInitFindLiveMatches = false;
                    } else {
                        if($scope.immediateMatchesBak == null || $scope.immediateMatchesBak.length == 0) {
                            $scope.noFindLiveMatches = false;
                            $scope.noInitFindLiveMatches = true;
                        } else {
                            $scope.toggleNoImmediateMatches();
                            $scope.noInitFindLiveMatches = false;
                        }
                    }
                } else { //��ɸѡ����
                    $scope.toggleNoImmediateMatches();
                    $scope.noInitFindLiveMatches = false;
                }
            }
            $scope.toggleNoImmediateMatches = function () {
                if ($scope.findLiveMatches == null || $scope.findLiveMatches.length == 0) {
                    $scope.noFindLiveMatches = true;
                } else {
                    $scope.noFindLiveMatches = false;
                }
            };
            $scope.toggleNoResultMatches = function () {
                if ($scope.resultMatches) {
                    $scope.noResultMatches = true;
                } else {
                    $scope.noResultMatches = false;
                }
            };
            $scope.toggleNoScheduleMatches = function () {
                if ($scope.scheduleMatches) {
                    $scope.noScheduleMatches = true;
                } else {
                    $scope.noScheduleMatches = false;
                }
            };
            //���ʴ���
            $scope.convertHandicapValue = function (matchOdds) {
                if (matchOdds == null) {
                    return;
                }
                var props = Object.getOwnPropertyNames(matchOdds),odds;
                if (props != null && props.length > 1) {
                    for (var i in props) {
                        //�������ʹ�˾��ʾ��ŷ�����⴦��
                        if(matchOdds[props[i]]){
                            if(props[i]==euroOdds){
                                odds = matchOdds[props[i]].euro;
                            }else{
                                odds = matchOdds[props[i]].crown?matchOdds[props[i]].crown:null; //ȡ�ʹڵ�����
                            }
                            matchOdds[props[i]].oddsObj=odds?odds:null;
                            $scope.convertHandicapValueSelf(odds);
                        }
                    }
                }
            }

            $scope.convertHandicapValueSelf = function (odds) {
                if (odds == null) {
                    return;
                }
                var handicap = odds.handicap;
                // $scope.currOdd=handicap?handicap:null;
                odds.handicapValueOrigin = odds.handicapValue;
                $scope.convertOdds(odds);
            }
            //����������ʾ����
            $scope.convertOdds = function (odds) {
                var handicapValueMap = $scope.handicapValueMap;
                if (null == odds) {
                    return;
                }
                var mediumOdds = odds.handicapValue;
                if (null == mediumOdds&&odds.handicap!=euroOdds) {
                    return;
                }
                var mediumOddsVal ="";
                //ŷ�����⴦��
                if(odds.handicap!=euroOdds){
                    var mediumOddsFloat = parseFloat(mediumOdds);
                    if (!isNaN(mediumOddsFloat)) {
                        mediumOddsVal = mediumOddsFloat.toFixed(1);
                    }
                }
                var handicapValue = handicapValueMap[odds.handicap];
                if(odds.handicap==asiaLetOdds){
                    mediumOddsVal=-mediumOddsVal;
                    if(mediumOddsVal>0){
                        handicapValue=handicapValue+"+";
                    }
                    mediumOddsVal = mediumOddsVal.toFixed(1); //������ת��ʱ��ʧ��С��0
                }
                handicapValue = handicapValue + mediumOddsVal;
                odds.handicapValue = handicapValue;
                odds.mediumOdds = handicapValue;
            }
            //���̴���
            $scope.handleSeal = function (match) {
                if (match == null||match.matchOdds == null) {
                    return;
                }
                var props = Object.getOwnPropertyNames(match.matchOdds);
                var odds = null;
                for (var i in props) {
                    //�������ʹ�˾��ʾ��ŷ�����⴦��
                    if(match.matchOdds[props[i]]){
                        if(props[i]==euroOdds){
                            odds = match.matchOdds[props[i]].euro;
                        }else{
                            odds = match.matchOdds[props[i]].crown; //ȡ�ʹڵ�����
                        }
                        if (odds) {
                            //���̴���
                            odds.seal = false;
                            if (odds.handicap == euroOdds) {//ŷ��
                                if ($scope.isSealFlag(odds.leftOdds)&& $scope.isSealFlag(odds.rightOdds)) {
                                    odds.seal = true;
                                }
                            } else if (odds.handicap == asiaLetOdds || odds.handicap == asiaSizeOdds) {
                                if ($scope.isSealFlag(odds.leftOdds) && $scope.isSealFlag(odds.handicapValue)
                                    && $scope.isSealFlag(odds.rightOdds)) {
                                    odds.seal = true;
                                }
                            }
                            match.matchOdds[props[i]].oddsObj = odds;
                        }
                    }
                }
            }

            $scope.isSealFlag = function (oddsValue) {
                // oddsValue == null ||
                if ( oddsValue == '' || oddsValue == '-' || oddsValue == '|') {
                    return true;
                }
                return false;
            }
            //�������ʣ��������������̡��̿�ת���ȡ�
            $scope.handleOddsState = function (match, refreshData) {
                if (match.matchOdds != null) {
                    var oddsType,odds;
                    for (var i in refreshData) {
                        //�������ʹ�˾��ʾ��ŷ�����⴦��
                        if(refreshData[i]){
                            if(i==euroOdds){
                                odds = refreshData[i].euro;
                            }else{
                                odds = refreshData[i].crown?refreshData[i].crown:null; //ȡ�ʹڵ�����
                            }
                            oddsType = i;
                            var oldOdd = match.matchOdds[oddsType]?match.matchOdds[oddsType].oddsObj:null;
                            var newOdd = odds;
                            if(newOdd){
                                // $scope.currOdd=newOdd;
                                oldOdd=oldOdd?oldOdd:{};
                                newOdd = $scope.fixedOddsValue(newOdd, 2);//�����������ٱȽϣ��������� �仯��Ƶ��
                                oldOdd.leftOdds = newOdd.leftOdds?newOdd.leftOdds:null;
                                oldOdd.rightOdds = newOdd.rightOdds?newOdd.rightOdds:null;
                                oldOdd.mediumOdds = newOdd.mediumOdds;
                                oldOdd.handicapValue = oldOdd.mediumOdds;
                                oldOdd.handicap=oddsType;
                                //���̴���
                                oldOdd.seal = false;
                                if (oldOdd.seal == false) {
                                    if (oddsType == euroOdds) {//ŷ��
                                        if ($scope.isSealFlag(oldOdd.leftOdds) && $scope.isSealFlag(oldOdd.rightOdds)) {
                                            oldOdd.seal = true;
                                        }
                                    } else if (oddsType == asiaLetOdds || oddsType == asiaSizeOdds) {
                                        if ($scope.isSealFlag(oldOdd.leftOdds) && $scope.isSealFlag(oldOdd.handicapValue)
                                            && $scope.isSealFlag(oldOdd.rightOdds)) {
                                            oldOdd.seal = true;
                                        }
                                    }
                                }
                                //�̿�ת��
                                $scope.convertHandicapValueSelf(oldOdd);
                                // console.log(oldOdd);
                            }
                            if(match.matchOdds[oddsType]){
                                match.matchOdds[oddsType].oddsObj = oldOdd;
                            }
                        }
                    }
                }
            }
            //��ʽ������ֵ������2λС��������ĺ��油0������3λ�ģ��������롣
            //handleOddsStateר�á�
            $scope.fixedOddsValue = function (odds, num) {
                if (odds == null) {
                    return;
                }
                if (num == undefined || num == null) {
                    num = 2;//Ĭ�ϱ���2λС��
                }
                if (odds.leftOdds != null) {
                    var leftOddsFloat = parseFloat(odds.leftOdds);
                    if (!isNaN(leftOddsFloat)) {
                        odds.leftOdds = leftOddsFloat.toFixed(num);
                    }
                }
                if (odds.handicapValue != null) {
                    var mediumOddsFloat = parseFloat(odds.handicapValue);
                    if (!isNaN(mediumOddsFloat)) {
                        odds.mediumOdds = mediumOddsFloat.toFixed(num);
                    }
                }
                if (odds.rightOdds != null) {
                    var rightOddsFloat = parseFloat(odds.rightOdds);
                    if (!isNaN(rightOddsFloat)) {
                        odds.rightOdds = rightOddsFloat.toFixed(num);
                    }
                }
                return odds;
            }
            /*****************************���ݽ�����*******************************/
                //��ӵ���ע
            $scope.addToAttention = function ($event) {
                $scope.addShoping($event, $scope, $cookieStore);
            };
            $scope.addShoping = function (e) {
                var self = this,
                    $shop = $('.J-shoping'),
                //$title=$('.J-shoping-title'),
                    $body = $('.J-shoping-body'),
                    $num = $('.J-shoping-num'),
                    $close = $('.J-shoping-close');
                e.stopPropagation();
                var $target = $(e.target);
                var id = $target.attr('id');
                var dis = $target.attr('isClicked');
                var thirdId = $target.attr("thirdId");
                var matchText=$target.parent().attr('ng-show');  //��ǰ���ڱ�ʾ
                var matchLen=$target.closest('.white_bg').find("i[data-con='"+matchText+"']").length;
                var x = $target.offset().left - 25,
                    y = $target.offset().top + 20,
                    X = $shop.offset().left + $shop.width() / 2 - $target.width() / 2 + 10,
                    Y = $shop.offset().top;
                var baAttentionThirdIds = $scope.getObjectFromLocalStorage("baAttentionThirdIds");
                var baAttentionMatchCount = $scope.getObjectFromLocalStorage("baAttentionMatchCount");
                var count = 0;
                if (baAttentionMatchCount != null) {
                    count = parseInt(baAttentionMatchCount);
                }
                if (dis == "false" || dis == "") {
                    var attentionThirdIdArr = [];
                    if (baAttentionThirdIds == null) {
                        attentionThirdIdArr.push(thirdId);
                        $scope.putObjectToLocalStorage("baAttentionThirdIds", thirdId + ",");
                        $scope.putObjectToLocalStorage("baAttentionMatchCount", ++count);
                    } else {
                        attentionThirdIdArr = baAttentionThirdIds.split(",");
                        if (attentionThirdIdArr.indexOf(thirdId) == -1) {
                            if (count < maxAttentionMatchCount) {
                                $scope.putObjectToLocalStorage("baAttentionThirdIds", baAttentionThirdIds + thirdId + ",");
                                $scope.putObjectToLocalStorage("baAttentionMatchCount", ++count);
                            } else {
                                $scope.maxAttentionMatchesCountWarn = true;
                                if ($scope.attentionWarnTimeout != null) {
                                    $timeout.cancel($scope.attentionWarnTimeout);
                                }
                                $scope.attentionWarnTimeout = $timeout(function () {
                                    $scope.maxAttentionMatchesCountWarn = false;
                                }, 3000);
                                return;
                            }
                        }
                    }
                    $target.attr('isClicked', true);
                    $target.addClass('icon_slt');
                    $scope.baAttentionMatchCount = count;
                    $scope.showAttentionMatchCount = true;
                    if ($('#floatOrder').length <= 0) {
                        $('body').append('<div id="floatOrder"><img src="images/xingxing.png" width="30" height="28" /></div>');
                    }

                    var $obj = $('#floatOrder');
                    if (!$obj.is(':animated')) {
                        $obj.css({'left': x, 'top': y}).animate({'left': X, 'top': Y - 25}, 370, function () {
                            $obj.stop(false, false).animate({'top': Y - 20, 'opacity': 0}, 370, function () {
                                $obj.fadeOut(100, function () {
                                    $obj.remove();
                                    //$target.attr('isClicked', true);
                                    //$target.addClass('icon_slt');
                                    //var l = $('.J-shoping-list').length;
                                    //    //num = Number($num.text());
                                    if (l < 5) {
                                        //$body.prepend('<div class="J-shoping-list" data-id="' + 10 + '"><a href="#"title=""><img src="../../images/xingxing.png" width="30" height="28" /></a></div>');
                                    }
                                    //$num.text(num + 1);
                                    //$scope.toggleAttentionClicked();
                                });
                            });
                        });
                    }
                } else {
                    if (baAttentionThirdIds != null) {
                        baAttentionThirdIds = baAttentionThirdIds.replace(thirdId + ",", "");
                        $scope.putObjectToLocalStorage("baAttentionThirdIds", baAttentionThirdIds);
                        $scope.putObjectToLocalStorage("baAttentionMatchCount", --count);
                    }

                    $target.removeClass('icon_slt');
                    var l = $('.J-shoping-list').length;
                    if (count == 0) {
                        $scope.showAttentionMatchCount = false;
                        if ($scope.tabActiveIndex == 3) {
                            $scope.noAttentionMatches = true;
                        }
                    }
                    if (count < maxAttentionMatchCount) {
                        $scope.maxAttentionMatchesCountWarn = false;
                    }
                    $scope.baAttentionMatchCount = count;
                    var helperArray = [];
                    for (var i in $scope.attentionMatches) {
                        if ($scope.attentionMatches[i].thirdId != thirdId) {
                            //��ǰ����ֻ��һ������
                            if(matchLen==1&&$scope.attentionMatches[i].dayText==matchText){
                                //console.log($scope.attentionMatches[i].dayText);
                            }else{
                                helperArray.push($scope.attentionMatches[i]);
                            }
                        }
                    }
                    // console.log(helperArray);
                    $scope.attentionMatches = helperArray;

                    $target.attr('isClicked', false);
                }
            }
            $scope.attentionWarnCloseClick = function ($event) {
                $scope.maxAttentionMatchesCountWarn = false;
            }
            //ɸѡ�����õ���
            $scope.filterSetWindowClick = function ($event) {
                angular.element($("html")).addClass("body_h");
                angular.element($("body")).addClass("body_h");
                angular.element($("#sort_content")).addClass("show");
                var index = $($event.target).parent().index();
                if (index == 0) {
                    angular.element($(".asort")).eq(0).addClass('show');
                    angular.element($(".asort")).eq(1).removeClass('show');
                } else {
                    angular.element($(".asort")).eq(1).addClass('show');
                    angular.element($(".asort")).eq(0).removeClass('show');
                }
                //����ɸѡ��ʼ��,��ע��ɸѡ
                if($scope.tabActiveIndex != 3){
                    $scope.initGameFilter();
                }
                //���ô��ڲ�����ʼ��
                $scope.initSetParams();
                if ($scope.tabActiveIndex == 0) {//��ʱ
                    $scope.showMatchFilterDiv = true;
                }else if ($scope.tabActiveIndex == 1) {//����
                    $scope.showMatchFilterDiv = true;
                }else if ($scope.tabActiveIndex == 2) {//����
                    $scope.matchFilterLiClicked = true;
                    $scope.showMatchFilterDiv = true;
                }else if ($scope.tabActiveIndex == 3) {//��ע

                }
                // echo.init();  //��ʼ�������ط���
            };
            $scope.initFilterSetValuesI18n = function () {
                $scope.initMatchFilterValues();
                $scope.initOddsFilterValues();
            };
            //��cookie�л�ȡ������ʾ����
            $scope.getOddsFilterCookieValue = function () {
                var cookieId = "baOddsFilterValue";
                var baOddsFilterValue = null;
                if (cookieId != null) {
                    baOddsFilterValue = $scope.getObjectFromLocalStorage(cookieId);
                }
                return baOddsFilterValue;
            }
            //������ʾѡ��
            $scope.initMatchFilterValues = function () {
                $translate(['MEDAL_SCORE', 'TOTAL_SCORE','SINGLE_QUARTER', 'HOST_RANKING']).then(
                    function (translations) {
                        $scope.sampleMatchFilterValues = [
                            {"name":'medalScore',"html": translations.MEDAL_SCORE, "clicked": true},
                            {"name":'totalScore',"html": translations.TOTAL_SCORE,"clicked": false},
                            {"name":'singleQuarter',"html": translations.SINGLE_QUARTER, "clicked": true},
                            {"name":'hostRanking',"html": translations.HOST_RANKING, "clicked": true}
                        ];
                    }
                );
            }
            //������ʾ��ʼ��
            $scope.initOddsFilterValues = function () {
                $translate(['ODDS_ASIAN', 'ODDS_SIZE', 'ODDS_EUROPE', 'ODDS_HIDE']).then(
                    function (translations) {
                        $scope.sampleOddsFilterValues = [
                            {"name": translations.ODDS_ASIAN, "value": asiaLetOdds, "checked": false},
                            {"name": translations.ODDS_EUROPE, "value": euroOdds, "checked": false},
                            {"name": translations.ODDS_SIZE, "value": asiaSizeOdds, "checked": false},
                            {"name": translations.ODDS_HIDE, "value": '0', "checked": false}
                        ];
                    }
                );
            }

            //��������
            $scope.initBasketballStateI18n = function () {
                $translate(['STATE_NOTSTART', 'STATE_FIRST','STATE_SECOND','STATE_THIRD','STATE_FOURTH',
                    'STATE_OVERTIME','STATE_OVERTIME2','STATE_OVERTIME3', 'STATE_FINISH', 'STATE_CANCEL',
                    'STATE_UNDETERMINED', 'STATE_INTERRUPT', 'STATE_DELAY','STATE_MIDFIELD','STATE_FIRSTHALF','STATE_LASTHALF'
                ]).then(function (translations) {
                    $scope.basketballStateMap = {};
                    $scope.basketballStateMap['0'] = translations.STATE_NOTSTART;
                    $scope.basketballStateMap['1'] = translations.STATE_FIRST;
                    $scope.basketballStateMap['2'] = translations.STATE_SECOND;
                    $scope.basketballStateMap['3'] = translations.STATE_THIRD;
                    $scope.basketballStateMap['4'] = translations.STATE_FOURTH;
                    $scope.basketballStateMap['5'] = translations.STATE_OVERTIME;
                    $scope.basketballStateMap['6'] = translations.STATE_OVERTIME2;
                    $scope.basketballStateMap['7'] = translations.STATE_OVERTIME3;
                    $scope.basketballStateMap['-1'] = translations.STATE_FINISH;
                    $scope.basketballStateMap['-2'] = translations.STATE_UNDETERMINED;
                    $scope.basketballStateMap['-3'] = translations.STATE_INTERRUPT;
                    $scope.basketballStateMap['-4'] = translations.STATE_CANCEL;
                    $scope.basketballStateMap['-5'] = translations.STATE_DELAY;
                    $scope.basketballStateMap['50'] = translations.STATE_MIDFIELD;
                    $scope.basketballStateMap['51'] = translations.STATE_FIRSTHALF;
                    $scope.basketballStateMap['52'] = translations.STATE_LASTHALF;
                });
            };
            //��������չʾ��ʼ��
            $scope.initHandicapValueMap = function () {
                $translate(['BA_RESULTS', 'BA_HOMETEAM', 'BA_TOTAL']).then(
                    function (translations) {
                        $scope.handicapValueMap = {};
                        $scope.handicapValueMap[euroOdds] = translations.BA_RESULTS;
                        $scope.handicapValueMap[asiaLetOdds] = translations.BA_HOMETEAM;
                        $scope.handicapValueMap[asiaSizeOdds] = translations.BA_TOTAL;
                    }
                );
            }
            //���ô��ڲ�����ʼ��
            $scope.initSetParams = function () {
                //������ʾ��ʼ��
                var baOddsFilterValue = $scope.getOddsFilterCookieValue();//������ʾ����
                if (baOddsFilterValue == null) {
                    baOddsFilterValue = 0;//Ĭ��Ϊ��
                }
                $scope.baOddsFilterValue = baOddsFilterValue;
                $scope.baOddsFilterValues = angular.copy($scope.sampleOddsFilterValues);
                var oddsFilter = null;
                for (var i in $scope.baOddsFilterValues) {
                    oddsFilter = $scope.baOddsFilterValues[i];
                    if (oddsFilter.value == baOddsFilterValue) {
                        oddsFilter.checked = true;
                    } else {
                        oddsFilter.checked = false;
                    }
                }
                //������ʾ��ʼ��
                $scope.initMatchFilter();
                $(".css_select").selectCss();
            }
            //��ʼ��������ʾ
            $scope.initMatchFilter = function () {
                var isMedal=$scope.matchChecked("medalScore"); //��/ȫ���ܷ�
                $scope.medalScore = isMedal;
                var isTotal=$scope.matchChecked("totalScore"); //�ֲܷ�
                $scope.totalScore = isTotal;
                var isSingle=$scope.matchChecked("singleQuarter"); //���ڵ÷�
                $scope.singleQuarter = isSingle;
                var isHost=$scope.matchChecked("hostRanking"); //���͡�����
                $scope.hostRanking = isHost;
                var matchArr=[isMedal,isTotal,isSingle,isHost];
                $scope.matchFilterValues = angular.copy($scope.sampleMatchFilterValues);
                var matchFilter = null;
                for (var j in $scope.matchFilterValues) {
                    matchFilter = $scope.matchFilterValues[j];
                    matchFilter.clicked=matchArr[j];
                }
            }
            //��ʼ������ѡ���Ƿ�ѡ��
            $scope.matchChecked=function(matchName){
                var isMedalScore = $scope.getObjectFromLocalStorage(matchName);
                if (isMedalScore == null ||isMedalScore == 'true') {
                    isMedalScore = true;
                } else if (isMedalScore == 'false') {
                    isMedalScore = false;
                }
                return isMedalScore;
            }
            //�ر�ɸѡ�����õ���
            $scope.filterSetWindowClose = function ($event,type) {
                if(type=='set'){
                    //ˢ�µ�ǰ����ҳ��
                    $scope.initMatchData($scope.tabActiveIndex);
                }
                angular.element($("html")).removeClass("body_h");
                angular.element($("body")).removeClass("body_h");
                angular.element($("#sort_content")).removeClass("show");
                //event.currentTargetָ���¼����󶨵�Ԫ�أ���event.targetʼ��ָ���¼�����ʱ��Ԫ��
                var _this = $($event.currentTarget);
                $timeout(function () {
                    _this.parent().parent().parent().removeClass('show');
                }, 300);
            }

            //ɸѡȡ��
            $scope.filterCancelClick = function ($event) {
                angular.element($("html")).removeClass("body_h");
                angular.element($("body")).removeClass("body_h");
                angular.element($("#sort_content")).removeClass("show");
                $timeout(function () {
                    angular.element($("#asort-filter")).removeClass('show');
                }, 300);
            }

            //����ȡ��
            $scope.setCancelClick = function ($event) {
                angular.element($("html")).removeClass("body_h");
                angular.element($("body")).removeClass("body_h");
                angular.element($("#sort_content")).removeClass("show");
                $timeout(function () {
                    angular.element($("#asort-set")).removeClass('show');
                }, 300);
            }
            //��ʼ������ɸѡ
            $scope.initGameFilter = function () {
                //console.log($scope.raceList);
                $scope.hotGameList=[];
                $scope.otherGameList=[];
                $scope.resultMatchFilter=[];
                var filterList=null;
                //ɸѡ���logo����
                for (var k = 0; k < $scope.gameList.length; k++) {
                    filterList=$scope.gameList[k];
                    filterList.leagueLogo = filterList.leagueLogoUrl;//����logoͼƬ
                    $scope.resultMatchFilter.push(filterList);
                };
                $scope.gameList = $scope.resultMatchFilter;
                $scope.raceList = angular.copy($scope.gameList);//����һ�ݣ���ֹҳ�涨ʱˢ��ʱ$scope.gameList�����³�ʼ������ɸѡҳ����ѡ���±����
                //1NBA,5CBA,8NCAA,15������,21ŷЭ��,22������,57������,377ŷ�㱭
                $scope.defHotGame=["1","5","377","21","8","22","15","57"]; //Ĭ����������
                if ($scope.raceList == null) {
                    $scope.raceList = [];
                }
                var dcurGame = null;
                for (var i = 0; i < $scope.raceList.length; i++) {
                    dcurGame=$scope.raceList[i];
                    dcurGame.isDefHot=false;
                    for (var j = 0; j < $scope.defHotGame.length; j++) {
                        if(dcurGame.leagueId==$scope.defHotGame[j]){
                            $scope.hotGameList.push(dcurGame);
                            dcurGame.isDefHot=true;
                        }
                    };
                    $scope.otherGameList.push(dcurGame);
                };
                var raceIdArr = $scope.getCheckedRaceIdArrFromCookie();
                if (raceIdArr != null && raceIdArr.length > 0) {
                    var curGame = null;
                    for (var i in $scope.raceList) {
                        curGame = $scope.raceList[i];
                        if (raceIdArr.indexOf(curGame.leagueId) > -1) {
                            curGame.clicked = true;
                        } else {
                            curGame.clicked = false;
                        }
                    }
                } else {
                    if($scope.tabActiveIndex == 0 ) { //��ʱ��Ĭ��ѡ����������
                        $scope.checkHotGame();
                    } else { //������Ĭ��ȫ��ѡ
                        $scope.uncheckAllGame();
                    }

                }
            }

            //����ɸѡ--ȫѡ
            $scope.checkAllGame = function () {
                for (var i in $scope.raceList) {
                    $scope.raceList[i].clicked = true;
                }
            }

            //����ɸѡ--ȫ��ѡ
            $scope.uncheckAllGame = function () {
                for (var i in $scope.raceList) {
                    $scope.raceList[i].clicked = false;
                }
            }

            //����ɸѡ--��ѡ
            $scope.reverseCheckGame = function () {
                var curGame = null;
                for (var i in $scope.raceList) {
                    curGame = $scope.raceList[i];
                    if (curGame.clicked) {
                        curGame.clicked = false;
                    } else {
                        curGame.clicked = true;
                    }
                }
            }

            //����ɸѡ--��������
            $scope.checkHotGame = function () {
                var game = null;
                for (var i in $scope.raceList) {
                    game = $scope.raceList[i];
                    if (game.hot && game.hot == true) {
                        game.clicked = true;
                    } else {
                        game.clicked = false;
                    }
                }
            }
            //�л�����
            $scope.toggleGame = function ($event, toggleClass) {
                var _this = $($event.currentTarget);
                _this.toggleClass(toggleClass);
                var clicked = false;
                if (_this.hasClass(toggleClass)) {
                    $scope.hideGameCount -= parseInt(_this.attr("count"));
                    clicked = true;
                } else {
                    $scope.hideGameCount += parseInt(_this.attr("count"));
                    clicked = false;
                }
                var raceId = _this.attr("raceid");
                for (var i = 0; i < $scope.raceList.length; i++) {
                    if (raceId == $scope.raceList[i].leagueId) {
                        $scope.raceList[i].clicked = clicked;
                    }
                }
            }
            //����ɸѡ�ύ����
            $scope.checkGameSubmit = function ($event) {
                $scope.initScroll();
                var checkedThirdIdList = [];
                var checkedRaceIdList = [];
                var curGame = null;
                for (var i in $scope.raceList) {
                    curGame = $scope.raceList[i];
                    if (curGame.clicked) {
                        checkedThirdIdList = checkedThirdIdList.concat(curGame.thirdIds);
                        checkedRaceIdList.push(curGame.leagueId);
                    }
                }
                var raceIdCookieId = null;
                var todayHasCheckRaceIdCookieId = null;
                //ˢ��model����
                if ($scope.tabActiveIndex == 0) {//��ʱ
                    raceIdCookieId = "checkedLiveLeagueIdList";
                    todayHasCheckRaceIdCookieId = "liveTodayHasCheckLeagueId";
                    var immediateMatches = $scope.getImmediateMatchesFilterByRaceId(checkedThirdIdList);
                    $scope.filterImmediateMatches = angular.copy(immediateMatches);
                    $scope.findLiveMatches = immediateMatches.splice(0, basketPageSize);
                    $scope.toggleNoImmediateMatches();
                    $scope.noInitFindLiveMatches = false;
                }else if ($scope.tabActiveIndex == 1) {//����
                    raceIdCookieId = "checkedResultLeagueIdList";
                    todayHasCheckRaceIdCookieId = "resultTodayHasCheckLeagueId";
                    $scope.getResultDateMatchFilter(checkedThirdIdList);
                    $scope.toggleNoResultMatches();
                }else if ($scope.tabActiveIndex == 2) {//����
                    raceIdCookieId = "checkedScheduleLeagueIdList";
                    todayHasCheckRaceIdCookieId = "scheduleTodayHasCheckLeagueId";
                    $scope.getScheduleDateMatchFilter(checkedThirdIdList);
                    $scope.toggleNoScheduleMatches();
                }else if ($scope.tabActiveIndex == 3) {//��ע
                    raceIdCookieId = "checkedAttentionLeagueIdList";
                    //do nothing
                }
                //������id�б���뵽cookie��
                if (raceIdCookieId != null) {
                    $scope.putObjectToSessionStorage(raceIdCookieId, checkedRaceIdList.join(","));
                }
                //����������ɸѡ��¼��Ϊ����¼��sessionStorage
                $scope.putObjectToSessionStorage(todayHasCheckRaceIdCookieId, "true");
                //�رյ�ǰ����
                $scope.filterCancelClick($event);
            }
            //��ȡ��������ɸѡ��ļ�ʱ����
            $scope.getImmediateMatchesFilterByRaceId = function (checkedThirdIdList) {
                var attentionThirdIdArr = $scope.getAttentionThirdIdArrFromCookie();
                var tempImmediateMatches = [];
                var immediateMatch = null,dateShow=false;
                //��ˢ�¹�ע״̬����ֹ���ɸѡ��������������ע���£����������ʾ�쳣��
                for (var j in $scope.findLiveMatchesBak) {
                    immediateMatch = $scope.findLiveMatchesBak[j];
                    if (immediateMatch.dataType && immediateMatch.dataType == "0") {
                        //�ж���tempImmediateMatches�е���Ŀ, ��һ�ν��룬ֵΪ0�����Ϊ1����ô��ʾ��һ������û�����¡���ɾ��
                        if(tempImmediateMatches.length === 1) {
                            tempImmediateMatches = [];
                        }
                        tempImmediateMatches.push(immediateMatch);
                        //������չʾ
                        if(!dateShow){
                            if(tempImmediateMatches.length-2<=4){
                                dateShow=$scope.dateShow(immediateMatch.dayText);
                                dateShow=false;
                                immediateMatch.showIconDate=true;
                            }else{
                                dateShow=true;
                            }
                        }
                        continue;
                    }
                    if (attentionThirdIdArr != null) {
                        if (attentionThirdIdArr.indexOf(immediateMatch.thirdId) > -1) {
                            immediateMatch.attented = true;
                        } else {
                            immediateMatch.attented = false;
                        }
                    }
                    if (checkedThirdIdList != null
                        && checkedThirdIdList.indexOf(immediateMatch.thirdId) > -1) {
                        tempImmediateMatches.push(immediateMatch);
                    }
                }
                if(tempImmediateMatches.length == 1) {
                    tempImmediateMatches = [];
                }
                //�Ƴ�û�����µ�������
                if(tempImmediateMatches.length > 1) {
                    for (var i = 0; i < 3; i++) {
                        if(tempImmediateMatches[tempImmediateMatches.length -1]){
                            if(tempImmediateMatches[tempImmediateMatches.length -1].dataType == "0") {
                                tempImmediateMatches.splice(tempImmediateMatches.length -1, 1);
                            }
                        }
                    };
                }
                return tempImmediateMatches;
            }
            //��ȡ��������ɸѡ�����������(�Ż�)
            $scope.getResultDateMatchFilter=function(checkedThirdIdList){
                var attentionThirdIdArr = $scope.getAttentionThirdIdArrFromCookie();
                var tempResultMatches = null;
                var resultMatch = null;
                var dateArr=$scope.resultDateBak,resultMatch,dateShow=false; //��������
                var resNumArr=[];
                for (var i = 0; i < dateArr.length; i++) {
                    resultMatch=[],tempResultMatches = [];
                    resultMatch=$scope.resultObjBak[dateArr[i].day];
                    for (var j = 0; j < resultMatch.length; j++) {
                        if (checkedThirdIdList != null) {
                            if (checkedThirdIdList.indexOf(resultMatch[j].thirdId) > -1) {
                                tempResultMatches.push(resultMatch[j]);
                                resNumArr.push(resultMatch[j]);
                            }
                        }
                        if (attentionThirdIdArr != null) {
                            if (attentionThirdIdArr.indexOf(resultMatch[j].thirdId) > -1) {
                                resultMatch[j].attented = true;
                            } else {
                                resultMatch[j].attented = false;
                            }
                        }
                    }
                    //�Ƴ�û�����µ�������
                    if(tempResultMatches.length>0) {
                        $scope.resultMatches=false;
                        dateArr[i].showData=true;
                        if(!dateShow){
                            dateShow=$scope.dateShow(dateArr[i].dayText);
                            dateShow=resNumArr.length<=4?false:true;
                            dateArr[i].showIconDate=true;
                        }else{
                            dateArr[i].showIconDate=false;
                        }
                    }else{
                        dateArr[i].showData=false; //��������Ϊ�յ�������
                    }
                    if(resNumArr.length==0){$scope.resultMatches=true;}
                    $scope.resultFirObjBak[dateArr[i].day]=tempResultMatches;
                }
                // console.log($scope.resultFirObjBak);
            }
            //չ����һ��������
            $scope.dateShow=function(dateText){
                switch(dateText){
                    case 'mdayTimeing0':
                        $scope.mdayTimeing0=true;
                        break;
                    case 'mdayTimeing1':
                        $scope.mdayTimeing1=true;
                        break;
                    case 'mdayTimeing2':
                        $scope.mdayTimeing2=true;
                        break;
                    case 'mdayTimeing3':
                        $scope.mdayTimeing3=true;
                        break;
                    case 'mdayTimeing4':
                        $scope.mdayTimeing4=true;
                        break;
                    case 'mdayTimeing5':
                        $scope.mdayTimeing5=true;
                        break;
                    case 'mdayTimeing6':
                        $scope.mdayTimeing6=true;
                        break;
                }
                return true;
            }
            //��ȡ��������ɸѡ�����������
            $scope.getScheduleMatchesFilterByRaceId = function (checkedThirdIdList) {
                var attentionThirdIdArr = $scope.getAttentionThirdIdArrFromCookie();
                var tempScheduleMatches = [];
                var scheduleMatch = null;
                for (var i in $scope.scheduleMatchesBak) {
                    scheduleMatch = $scope.scheduleMatchesBak[i];
                    if (scheduleMatch.dataType && scheduleMatch.dataType == "0") {
                        //�ж���tempScheduleMatches�е���Ŀ, ��һ�ν��룬ֵΪ0�����Ϊ1����ô��ʾ��һ������û�����¡���ɾ��
                        if(tempScheduleMatches.length === 1) {
                            tempScheduleMatches = [];
                        }
                        tempScheduleMatches.push(scheduleMatch);
                        continue;
                    }
                    if (attentionThirdIdArr != null) {
                        if (attentionThirdIdArr.indexOf(scheduleMatch.thirdId) > -1) {
                            scheduleMatch.attented = true;
                        } else {
                            scheduleMatch.attented = false;
                        }
                    }
                    if (checkedThirdIdList != null) {
                        if (checkedThirdIdList.indexOf(scheduleMatch.thirdId) > -1) {
                            tempScheduleMatches.push(scheduleMatch);
                        }
                    }
                }
                if(tempScheduleMatches.length == 1) {
                    tempScheduleMatches = [];
                }
                //�Ƴ�û�����µ�������
                if(tempScheduleMatches.length > 1) {
                    for (var i = 0; i < 8; i++) {
                        if(tempScheduleMatches[tempScheduleMatches.length -1].dataType == "0") {
                            tempScheduleMatches.splice(tempScheduleMatches.length -1, 1);
                        }
                    };
                }
                return tempScheduleMatches;
            };
            //��ȡ��������ɸѡ�����������(�Ż�)
            $scope.getScheduleDateMatchFilter=function(checkedThirdIdList){
                var attentionThirdIdArr = $scope.getAttentionThirdIdArrFromCookie();
                var tempScheduleMatches = null;
                var scheduleMatch = null;
                var dateArr=$scope.scheduleDateBak,scheduleMatch,schDateShow=false; //��������
                var schNumArr=[];
                for (var i = 0; i < dateArr.length; i++) {
                    scheduleMatch=[],tempScheduleMatches = [];
                    scheduleMatch=$scope.scheduleObjBak[dateArr[i].day];
                    for (var j = 0; j < scheduleMatch.length; j++) {
                        if (checkedThirdIdList != null) {
                            if (checkedThirdIdList.indexOf(scheduleMatch[j].thirdId) > -1) {
                                tempScheduleMatches.push(scheduleMatch[j]);
                                schNumArr.push(scheduleMatch[j]);
                            }
                        }
                        if (attentionThirdIdArr != null) {
                            if (attentionThirdIdArr.indexOf(scheduleMatch[j].thirdId) > -1) {
                                scheduleMatch[j].attented = true;
                            } else {
                                scheduleMatch[j].attented = false;
                            }
                        }
                    }
                    //�Ƴ�û�����µ�������
                    if(tempScheduleMatches.length>0) {
                        $scope.scheduleMatches=false;
                        dateArr[i].showData=true;
                        if(!schDateShow){
                            schDateShow=$scope.dateShow(dateArr[i].dayText);
                            schDateShow=schNumArr.length<=4?false:true;
                            dateArr[i].showIconDate=true;
                        }else{
                            dateArr[i].showIconDate=false;
                        }
                    }else{
                        dateArr[i].showData=false; //��������Ϊ�յ�������
                    }
                    if(schNumArr.length==0){$scope.scheduleMatches=true;}
                    $scope.scheduleFirObjBak[dateArr[i].day]=tempScheduleMatches;
                }
            }
            //��cookie�л�ȡ��ע����id����
            $scope.getAttentionThirdIdArrFromCookie = function () {
                var baAttentionThirdIds = $scope.getObjectFromLocalStorage("baAttentionThirdIds");
                var attentionThirdIdArr = null;
                if (baAttentionThirdIds != null) {
                    attentionThirdIdArr = baAttentionThirdIds.split(",");
                }
                return attentionThirdIdArr;
            }
            //������ʾ����
            $scope.matchFilterClick=function ($event){
                var target = $event.currentTarget;
                var cheNumber='';
                cheNumber=$(target).attr("data-num");
                switch(cheNumber){
                    case 'che0':
                        $scope.medalScore=!$scope.medalScore;
                        break;
                    case 'che1':
                        $scope.totalScore=!$scope.totalScore;
                        break;
                    case 'che2':
                        $scope.singleQuarter=!$scope.singleQuarter;
                        break;
                    case 'che3':
                        $scope.hostRanking=!$scope.hostRanking;
                        break;
                }
                $scope.setSubmit();
            }
            //��������
            $scope.oddsFilterClick = function ($event) {
                var baOddsFilterValue = $scope.getRadioCheckedValue($event, "radio_box4");
                $scope.baOddsFilterValue = baOddsFilterValue;
                $scope.setSubmit();
            }
            //��ȡ��ǰѡ��radio��valueֵ����
            $scope.getRadioCheckedValue = function ($event, radioId) {
                var target = $event.currentTarget;
                var value = null;
                var curLab=$(target).find('label');
                var ulList=angular.element($("#" + radioId+" li"));
                for (var i = 0; i < ulList.length; i++) {
                    $(ulList[i]).find("input").attr("checked","");
                    $(ulList[i]).find("label").removeClass('checked');
                }
                curLab.addClass("checked");
                value=curLab.prev().val();
                return value;
            }
            //����ȷ���ύ
            $scope.setSubmit = function ($event) {
                $scope.putObjectToLocalStorage("baOddsFilterValue", $scope.baOddsFilterValue);
                $scope.putObjectToLocalStorage("medalScore", $scope.medalScore);
                $scope.putObjectToLocalStorage("totalScore", $scope.totalScore);
                $scope.putObjectToLocalStorage("singleQuarter", $scope.singleQuarter);
                $scope.putObjectToLocalStorage("hostRanking", $scope.hostRanking);

                //�رյ���
                //$scope.filterCancelClick($event);
            }

    }]);
    app.service("basketballService",function(){
        return {
            name : "1111hello basketball"
        }
    })
    app.constant("uri","http://www.google.com");

    app.directive("swiper",function(){
        var swiper = {};
        swiper.restrict = 'E';
        swiper.template ='<div class="swiper-container">'+
            '       <div class="swiper-wrapper">'+
            '     <div class="swiper-slide">Slide 1</div>'+
            '  <div class="swiper-slide">Slide 2</div>'+
            '   <div class="swiper-slide">22</div>'+
            '</div>'+
            '<div class="swiper-pagination"></div>'+
            ' </div>'
        swiper.replace = true;
        swiper.link = function(scope,element,attrs){
            var mySwiper = new Swiper('.swiper-container', {
                pagination: '.swiper-pagination',
                paginationClickable: false
            })
            console.log(mySwiper);
        };
        return swiper;
    })



    /*****************************�����*******************************/
//��ʱ����
    app.factory("FindLiveService", [
        "$resource",
        function ($resource) {
            return $resource(baseUrl + "/core/basketballMatch.findLiveMatch.do", {}, {
                query: {
                    method: "get",
                    params: {},
                    isArray: true
                }
            });
        }
    ]);

//��ʱ����
    app.factory("FindLiveServiceFactory", [
        "FindLiveService",
        function (FindLiveService) {
            var obj = {};
            obj.loadFindLiveMatchData = function ($scope, $cookieStore, $timeout) {
                FindLiveService.get({lang: $scope.getLanguage()}, function (data) {
                    var dayWeek = null;
                    $scope.findLiveMatches = [];
                    $scope.findLiveMatchesBak = [];
                    $scope.fullThirdIdMap = {};//���м�ʱ��������map
                    $scope.resultThirdIdMap = {};
                    $scope.gameList = data.matchFilter;//���м�ʱ������ɸѡ����
                    var o=null,matchList='',liveResultMatch = null,dataObj=data.matchData,
                        dateShow=false,attNumArr=[];
                    var attentionThirdIdArr = $scope.getAttentionThirdIdArrFromCookie();
                    // var teamUrl=data.teamLogoUrlPrefix,suff=data.logoUrlSuffix;  //���logo��ַ
                    // deBsketTeamLogoUrl=teamUrl+'default'+suff;  //Ĭ�����logo
                    var hasAttentionMatch = attentionThirdIdArr != null && attentionThirdIdArr.length > 0;
                    //�ȷ�
                    for (var i = 0; i < dataObj.length; i++) {
                        o = {};
                        o.day = dataObj[i].date;
                        o.today=false;    //����
                        o.tomorrow=false;   //����
                        o.yesterday=false;  //����
                        o.dayText='mdayTimeing'+i;
                        if(dataObj[i].diffDays==0){//����
                            o.today=true;
                        }
                        if(dataObj[i].diffDays==1){  //����
                            o.tomorrow=true;
                        }
                        if(dataObj[i].diffDays==-1){  //����
                            o.yesterday=true;
                        }
                        o.week = $scope.getWeek(new Date(dataObj[i].date));
                        o.dataType = "0";
                        o.showIconDate=true;
                        $scope.findLiveMatchesBak.push(o);
                        matchList=dataObj[i].match;
                        for (var j = 0; j < matchList.length; j++) {
                            liveResultMatch = matchList[j];
                            liveResultMatch.dataType = "1";
                            liveResultMatch.today = o.today;
                            liveResultMatch.dayText=o.dayText;
                            //�곡����
                            if(liveResultMatch.matchStatus=='-1'){
                                liveResultMatch.finish=true;
                            }
                            if (hasAttentionMatch) {
                                if (attentionThirdIdArr.indexOf(liveResultMatch.thirdId) > -1) {
                                    liveResultMatch.attented = true;
                                } else {
                                    liveResultMatch.attented = false;
                                }
                            }
                            $scope.isImm=false;
                            $scope.handleScore(liveResultMatch);  //�ȷ�
                            $scope.basketPoor(liveResultMatch);  //�ֲ�
                            $scope.convertState(liveResultMatch);  //״̬
                            $scope.handleSeal(liveResultMatch);   //����
                            $scope.convertHandicapValue(liveResultMatch.matchOdds);  //����ת��
                            liveResultMatch.hometeamLogo = liveResultMatch.homeLogoUrl;//����logoͼƬ
                            liveResultMatch.guestteamLogo = liveResultMatch.guestLogoUrl;//�Ͷ�logoͼƬ
                            $scope.findLiveMatchesBak.push(liveResultMatch);
                            attNumArr.push(liveResultMatch);
                            $scope.fullThirdIdMap[liveResultMatch.thirdId] = liveResultMatch;
                        };
                        if(!dateShow){
                            dateShow=$scope.dateShow(o.dayText);
                            dateShow=attNumArr.length<=4?false:true;
                        }else{
                            o.showIconDate=false;
                        }
                    };
                    var hasFilter = false;
                    var checkedThirdIdList = [];
                    var todayHasCheckRaceId = $scope.getObjectFromSessionStorage("liveTodayHasCheckLeagueId");
                    if (todayHasCheckRaceId != null && todayHasCheckRaceId == "true") {
                        //������ѡ����ɸѡ����
                        var raceIdArr = $scope.getCheckedRaceIdArrFromCookie();
                        if (raceIdArr != null && raceIdArr.length > 0) {
                            var curGame = null;
                            for (var i in $scope.gameList) {
                                curGame = $scope.gameList[i];
                                if (raceIdArr.indexOf(curGame.leagueId) > -1) {
                                    checkedThirdIdList = checkedThirdIdList.concat(curGame.thirdIds);
                                }
                            }
                        }
                        hasFilter=true;
                        $scope.findLiveMatches = $scope.getImmediateMatchesFilterByRaceId(checkedThirdIdList);
                    }
                    //�Ƿ��й�������
                    if (hasFilter) {
                        $scope.filterImmediateMatches = $scope.findLiveMatches;
                    } else {
                        $scope.findLiveMatches = $scope.findLiveMatchesBak;
                    }
                    $scope.hotImmediateMatchThirdArr = $scope.getHotThirdIdArr();
                    $scope.toggleNoImmediateMatches();
                    // $scope.findLiveMatches = $scope.findLiveMatches.slice(0, basketPageSize);
                    //�����ݴ���
                    var emptyData = ($scope.findLiveMatches == null || $scope.findLiveMatches.length == 0);
                    if($scope.tabsSwiperInited == false) {
                        if(emptyData) {
                            $scope.initSwiper(1, false);//��ת������
                            return;
                        } else{
                            $scope.initSwiper(0, false);
                            $scope.websocketInit();
                            $scope.noInitFindLiveMatches = false;
                        }
                    } else {
                        if(emptyData) {
                            $scope.findLiveMatches = null;
                            $scope.noInitFindLiveMatches = true;
                            $scope.noFindLiveMatches = false;
                        }else{
                            $scope.websocketInit();
                        }
                    }
                    $scope.hideLoadingImg();
                });
            };
            return obj;
        }
    ]);
//����
    app.factory("ResultService", [
        "$resource",
        function ($resource) {
            return $resource(baseUrl + "/core/basketballMatch.findFinishedMatch.do", {}, {
                query: {
                    method: "get",
                    params: {},
                    isArray: false
                }
            });
        }
    ]);
//��������
    app.factory("ResultServiceFactory", [
        "ResultService",
        function (ResultService) {
            var obj = {};
            //��������, flag: �Ƿ�ȡ���ڣ�ֻ�н���ҳ��ʱ�Ż�ȡ(��Ϊtrue)��ѡ��������ں󲻻�ȡ(��Ϊfalse)
            obj.loadResultMatchData = function ($scope, $cookieStore, flag) {
                $scope.resultMatchesBak = null;
                var attentionThirdIdArr = $scope.getAttentionThirdIdArrFromCookie();
                ResultService.get({lang: $scope.getLanguage()}, function (data) {
                    var index = 0;
                    var dayWeek = null;
                    $scope.resultMatches=true;
                    $scope.gameList = data.matchFilter;
                    $scope.resultDateBak=[];
                    $scope.resultObjBak={};
                    $scope.resultFirObjBak={};
                    var hasAttentionMatch = attentionThirdIdArr != null && attentionThirdIdArr.length > 0;
                    var o = null,matchList='',dataObj=data.matchData,dateShow=false;
                    var resultMatch = null,attNumArr=[],resNum=0;
                    for (var i in dataObj) {
                        o = {};
                        o.day = dataObj[i].date;
                        o.today=false;
                        o.tomorrow=false;   //����
                        o.yesterday=false;  //����
                        o.dayText='mdayTimeing'+i;
                        if(dataObj[i].diffDays==0){//����
                            o.today=true;
                        }
                        if(dataObj[i].diffDays==1){  //����
                            o.tomorrow=true;
                        }
                        if(dataObj[i].diffDays==-1){  //����
                            o.yesterday=true;
                        }
                        o.week = $scope.getWeek(new Date(dataObj[i].date));
                        o.dataType = "0";
                        o.showData=true;
                        o.showIconDate=true;
                        $scope.resultDateBak.push(o);  //test
                        matchList=dataObj[i].match;
                        $scope.resultMatchesBak=[];
                        for (var j in matchList) {
                            resultMatch = matchList[j];
                            resultMatch.dataType = "1";
                            resultMatch.today = o.today;
                            resultMatch.dayText=o.dayText;
                            $scope.isImm=false;
                            $scope.handleScore(resultMatch);
                            $scope.basketPoor(resultMatch);  //�ֲ�
                            $scope.convertState(resultMatch);
                            $scope.handleSeal(resultMatch);  //����
                            $scope.convertHandicapValue(resultMatch.matchOdds);
                            resultMatch.hometeamLogo = resultMatch.homeLogoUrl;//����logoͼƬ
                            resultMatch.guestteamLogo = resultMatch.guestLogoUrl;//�Ͷ�logoͼƬ
                            if (hasAttentionMatch) {
                                if (attentionThirdIdArr.indexOf(resultMatch.thirdId) > -1) {
                                    resultMatch.attented = true;
                                } else {
                                    resultMatch.attented = false;
                                }
                            }
                            $scope.resultMatchesBak.push(resultMatch);
                            attNumArr.push(resultMatch);
                        }
                        //��ȡ��һ������
                        if(!dateShow){resNum=Number(i)+1;}
                        if(i<resNum){
                            $scope.resultFirObjBak[dataObj[i].date]=$scope.resultMatchesBak;
                        }else{
                            $scope.resultFirObjBak[dataObj[i].date]=[];
                        }
                        //�Ƿ���ʾ������
                        if(!dateShow){
                            dateShow=$scope.dateShow(o.dayText);
                            dateShow=attNumArr.length<=4?false:true;
                        }else{
                            o.showIconDate=false;
                        }
                        $scope.resultObjBak[dataObj[i].date]= $scope.resultMatchesBak;
                    }
                    if(attNumArr.length>0){$scope.resultMatches=false;}
                    // console.log($scope.resultDateBak);
                    /*console.log($scope.resultObjBak);*/
                    var hasFilter = false;
                    //��������ɸѡ����
                    var raceIdArr = $scope.getCheckedRaceIdArrFromCookie();
                    if (raceIdArr != null && raceIdArr.length > 0) {
                        var checkedThirdIdList = [];
                        var curGame = null;
                        for (var k in $scope.gameList) {
                            curGame = $scope.gameList[k];
                            if (raceIdArr.indexOf(curGame.leagueId) > -1) {
                                checkedThirdIdList = checkedThirdIdList.concat(curGame.thirdIds);
                            }
                        }
                        hasFilter = true;
                        $scope.getResultDateMatchFilter(checkedThirdIdList);
                    }
                    $scope.toggleNoResultMatches();
                    $scope.hideLoadingImg();
                });
            };
            return obj;
        }
    ]);
//����
    app.factory("ScheduleService", [
        "$resource",
        function ($resource) {
            return $resource(baseUrl + "/core/basketballMatch.findScheduledMatch.do", {}, {
                query: {
                    method: "get",
                    params: {},
                    isArray: false
                }
            });
        }
    ]);
//���̷���
    app.factory("ScheduleServiceFactory", [
        "ScheduleService",
        function (ScheduleService) {
            var obj = {};
            //��������
            obj.loadScheduleMatchData = function ($scope, $cookieStore, flag) {
                $scope.scheduleMatches = true;
                $scope.scheduleMatchesBak = null;
                var attentionThirdIdArr = $scope.getAttentionThirdIdArrFromCookie();
                ScheduleService.get({lang: $scope.getLanguage()}, function (data) {
                    var index = 0;
                    var dayWeek = null;
                    $scope.gameList = data.matchFilter;
                    $scope.scheduleDateBak=[];
                    $scope.scheduleObjBak={};
                    $scope.scheduleFirObjBak={};
                    var hasAttentionMatch = attentionThirdIdArr != null && attentionThirdIdArr.length > 0;
                    var o = null,matchList='',dataObj=data.matchData,dateShow=false;
                    var scheduleMatch = null,attNumArr=[],schNum=0;
                    for (var i in dataObj) {
                        o = {};
                        o.day = dataObj[i].date;
                        o.today=false;
                        o.tomorrow=false;   //����
                        o.yesterday=false;  //����
                        o.dayText='mdayTimeing'+i;
                        if(dataObj[i].diffDays==0){//����
                            o.today=true;
                        }
                        if(dataObj[i].diffDays==1){  //����
                            o.tomorrow=true;
                        }
                        if(dataObj[i].diffDays==-1){  //����
                            o.yesterday=true;
                        }
                        o.week = $scope.getWeek(new Date(dataObj[i].date));
                        o.dataType = "0";
                        o.showData=true;
                        o.showIconDate=true;
                        $scope.scheduleDateBak.push(o);
                        matchList=dataObj[i].match;
                        $scope.scheduleMatchesBak = [];
                        for (var j in matchList) {
                            scheduleMatch = matchList[j];
                            scheduleMatch.dataType = "1";
                            scheduleMatch.dayText=o.dayText;
                            $scope.convertState(scheduleMatch);
                            //$scope.handicapValueToMediumOdds(scheduleMatch);
                            $scope.convertHandicapValue(scheduleMatch.matchOdds);
                            scheduleMatch.hometeamLogo = scheduleMatch.homeLogoUrl;//����logoͼƬ
                            scheduleMatch.guestteamLogo = scheduleMatch.guestLogoUrl;//�Ͷ�logoͼƬ
                            if (hasAttentionMatch) {
                                if (attentionThirdIdArr.indexOf(scheduleMatch.thirdId) > -1) {
                                    scheduleMatch.attented = true;
                                } else {
                                    scheduleMatch.attented = false;
                                }
                            }
                            $scope.scheduleMatchesBak.push(scheduleMatch);
                            attNumArr.push(scheduleMatch);
                        }
                        //��ȡ��һ������
                        if(!dateShow){schNum=Number(i)+1;}
                        if(i<schNum){
                            $scope.scheduleFirObjBak[dataObj[i].date]=$scope.scheduleMatchesBak;
                        }else{
                            $scope.scheduleFirObjBak[dataObj[i].date]=[];
                        }
                        //�Ƿ���ʾ������
                        if(!dateShow){
                            dateShow=$scope.dateShow(o.dayText);
                            dateShow=attNumArr.length<=4?false:true;
                        }else{
                            o.showIconDate=false;
                        }
                        $scope.scheduleObjBak[dataObj[i].date]= $scope.scheduleMatchesBak;
                    }
                    if(attNumArr.length>0){$scope.scheduleMatches=false;}
                    // console.log($scope.scheduleObjBak);
                    //��������ɸѡ����
                    var raceIdArr = $scope.getCheckedRaceIdArrFromCookie();
                    if (raceIdArr != null && raceIdArr.length > 0) {
                        var checkedThirdIdList = [];
                        var curGame = null;
                        for (var k in $scope.gameList) {
                            curGame = $scope.gameList[k];
                            if (raceIdArr.indexOf(curGame.leagueId) > -1) {
                                checkedThirdIdList = checkedThirdIdList.concat(curGame.thirdIds);
                            }
                        }
                        $scope.getScheduleDateMatchFilter(checkedThirdIdList);
                    }
                    $scope.toggleNoScheduleMatches();
                    $scope.hideLoadingImg();
                });
            };
            return obj;
        }
    ]);
//��ע
    app.factory("AttentionService", [
        "$resource",
        function ($resource) {
            return $resource(baseUrl + "/core/basketballMatch.findFavouriteMatch.do", {}, {
                query: {
                    method: "get",
                    params: {},
                    isArray: false
                }
            });
        }
    ]);
//��ע����
    app.factory("AttentionServiceFactory", [
        "AttentionService",
        function (AttentionService) {
            var obj = {};
            obj.loadAttentionMatchData = function ($scope, $cookieStore, $timeout, baAttentionThirdIds) {
                var attentionThirdIdArr = $scope.getAttentionThirdIdArrFromCookie();
                AttentionService.get({lang: $scope.getLanguage(), favourite: baAttentionThirdIds}, function (data) {
                    $scope.attentionEventLst = [];
                    $scope.attentionMatchesBak = [];
                    $scope.attentionMatches = [];
                    //$scope.gameList = data.filter;
                    $scope.attentionThirdIdMap = {};//��ע��������map, keyΪthirdId, valueΪ������������
                    var tempArr = [],attNumArr=[];
                    var o = null,matchList='',dataObj=data.matchData,dateShow=false;
                    for (var i in dataObj) {
                        o = {};
                        o.day = dataObj[i].date;
                        o.today=false;
                        o.tomorrow=false;   //����
                        o.yesterday=false;  //����
                        o.dayText='mdayTimeing'+i;
                        if(dataObj[i].diffDays==0){//����
                            o.today=true;
                        }
                        if(dataObj[i].diffDays==1){  //����
                            o.tomorrow=true;
                        }
                        if(dataObj[i].diffDays==-1){  //����
                            o.yesterday=true;
                        }
                        o.week = $scope.getWeek(new Date(dataObj[i].date));
                        o.dataType = "0";
                        o.showIconDate=true;
                        $scope.attentionMatchesBak.push(o);
                        var attentionMatch = null;
                        matchList=dataObj[i].match;
                        for (var j in matchList) {
                            attentionMatch = matchList[j];
                            attentionMatch.dataType = "1";
                            attentionMatch.dayText=o.dayText;
                            attentionMatch.attented = true;
                            $scope.isImm=false;
                            $scope.handleScore(attentionMatch);
                            $scope.basketPoor(attentionMatch);  //�ֲ�
                            $scope.convertState(attentionMatch);
                            //$scope.handicapValueToMediumOdds(attentionMatch);
                            $scope.handleSeal(attentionMatch);
                            $scope.convertHandicapValue(attentionMatch.matchOdds);
                            $scope.attentionThirdIdMap[attentionMatch.thirdId] = attentionMatch;
                            attentionMatch.hometeamLogo = attentionMatch.homeLogoUrl;//����logoͼƬ
                            attentionMatch.guestteamLogo = attentionMatch.guestLogoUrl;//�Ͷ�logoͼƬ
                            //�곡����
                            if(attentionMatch.matchStatus=='-1'){
                                attentionMatch.finish=true;
                            }
                            if (attentionThirdIdArr != null && attentionThirdIdArr.length > 0) {
                                if (attentionThirdIdArr.indexOf(attentionMatch.thirdId) != -1) {
                                    tempArr.push(attentionMatch.thirdId);
                                }
                            }
                            $scope.attentionMatchesBak.push(attentionMatch);
                            attNumArr.push(attentionMatch);
                        }
                        if(!dateShow){
                            dateShow=$scope.dateShow(o.dayText);
                            dateShow=attNumArr.length<=4?false:true;
                        }else{
                            o.showIconDate=false;
                        }
                    }
                    $scope.attentionMatches=$scope.attentionMatchesBak;
                    //console.log($scope.attentionMatches);
                    $scope.putObjectToLocalStorage("baAttentionThirdIds", tempArr.join(",") + ",");
                    $scope.putObjectToLocalStorage("baAttentionMatchCount", tempArr.length);
                    $scope.baAttentionMatchCount = tempArr.length;
                    $scope.hideLoadingImg();
                    if ($scope.attentionMatches == null || $scope.attentionMatches.length == 0) {
                        $scope.noAttentionMatches = true;
                    } else {
                        $scope.noAttentionMatches = false;
                    }
                    $scope.websocketInit();
                });
            };
            return obj;
        }
    ]);
//websocket
    var connection = null;
    app.factory('WebSocket', function () {
        return {
            connect: function (url, $scope) {
                connection = Stomp.client(url);
                //var clientId = new String(new Date().getTime()) + Math.ceil(Math.random() * 1000);
                var headers = {
                    'login': websocketLogin,
                    'passcode': websocketPasscode
                    //'client-id': clientId
                };
                connection.debug = function () {
                    //
                };
                connection.heartbeat.outgoing = 0;
                connection.heartbeat.incoming = 0;
                connection.connect(headers, function (frame) {
                    console.info("connected to Stomp");
                    this.subscribe(baWebsocketDestination, function (message) {
                        if (message.body) {
                            $scope.$apply(function () {
                                $scope.refreshImmediateAndAttentionData(message.body);
                            });
                        }
                    });
                }, function (error) {
                    console.info(error);
                    console.info("Stomp error");
                });
            },
            state: function () {
                var state;
                try {
                    state = connection.ws.readyState;
                } catch (e) {
                    state = -1;
                }
                return state;
            },
            close: function () {
                try {
                    if(connection != null){
                        connection.disconnect(function () {
                            console.info("disconnect from Stomp");
                        });
                        connection = null;
                    }
                } catch (e) {
                }
            }
        }
    });
});