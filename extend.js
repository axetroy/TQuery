;//===============库扩展==============
function $arr(arr){
	return new arryfn(arr);
}
function arrayfn(arr){
	this.arr = arr;
	this.length = arr.length;
	return this;
}
arrayfn.prototype.sum = function(){
	var result = 0;
	var length = this.length;
	for( var i=0;i<length;i++ ){
		result += this.arr[i];
	}
	return result;
};
arrayfn.prototype.unique = function(){
   var a = {};//哈希表，用来存放不重复的数组
   for (var i=0; i<this.length; i++) {
	   var v = this.arr[i];
	   if (typeof(a[v]) == 'undefined'){
			a[v] = 1;
	   }
   }
   this.length=0;//清空数组
   for (var k in a){//哈希表存放的不重复数据，存入数组中
		this.arr[this.length] = k;  //this.length = 0 , 1 , 2 ……
   }
   return this;
};
//删除指定位置,
//n为数组[0,5]…………
arrayfn.prototype.del = function(n) {
    if (n < 0) return this;
	if(typeof n == 'object' && n.push()){//如果是数组（区间）
		 return this.arr.slice(0,n[0]).concat( this.arr.slice( n[1]+1 , this.arr.length) );
	}
	this.arr = this.arr.slice(0, n).concat( this.arr.slice(n + 1, this.length) );
    return this;
};
function $str(str){
	return newstringfn(str);
}
function newstringfn(str){
	
}
//=======系统对象上添加====
//字符串倒序
String.prototype.reverse = function(){
	return this.split('').reverse().join('');
};
//数组sum求和方法
Array.prototype.sum = function(){
	var result = 0;
	for( var i=0;i<this.length;i++ ){
		result += this[i];
	}
	return result;
};
//数组去重，不能比较DOM节点
Array.prototype.unique = function(){
   var a = {};//哈希表，用来存放不重复的数组
   for (var i=0; i<this.length; i++) {
	   var v = this[i];
	   if (typeof(a[v]) == 'undefined'){
			a[v] = 1;
	   }
   }
   this.length=0;//清空数组
   for (var k in a){//哈希表存放的不重复数据，存入数组中
		this[this.length] = k;  //this.length = 0 , 1 , 2 ……
   }
   return this;
};
//删除指定位置的数组,n = (0,n)，可以是数字，可以是区间
Array.prototype.del = function(n) {
    if (n < 0) return this;
	if(typeof n == 'object' && n.push()){//如果是数组（区间）
		 return this.slice(0,n[0]).concat( this.slice( n[1]+1 , this.length) );
	}
    return this.slice(0, n).concat( this.slice(n + 1, this.length) );
};
////拖拽
//使用方法 new Drag($('press'),$('move'),{left:[100,200],top:[200,500]});(鼠标按住的目标，要移动的目标)
/*
var json = {
			L:[100,300],
			T:[200,500]
			}
*/
$().extend('drag',function(json){
	for(var i=0;i<this.length;i++){
		new Drag( this.elements[i],this.elements[i],json );
	}
	return this;
});
function Drag(pressTarget,MoveTarget,json){
	var _this = this;
	this.disX = 0;
	this.disY = 0;
	if(json){
		this.json = json;
	}
	this.MoveTarget = MoveTarget;
	pressTarget.onmousedown = function(e){
		_this.fnDown(e);
		return false;//chrome,firefox去除文字选中
	};
}
Drag.prototype.fnDown = function(e){//鼠标按下（未松开）
	var ev = e || window.event;
	var _this = this;
	this.disX = e.clientX - this.MoveTarget.offsetLeft;
	this.disY = e.clientY - this.MoveTarget.offsetTop;
	if(this.MoveTarget.setCaptrue){//IE，解决文字选中
		this.MoveTarget.onmousemove = function(ev){
			_this.fnMove(ev);
			_this.json.movefn();
		};
		this.MoveTarget.onmouseup = function(){
			var this_ = this;
			_this.fnUp(this_);
		};
		this.MoveTarget.setCaptrue();//添加事件捕获
	}else{
		document.onmousemove = function(e){
			_this.fnMove(e);
			if(_this.json.movefn){
				_this.json.movefn();
			}
		};
		document.onmouseup = function(){
			var this_ = this;
			_this.fnUp(this_);
		};
	}
};
Drag.prototype.fnMove = function(e){//鼠标移动，则div移动
	var ev = e || window.event;
	var L = this.json ? this.range(e.clientX - this.disX,this.json.L[0],this.json.L[1]) : (e.clientX - this.disX);
	var T = this.json ? this.range(e.clientY - this.disY,this.json.T[0],this.json.T[1]) : (e.clientY - this.disY);
	this.MoveTarget.style.left = L + 'px';
	this.MoveTarget.style.top = T + 'px';
};
Drag.prototype.fnUp = function(this_){//鼠标松开，则停止
		this_.onmousemove = null;
		this_.onmouseup = null;
		if( this_.setCaptrue ){
			this_.releaseCapture();//释放捕获
		}
};
Drag.prototype.range = function(iNow,iMin,iMax){
	if(iNow>iMax){
		return iMax;
	}else if(iNow<iMin){
		return iMin;
	}else{
		return iNow;
	}
};
////拖拽改变大小
//使用方法 new scale($('press'),$('move'),{width:[100,200],height:[200,500]});(鼠标按住的目标，要移动的目标)
/*
var json = {
			width:[100,300],
			height:[200,500]
			}
*/
function Scale(pressTarget,MoveTarget,json){
	if(json){
		this.json = json;
	}
	this.MoveTarget = MoveTarget;
	var _this = this;
	pressTarget.onmousedown = function(e){
		_this.onmousedownFn(e);
		};
}
Scale.prototype.onmousedownFn = function(e){
	var ev = e || window.event;
	this.disX = e.clientX;
	this.disY = e.clientY;
	this.disW = this.MoveTarget.offsetWidth;
	this.disH = this.MoveTarget.offsetHeight;
	var _this = this;
	document.onmousemove = function(ev){
		_this.mouseoverFn(ev);
		};
	document.onmouseup = function(ev){
		_this.mouseupFn(ev);
		};
};
Scale.prototype.mouseoverFn = function(e){
	var ev = e || window.event;
	this.W = this.json ? this.range(ev.clientX - this.disX + this.disW,this.json.width[0],this.json.width[1]) : (ev.clientX - this.disX + this.disW);
	this.H = this.json ? this.range(ev.clientY - this.disY + this.disH,this.json.height[0],this.json.height[1]) : (ev.clientY - this.disY + this.disH);
	this.MoveTarget.style.width = this.W + 'px';
	this.MoveTarget.style.height = this.H + 'px';
};
Scale.prototype.mouseupFn = function(){
	document.onmousemove = null;
	document.onmouseup = null;
};
Scale.prototype.range = function(iNow,iMin,iMax){
	if(iNow>iMax){
		return iMax;
	}else if(iNow<iMin){
		return iMin;
	}else{
		return iNow;
	}
};
//面向对象选项卡
//使用方法 new TabSwitch('div1');
/*
	<div id="div1">
		<input />
		<input />
		<input />
		<div></div>
		<div></div>
		<div></div>
	</div>
结构：
*/
function TabSwitch(obj){
	var _this = this;
	var div1 = obj;
	this.aBtn = div1.getElementsByTagName('input');
	this.aDiv = div1.getElementsByTagName('div');
	for(var i=0;i<this.aBtn.length;i++){
		this.aBtn[i].index=i;
		this.aBtn[i].onclick=function(){
			_this.fnClick(this);
		};
	}
}
TabSwitch.prototype.fnClick = function(oBtn){
	for(var j=0;j<this.aBtn.length;j++){
		this.aBtn[j].className='';
		this.aDiv[j].style.display='none';
	}
	oBtn.className='active';
	this.aDiv[oBtn.index].style.display='block';
};