You can think of a module as a Container for the different parts of your app �C controllers, services, filters, directives, etc.
ģ����һ����������������,����,������,ָ��Ȳ�ͬ����.
The $provide service has a number of methods for registering components with the $injector. Many of these functions are also exposed on angular.Module.
$provide ������һϵ����$injectorע������ķ���
$provide�ṩ��provide()��constant()��value()��factory()��service()���������ֲ�ͬ���ʵķ���
angular.Module��Ҳ�ṩ����5������ע�᷽������ʵ2�߹�������ȫһ���ģ�����������DI����ע�����injector�С�