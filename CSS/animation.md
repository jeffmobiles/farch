.xuan{
  -webkit-animation:200s 0s linear infinite forward;
  //200s ����ʱ��,���Կ����ٶ�. 0s:�ӳ�ʱ��. linear ������������. infinite :ѭ��, forward:��ɺ��ٴδӿ�ͷ��ʼ.
  //-webkit-animation-name Ҫ����-webkit-animation֮�󣬷���ִ�в���.
  -webkit-animation-name:demos;
  -moz-animation:0.5s 0.5s linear infinite forward;
  -moz-animation-name:demos;
}
@-webkit-keyframes demos {
  0% {transform:rotateZ(0deg)}
  50% {transform:rotateZ(180deg)}
  100% {transform:rotateZ(360deg)}
}

