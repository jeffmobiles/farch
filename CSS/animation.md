.xuan{
  -webkit-animation:200s 0s linear infinite forward;
  //200s 运行时间,可以控制速度. 0s:延迟时间. linear 可以匀速运行. infinite :循环, forward:完成后再次从开头开始.
  //-webkit-animation-name 要放在-webkit-animation之后，否则执行不了.
  -webkit-animation-name:demos;
  -moz-animation:0.5s 0.5s linear infinite forward;
  -moz-animation-name:demos;
}
@-webkit-keyframes demos {
  0% {transform:rotateZ(0deg)}
  50% {transform:rotateZ(180deg)}
  100% {transform:rotateZ(360deg)}
}

