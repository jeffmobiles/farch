    <%@ page import="java.net.*,java.util.*,java.lang.*,java.io.*"%><%@ page contentType="text/xml;charset=gb2312"%><%
String url = null;
StringBuffer params = new StringBuffer();
Enumeration enu = request.getParameterNames();
//String str=request.getQueryString();
//System.out.println(str);

while (enu.hasMoreElements()) {
String paramName=(String)enu.nextElement();
if(paramName.equals("url")){
   url=request.getParameter(paramName);
}else{
   //�е�url����˳���й涨�����˶��������������Ҫ�嵽paramName��ǰ��
   params.insert(0, URLEncoder.encode(request.getParameter(paramName), "UTF-8"));
   params.insert(0, "=");
   params.insert(0, paramName);
   if(enu.hasMoreElements()){
	   params.insert(0, "&");
   }
}
}
url = url + "?" + params.toString();
//out.println(url);
System.out.println("url:"+url);

if(url != null){
// ʹ��GET��ʽ��Ŀ�ķ�������������
URL connect = new URL(url.toString());
URLConnection connection = connect.openConnection();
connection.connect();
BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
String line;
while((line = reader.readLine()) != null){
   out.println(line);
}
reader.close();
}
%>
