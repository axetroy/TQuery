(function(){
//===============库扩展==============
/**
 * 数组对象
 * 倒序
 * 删除
 * 去重
 * 求和
 */
function $A(arr){
	return $a(arr);
}
function $a(arr){
	//保存数组
	this.arr = arr;
	//保存结果
	this.result = [];
}
$a.prototype.reverse = function(){
	this.result = this.split('').reverse().join('');
	return this;
};
$a.prototype.delete = function(n){
    if (n < 0) return this;
	if(typeof n == 'object' && n.push()){//如果是数组（区间）
		 return this.slice(0,n[0]).concat( this.slice( n[1]+1 , this.length) );
	}
   this.result = this.slice(0, n).concat( this.slice(n + 1, this.length) );//输出结果
};
$a.prototype.del = function(n) {
    if (n < 0) return this.arr;
    //如果是数组,[2,5]
	if(typeof n == 'object' && typeof n.push !="undefined" ){//如果是数组（区间）
		 this.result = this.arr.slice(0,n[0]).concat( this.arr.slice( n[1]+1 , this.arr.length) );
	}
	//如果是数字,2
    this.result = this.arr.slice(0, n).concat( this.arr.slice(n + 1, this.arr.length) );
    return this;
};
$a.prototype.unique = function(n){
   var a = {};//哈希表，用来存放不重复的数组
   var arr = this.arr;
   for (var i=0; i<arr.length; i++) {
	   var v = arr[i];
	   if (typeof(a[v]) == 'undefined'){
			a[v] = 1;
	   }
   }
   arr.length=0;//清空数组
   for (var k in a){//哈希表存放的不重复数据，存入数组中
		arr[arr.length] = k;  //this.length = 0 , 1 , 2 ……
   }
   this.result = arr;
   return this;
};
$a.prototype.sum = function(){
	var result = 0;
	var arr = this.arr;
	for( var i=0;i<arr.length;i++ ){
		result += arr[i];
	}
	this.result = result;
};
/**
 * 字符串对象
 * 倒序
 */
function $S(str){
	return $a(str);
}
function $s(str){
	//保存字符串
	this.str = str;
	//保存结果
	this.result = "";
}
String.prototype.reverse = function(){
	return this.split('').reverse().join('');
};
$s.prototype.reverse = function(){
	var str = this.str;
	this.result = str.split('').reverse().join('');
	return this;
};

/**
 * 拖拽
 * 使用方法 $('#div1').drag({"L":[100,500],"T":[200,500]})
 * #div1变成可变拖拽
 * json：限制拖拽范围
 * {
 * 		L:[100,500]		>>left值在100~500
 * 		T:[200,500]		>>top值在200~500
 * }
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
/**
 * 拖拽改变大小
 * 使用方法
 * pressTarget:按住的元素
 * MoveTarget：移动的元素
 * json：限制大小
 * {
 * 	width:[100,300],
 * 	height:[200,500]
 * }
 */
$().extend("tab",function(pressTarget,MoveTarget,json){
	return new Scale(pressTarget,MoveTarget,json);
});
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
/**
 * 选项卡切换
 * 使用方法:$('#div1').tab();
 * 结构:
 * 	<div id="div1">
		<input />
		<input />
		<input />
		<div></div>
		<div></div>
		<div></div>
	</div>
 */
$().extend("tab",function(){
	var target = this.elements[0];
	return new TabSwitch(target);
});
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
//Mutation监听
/**
 * Mutation监听
 * 使用方式：$('#div1').ob().observer({"childList":true},function(){});
 * 监听div1的子节点变化
 */
$().extend("ob",function(){
	var target = this.elements[0];
	return new Ob(target);
});
function Ob(target){
	this.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
	this.target = target;
}
Ob.prototype.observer = function(config,fn){
	var MutationObserver = this.MutationObserver,
		observer = new MutationObserver(function(mutations){
			mutations.forEach(function(mutation) {
					fn.call(this.target);
			});
		});
	observer.observe(this.target, config);
};



})($);