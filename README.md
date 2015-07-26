# TQuery
这是一个模拟jquery的轻量js库，(当然这里包含了很多的注释代码)
实现了jquery的大部分常用方法，包括选择符，事件绑定、处理，DOM操作，ajax等等
个人使用.....


<h4>兼容哪些浏览器</h4>
支持IE8+，chrome，firefox，opera等。IE8下，不定期删除某些兼容IE8下的部分。

<h4>如何添加插件？</h4>
<p>1，源码中提供了一个extend方法，用于添加插件<p>
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
<h4>已经模拟的方法</h4>
选择器：
<ul>
	<li>$()</li>
	<li>find()</li>
	<li>not()</li>
	<li>flter()</li>
	<li>add()</li>
	<li>parents()</li>
	<li>children()</li>
	<li>prev()</li>
	<li>next()</li>
	<li>siblings()</li>
	<li>slice()</li>
	<li>eq()</li>
	<li>get()</li>
</ul>
事件操作：
<ul>
	<li>each()</li>
	<li>trigger()</li>
	<li>click()</li>
	<li>bind()</li>
	<li>unbind()</li>
	<li>on()</li>
	<li>one()</li>
	<li>hover()</li>
	<li>toggle()</li>
	<li>mouseScroll()</li>
	<li>matation()</li>
	<li>ajax()</li>
</ul>
获取尺寸及设置：
<ul>
	<li>width()</li>
	<li>height()</li>
	<li>top()</li>
	<li>left()</li>
	<li>viewWidth()</li>
	<li>viewHeight()</li>
	<li>style()</li>
	<li>size()</li>
	<li>scrollTop()</li>
	<li>mouseScroll()</li>
</ul>
属性attr的设置
<ul>
	<li>css()</li>
	<li>animate()</li>
	<li>stop()</li>
	<li>attr()</li>
	<li>hasClass()</li>
	<li>removeClass()</li>
	<li>addClass()</li>
	<li>size()</li>
	<li>scrollTop()</li>
	<li>mouseScroll()</li>
</ul>
DOM节点的操作
<ul>
	<li>insertAfter()</li>
	<li>insertBefore()</li>
	<li>empty()</li>
	<li>remove()</li>
	<li>html()</li>
	<li>text()</li>
	<li>addClass()</li>
	<li>value()</li>
</ul>
其他方法
<ul>
	<li>show()</li>
	<li>hide()</li>
	<li>scroll()</li>
</ul>
