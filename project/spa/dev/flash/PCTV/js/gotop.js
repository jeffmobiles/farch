// JavaScript Document
var Sys = {};
var ua = navigator.userAgent.toLowerCase();
var s;
(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
        (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
        (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
        (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

function goTopEx() {
    var obj = document.getElementById("goTop");
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    function getScrollTop() {
        var xsun = document.documentElement.scrollTop;
        if (Sys.chrome) {
            xsun=document.body.scrollTop;
        }
        return xsun;
    }
    function setScrollTop(value) {
        if (Sys.chrome) {
            document.body.scrollTop = value;
        }
        else {
            document.documentElement.scrollTop = value;
        }
    }
    window.onscroll = function () { getScrollTop() > 0 ? obj.style.display = "" : obj.style.display = "none"; }
    obj.onclick = function () {
        var goTop = setInterval(scrollMove, 10);
        function scrollMove() {
            setScrollTop(getScrollTop() / 1.1);
            if (getScrollTop() < 1) clearInterval(goTop);
        }
    }
}

