# TQuery
这是一个模拟jquery的轻量js库，(当然这里包含了很多的注释代码)
实现了jquery的大部分常用方法，包括选择符，事件绑定、处理，DOM操作，ajax等等
个人使用.....
支持IE8+，chrome，firefox，opera等
IE8下，不定期删除某些兼容IE8下的部分。


<h4>如何添加插件？</h4>
<p>1，源码中提供了一个extand方法，用于添加插件<p>
格式是这样$().extend(fnName,fn);	参数：方法名，执行的方法
比如
<pre>$().extend('alert',function(){
  //do something
  alert( this );
	return this;  //返回TQuery对象，以便链式操作    $('p').css('width','500').alert().scoll()........
});
</pre>
调用：
<pre>$().alert();  >>>>>>    TQuery{'elements':[],'vision':1.0,'length':0};</pre>
