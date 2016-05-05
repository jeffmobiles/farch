http://www.tuicool.com/articles/nmm6reE

术语:
        响应式:
          1.流体网格,百分比.
          2.弹性图片. max-width:100%; ie8有bug 图片会失踪.断点解决图片自适应。
          3.媒体查询,主要断点. ie6-ie8不支持css3 media query.ie9以下加media-query.js,respond.js
          4.屏幕分辨率
          响应式技巧
            1.尽量少用无关紧要的div
            2.不要使用inline内联元素
            3.少用js活flash
            4.丢弃没用的绝对定位和浮动样式
            5.摈弃任何冗余结构和不使用100%设置.
          哪些可以帮助
            1.html5 doctype 和使用指南
            2.重置好样式
            3.一个简单的有语义的核心布局.
            4.重要的元素使用简单的技巧.
        Web字体@font-face
1.苹果官网对不同尺寸的适配, 如果内容宽度超过屏幕尺寸的时候,苹果是做两套 dom, 通过@mediaQuery来选择隐藏哪套dom.