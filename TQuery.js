;(function(window,document){//自调用，避免全局污染
//========构造函数========
/**
 * [TQuery 构造器]
 * @param {[type]} tArg [selectors]，css选择器/function/object
 * tip:高级选择器不支持IE8。
 */
function TQuery(tArg){
	this.arg = tArg;//保存传进来的参数
	this.elements = [];//用来保存选择的元素
	this.doc = document;
	this.version = 1.0;
	switch( typeof tArg ){
		case "undefined" :
			return this;
		case "function" :
			addEvent(window,'load',tArg);
			break;
		case "string" :
				switch( tArg.charAt(0) ){
					case '<' :	//<div></div>，创建元素
						/**
						 * [HTML选择器]
						 * @type {[type]}
						 * <div data-src='{a:1,b=2}'>asdasd</div><input type='button' value='按钮' placeholder='搜索' style='width:400px;height:500px;background:#303030' />
						 */
						var oDiv = document.createElement('div');//创建一个容器
						var oFragment = document.createDocumentFragment();//创建文档碎片
						oDiv.innerHTML = tArg;
						var child = oDiv.getElementsByTagName('*');
						//储存在文档碎片中
						for( var t=0;t<child.length;t++ ){
							var clone = child[t].cloneNode(true);
							oFragment.appendChild(clone);
						}
						//输出到对象中
						var temp = [];
						for(var i=0;i<oFragment.childNodes.length;i++){
							temp.push(oFragment.childNodes[i]);
						}
						this.elements = temp;
						break;
					default:	//默认情况下是选择符
						if(this.doc.querySelectorAll){//现代浏览器
							var aElems = this.doc.querySelectorAll(tArg);
							for(var o=0;o<aElems.length;o++){
								this.elements.push(aElems[o]);
							}
						}else{//通用，兼容到IE5-11，firefox，chrome…………，但是不支持高级选择器
								var elements = tArg.split(/\s+/ig);	//拆分节点，并且保持进数组[ul,li,a]
								var childElements = [];			//创建一个临时数组
								var parentNode = [];			//用来存放父节点
								var aElement;
								var temps = [];
								for(var h=0;h<elements.length;h++){
									switch( elements[h].charAt(0) ){
										case "#" ://ID
											childElements = [];//清理临时节点，以便父节点失效，子节点有效
											childElements.push( document.getElementById(elements[h].substring(1)) );
											parentNode = childElements;	//保存父节点，因为childElements需要清理，所以需要创建node储存。
											break;
										case "." ://class
											childElements = [];//清理临时节点，以便父节点失效，子节点有效
											//输出父节点，如果开头为  '.ul li'
											if(parentNode==='' || parentNode === null){
												aElement = getByClass(document,elements[0].substring(1));
												for(var y=0;y<aElement.length;y++){
													parentNode.push( aElement[y] );
												}
												childElements = parentNode;
												break;
											}
											//输出子集节点
											for(var j=0;j<parentNode.length;j++){
												temps =[];		//创建一个临时数组，用于储存子集元素
												aElement = getByClass(parentNode[j],elements[h].substring(1));
												for(var x=0;x<aElement.length;x++){
													temps.push( aElement[x] );
												}
												for(var k=0;k<temps.length;k++){
													childElements.push( temps[k] );
												}
											}
											break;
										default : //tagName
											childElements = [];//清理临时节点，以便父节点失效，子节点有效
											//输出父节点，如果开头为  'ul li'
											if(parentNode==='' || parentNode === null){
												aElement = document.getElementsByTagName(elements[0]);
												for(var l =0;l<aElement.length;l++){
													parentNode.push( aElement[l] );
												}
												childElements = parentNode;
												break;
											}
											//输出子集节点
											for(var z=0;z<parentNode.length;z++){
												temps =[];		//创建一个临时数组，用于储存子集元素
												aElement = parentNode[z].getElementsByTagName(elements[z]);//获取伙计下的所有子集元素
												for(var p=0;p<aElement.length;p++){
													temps.push( aElement[p] );
												}
												for(var u=0;u<temps.length;u++){
													childElements.push( temps[u] );
												}
											}
									}//switch
								}//for
								this.elements = childElements;
						}
					break;
				}
			break;
		case "object" : //对象
			this.elements.push(tArg);
			break;
	}
	this.length = this.elements.length;
}
//========选择器和过滤器========
/**
 * [eq 下标选择器]
 * @param  {[type]} n [下标>0]默认0
 * @return {[type]}   [this.elements[n]]
 */
TQuery.prototype.eq = function(n){
	var m = n || 0;
	this.length = 1;
	return $(this.elements[m]);//作为对象存进this.elements，以便链式结构
};
/**
 * [not 从元素集合中，剔除某些部分]
 * @param  {[type]} str [CSS选择器]
 * @return {[type]}     [this]
 * example $('ul li').not('.item')	从众多li中，删除class=item的项
 */
TQuery.prototype.not = function(str){
	var childElements = [];//存放临时数据
	for(var i=0;i<this.length;i++){
		switch( str.charAt(0) ){
			case '#':	//id
				if( $(this.elements[i]).attr('id') != str.substring(1) ){
					childElements.push( this.elements[i] );
				}
				break;
			case '.':	//class
				if( !this.hasClass(this.elements[i],str.substring(1)) ){//没有匹配到class
					childElements.push( this.elements[i] );
				}
				break;
			default :	//tagName
				if( this.elements[i].tagName != str.toUpperCase() ){
					childElements.push( this.elements[i] );
				}
		}
	}
	this.elements = childElements;
	this.length = childElements.length;
	return this;
};
/**
 * [filter 从元素集合众，特选某些部分]
 * @param  {[type]} str [CSS选择器]
 * @return {[type]}     [this]
 * example $('ul li').filter('.item')	从众多li中，选出class=item的项
 */
TQuery.prototype.filter = function(str){
	var childElements = [];//存放临时数据
	for(var i=0;i<this.length;i++){
		var ele = this.elements[i];
		switch(str.charAt(0)){
			case '#':
				if( $(ele).attr('id') == str.substring(1) ){
					childElements.push( ele );
				}
				break;
			case '.':
				if( this.hasClass(ele,str.substring(1)) ){//如果有class
					childElements.push( ele );
				}
				break;
			case '[' :
				var attrinfo = str.replace(/(\[+|\]+|\"|\"+])/g,'').split('=');
				var attr = attrinfo[0];
				var value = attrinfo[1];
				if(attrinfo.length === 1){//只过滤属性，没有值
					if( ele[attr] !==null || ele.getAttribute(attr) ){
						childElements.push( ele );
					}
				}else if( attrinfo.length ==2 ){//过滤属性值
					if( ele[attr]==value || ele.getAttribute(attr)==value ){
						childElements.push( ele );
					}
				}
				break;
			default:
				if( ele.tagName == str.toUpperCase() ){
					childElements.push( ele );
				}
		}
	}
	this.elements = childElements;
	this.length = childElements.length;
	return this;
};
/**
 * [find 在已有的元素中，选择子节点]
 * @param  {[type]} str [CSS选择器],IE8下，支持id，class，tagName，attr
 * @return {[type]}     [this]
 * example $('ul').find('li'),$('ul').find('[data-src]')
 */
TQuery.prototype.find = function(str){
	var childElements = [];//存放临时数据
	for(var i=0;i<this.length;i++){
		if(document.querySelectorAll){//现代浏览器
			var aElems = this.elements[i].querySelectorAll(str);
			var length = aElems.length;
			var j =0;
			while(j<length){
				childElements.push( aElems[j] );
				j++;
			}
		}else{//通用，支持IE8一下
			switch( str.charAt(0) ){
				case '#' : 	//#div1
					var aElemsid = this.elements[i].getElementById(str.substring(1));
					childElements.push( aElemsid );
					break;
				case '.' :	//.class
					var aElemsclass= getByClass( this.elements[i],str.substring(1) );
					childElements = childElements.concat(aElemsclass);
					break;
				case '[' ://属性选择器[data=""]
					var attrinfo = str.replace(/(\[+|\]+|\"|\"+])/g,'').split('=');
					var attr = attrinfo[0];
					var child =  this.elements[i].children;
					var childLength = child.length;
					var getvalue;
					if( attrinfo.length === 1 ){//如果只有属性，没有值
						for(var x=0;x<childLength;x++){
							getvalue = child[x].getAttribute(attr);
							if( getvalue!==null ){
								childElements.push( child[x] );
							}
						}
					}else if( attrinfo.length === 2 ){//如果有值
						var value = attrinfo[1];
						for(var y=0;y<childLength;y++){
							getvalue = child[y].getAttribute(attr);
							if( getvalue!==null && getvalue == value ){
								childElements.push( child[y] );
							}
						}
					}
					break;
				default :	//tagName
					var aElemstag = this.elements[i].getElementsByTagName(str);
					var tagLength = aElemstag.length;
					for(var k=0;k<tagLength;k++){
						childElements.push( aElemstag[k] );
					}
			}
		}
	}
	this.elements = childElements;
	this.length = childElements.length;
	return this;
};
/**
 * [add 新增DOM元素到已有的集合]
 * @param {[type]} str [CSS选择器]
 * example $('p').css('width','500').add('span').css('display','block');
 */
TQuery.prototype.add = function(str){
	var newTQ = $(str);//先获取元素
	var newTQLength = newTQ.length;
	var temps = this.elements;
	var a = {};
	for(var i=0;i<this.length;i++){//把原有的元素导入a对象
		a[ this.elements[i] ] = 1;
	}
	for(var j=0;j<newTQLength;j++){//导入要添加的元素
		var v = newTQ.elements[j];
		if(typeof a[ v ] =='undefined'){//如果不重复，则添加进去
			a[v] = 1;//随便设置
			temps.push( v );
		}
	}
	this.elements = temps;
	this.length = this.elements.length;//生成新的长度
	return this;//返回对象
};
/**
 * [parent 当前所选元素[0]的第一个父节点]
 * @return {[type]} [this]
 */
TQuery.prototype.parent = function(){
	var firstNode = this.elements[0].parentNode;
	this.elements.length = 0;//清空
	this.elements.push( firstNode );
	this.length = this.elements.length;//重置长度
	return this;
};
/**
 * [parents 被选元素的上一级父节点，不重复]
 * @return {[type]} [this]
 */
TQuery.prototype.parents = function(){
	var temps = [];//存储所有的父节点
	var a = {};
	for(var i=0;i<this.length;i++){
	   var v = this.elements[i].parentNode;
	   if (typeof(a[v]) == 'undefined'){//如果不存在，则存入对象
			a[v] = 1;
			temps.push( v );
	   }
	}
	this.elements = temps;
	this.length = this.elements.length;//重置长度
	return this;
};
/**
 * [children 被选元素的下一级子节点，不重复]
 * @return {[type]} [this]
 */
TQuery.prototype.children = function(){
	var childElements = [];//存放所有的子节点
	var thischildren;
	var hub = {};//过滤已经重复的子节点,中转站
	for(var i=0;i<this.length;i++){
		if( this.elements[i].hasChildNodes() === false ){
			continue;
		}
		thischildren = this.elements[i].children;
		var length = thischildren.length;
		for(var j=0;j<length;j++){
			childElements.push( thischildren[j] );
		}
	}
	for(var k=0;k<childElements.length;k++){
		var v = childElements[k];
		if( typeof (hub[v]) =='undefined' ){
			hub[v] = 1;
		}
	}
	this.elements.length = 0;
	for( var child in hub ){
		this.elements[this.elements.length] = child;
	}
	this.length = this.elements.length;
	return this;
};
/**
 * [prev 选择被选元素，所有的上一个兄弟节点]
 * @return {[type]} [description]
 */
TQuery.prototype.prev = function(){
	var temps = [];
	for(var i=0;i<this.length;i++){
		var ele = this.elements[i];
		if( $(ele).index()===0 ){//如果处在第一位，没有上一个兄弟节点
			continue;
		}
		temps.push(ele.parentNode.children[ $(ele).index()-1 ] );
	}
	this.elements = temps;
	this.length = this.elements.length;
	return this;
};
TQuery.prototype.prevAll = function(){
	var temps = [];
	this.siblings();
	return this;
};
/**
 * [next 选择被选元素，所有的下一个兄弟节点]
 * @return {Function} [description]
 */
TQuery.prototype.next = function(){
	var temps = [];
	for(var i=0;i<this.length;i++){
		var ele = this.elements[i];
		if( $(ele).index()==ele.parentNode.children.length-1 ){//如果处最后一位，没有下一个兄弟节点
			continue;
		}
		temps.push(ele.parentNode.children[ $(ele).index()+1 ] );
	}
	this.elements = temps;
	this.length = this.elements.length;
	return this;
};
TQuery.prototype.nextAll = function(){
	var selector = this.elements;//获取当前所选元素
	this.siblings();
	var bro = this.elements;//所有兄弟节点
	for(var i=0;i<bro.length;i++){

	}
	var a = {};
	if( a ){

	}
	return this;
};
/**
 * [siblings 选取/过滤所有兄弟节点]
 * @param  {[type]} str [css选择器字符]，如果存在，则过滤
 * @return {[type]}     [description]
 */
TQuery.prototype.siblings = function(str){
	var temps = [];
	var parentNode = this.parents().elements;
	var parentNodeLength = parentNode.length;
	var allChild;
	for(var i=0;i<parentNodeLength;i++){
		allChild = parentNode[i].children;//所有同胞元素集合
		for(var j=0;j<allChild.length;j++){
			temps.push( allChild[j] );//获取所有同胞元素，包括自身
		}
	}
	this.elements = temps;
	this.length = this.elements.length;
	//如果有参数传入，则过滤同胞元素
	if(str){
		this.filter( str );
	}
	return this;
};
//将所选的元素集合，缩短至(n,m)之间
/**
 * [slice 将所选的元素集合，缩短至(n,m)之间]
 * @param  {[type]} n [起始位置]
 * @param  {[type]} m [终止位置]
 * @return {[type]}   [this]
 */
TQuery.prototype.slice = function(n,m){
	if(n<0 || m>this.length) return;//超出范围
	var temps = this.elements;
	var newarr = temps.slice(n,m+1);
	this.elements = newarr;
	this.length = this.elements.length;
	return this;
};
//========事件操作========
/**
 * [ready ready后执行]
 * @param  {Function} fn [函数]
 * @return {[type]}      [this]
 */
TQuery.prototype.ready = function(fn){
	for(var i=0;i<this.length;i++){
		$(this.elements[i]).bind('onload',function(){
			fn.call(this.elements[i]);
		});
	}
	return this;
};
/**
 * [each 为匹配的元素，循环遍历]
 * @param  {Function} fn [函数]
 * @return {[type]}      [this]
 */
TQuery.prototype.each = function(fn){
	for(var i=0;i<this.length;i++){
		var _this = this.elements[i];
		fn.call(_this);
	}
	return this;
};
/**
 * [trigger 触发所选元素的指定事件,目前只能触发DOM1级事件]
 * @param  {[type]} type [事件类型]
 * @return {[type]}      [this]
 */
TQuery.prototype.trigger = function(type){
	var fn = this.elements[0]['on' + type ] ;
	var _this = this.elements[0];//修正this不正确的问题
	if( typeof fn !='undefined' ){
		fn.call(_this);
	}else{
		console.log( 'can not find event:' + type );
	}
	return this;
};
/**
 * [click DOM2级click事件]
 * @param  {Function} fn [函数]
 * @return {[type]}      [this]
 */
TQuery.prototype.click = function(fn){
	var length = this.elements.length;
	for(var i=0;i<length;i++){
		addEvent(this.elements[i],'click',fn);
	}
	return this;
};
/**
 * [bind DOM2级事件绑定]
 * @param  {[type]}   type [事件类型]
 * @param  {Function} fn   [函数]
 * @return {[type]}        [this]
 */
TQuery.prototype.bind = function(type,fn){
	//如果只传一个json参数e
	if(arguments.length==1){
		for(var k=0;k<this.length;k++){
			for(var attr in type){
				addEvent(this.elements[k],attr,type[attr]);
			}
		}
	}
	//如果传两个参数，则多个事件统一执行一个e
	else{
		var events = type.split(' ');
		var eventsLength = events.length;
		for(var i=0;i<this.length;i++){
			var j=0;
			while(j<eventsLength){
				addEvent(this.elements[i],events[j],fn);
				j++;
			}
		}
	}
	return this;
};
/**
 * [unbind 解除绑定DOM2级事件]，匿名函数无法解除
 * @param  {[type]}   e  [事件类型]
 * @param  {Function} fn [执行的函数]
 * @return {[type]}      [this]
 */
TQuery.prototype.unbind = function(e,fn){
	for(var i=0;i<this.length;i++){
		removeEvent(this.elements[i],e,fn);
	}
	return this;
};
/**
 * [on DOM0级事件]
 * @param  {[type]}   type [事件类型/json]
 * @param  {Function} fn   [执行的函数]
 * @return {[type]}        [this]
 */
TQuery.prototype.on = function(type,fn){
	//如果只传一个json参数
	if(arguments.length==1){
		for(var k=0;k<this.length;k++){
			for(var attr in type){
				this.elements[k][ 'on'+attr ] = type[attr];
			}
		}
	}
	//如果传两个参数e,fn
	else{
		var events = type.split(' ');//获取每个事件
		var eventsLength = events.length;
		for(var i=0;i<this.length;i++){
			var j =0;
			while(j<eventsLength){
				this.elements[i][ 'on'+events[j] ] = fn;
				j++;
			}
		}
	}
	return this;
};
/**
 * [one 执行一次操作]
 * @param  {[type]}   e  [事件类型]
 * @param  {Function} fn [执行的函数]
 * @return {[type]}      [this]
 */
TQuery.prototype.one = function(e,fn){
	var _this = this;
	for(var i=0;i<this.length;i++){
		this.on(e,function(){
			fn.call(_this);
			var es = e.split(' ');
			var j=0;
			while(j<es.length){
				this['on'+es[j]] = null;
				j++;
			}
		});
	}
	return this;
};
/**
 * [hover hover属性]
 * @param  {[type]} json [out(),outDelay,over(),overDelay],delay默认为0
 * @return {[type]}      [this]
 */
TQuery.prototype.hover = function(json){
	if( typeof json.overDelay=='undefined' ){
		json.overDelay = 0;
	}
	if( typeof json.outDelay=='undefined' ){
		json.outDelay = 0;
	}
	this.bind({
		'mouseover':function(){
			var _this = this;
			clearTimeout( this.hover );
			this.hover = setTimeout(function(){
				json.over.call(_this);
			},json.overDelay);
		},
		'mouseout':function(){
			var this_ = this;
			clearTimeout( this.hover );
			this.hover = setTimeout(function(){
				json.out.call(this_);
			},json.outDelay);
		}
	});
	return this;
};
/**
 * [toggle 点击开关toggle]
 * @param  {[type]} fn1,fn2,fn3,fn4…… [一次循环执行传入进来的函数]
 * @return {[type]} [this]
 */
TQuery.prototype.toggle = function(){
	var _arguments = arguments;
	var	length = _arguments.length;
	var count = 0;
	for(var i=0;i<this.length;i++){
		var _this = this.elements[i];
		this.on('click',function(){
			_arguments[count++%length].call(_this);//执行	，解决this错误的问题
		});
	}
	return this;
};

/**
 * [mouseScroll 鼠标滚轮滚动事件]
 * @param  {[type]} json [up:向上滚动触发的事件,down:向下滚动触发的事件]
 * @return {[type]}      [this]
 *  IE			attachEvent				mousewheel				wheelDelta		滚轮下e.wheelDelta<0
	firefox		addEventListener		DOMMouseScroll			detail			滚轮下e.detail>0
	chrome		addEventListener		mousewheel				wheelDelta		滚轮下e.wheelDelta<0
 */
TQuery.prototype.mouseScroll = function(json){
	this.bind('mousewheel DOMMouseScroll',function(e){
		if(e.wheelDelta){//chrome,ie
			if( e.wheelDelta > 0 ){//滚轮向下滚动
				json.up.call(this,e);
			}else{
				json.down.call(this,e);
			}
		}else{//狗日的firefox
			if(e.detail<0){//鼠标滚轮按下
				json.up.call(this,e);
			}else{
				json.down.call(this,e);
			}
		}
	});
	return this;
};
/**
 * [scrollTop 页面滚动到某一位置/获取滚动条位置]
 * @param  {[type]} target [目标点]
 * @param  {[type]} endFn  [回调函数]
 * @return {[type]}        [this]
 */
TQuery.prototype.scrollTop = function(target,endFn){
	if(target!==0 && !target){//没有参数，则读取
		var scrollTop = this.doc.body.scrollTop || this.doc.documentElement.scrollTop;
		return scrollTop;
	}
	var _this = this;
	clearInterval(this.doc.timerScroll);
	this.doc.timerScroll = setInterval(function(){
		var nowScrollTop = _this.doc.body.scrollTop || _this.doc.documentElement.scrollTop;
		var dif = Math.abs(nowScrollTop-target);	//目前与目标的差值
		var speed = (dif/10)+10;	//滚动速度
		if(nowScrollTop-target<0){//向下滚
			speed = speed;
		}else{//向上滚动
			speed = - speed;
		}
		var position = nowScrollTop + (speed);	//生成计算后的位置
		if( (speed>0 && position>=target) || (speed<0 && position<=target) ){//如果到达目标点
			_this.doc.body.scrollTop = _this.doc.documentElement.scrollTop = target;
			endFn && endFn.call(_this);	//防止this冲突，此处this指的是TQuery对象
			clearInterval(_this.doc.timerScroll);
		}
		_this.doc.body.scrollTop = _this.doc.documentElement.scrollTop = position;
	},20);
	return this;//返回对象，进行链式操作
};
/**
 * [scroll 页面滚动到顶部或底部]
 * @param  {[type]} dir   [方向]，dir>0，向上滚，dir<0，向下滚
 * @param  {[type]} step  [每次步长]默认10px
 * @param  {[type]} endFn [回调函数]
 * @return {[type]}       [this]
 */
TQuery.prototype.scroll = function(dir,step,endFn) { //obj随意，dir>0往上滚，dir<0往下滚
	var step1 = step || 10;
	clearInterval(this.doc.timerScroll);
	var _this = this;
	var speed;
	this.doc.timerScroll = setInterval(function() {
		var position;
		//往上滚动
		if (dir == 'up') { 
			speed = ($(this).size('scrollTop') / step1) + 1;
			position = $(this).size('scrollTop') - speed;
			if (position <= 0) { //如果滚到顶部
				_this.doc.body.scrollTop = _this.doc.documentElement.scrollTop = 0;
				endFn && endFn();
				clearInterval(_this.doc.timerScroll);
			}
		}
		//往下滚动
		else if(dir == 'down'){ 
			speed = (($(this).size('scrollHeight') - $(this).size('scrollTop') - $(this).size('clientHeight')) / step) + 1;
			position = $(this).size('scrollTop') + speed;
			if (position + $(this).size('clientHeight') >= $(this).size('scrollHeight')) { //如果滚到底部
				_this.doc.body.scrollTop = _this.doc.documentElement.scrollTop = $(this).size('scrollHeight');
				endFn && endFn();
				clearInterval(_this.doc.timerScroll);
			}
		}
		_this.doc.body.scrollTop = _this.doc.documentElement.scrollTop = position;
	}, 20);
	return this;
};
//show
/**
 * [show 显示所选元素]
 * @return {[type]} [this]
 */
TQuery.prototype.show = function(){
	for(var i=0;i<this.length;i++){
		this.elements[i].style.display = 'block';
	}
	return this;
};
/**
 * [hide 隐藏所选元素]
 * @return {[type]} [this]
 */
TQuery.prototype.hide = function(){
	for(var i=0;i<this.length;i++){
		this.elements[i].style.display = 'none';
	}
	return this;
};
/**
 * [mutation DOM变动观察器,监听所选择的元素]
 * @param  {[type]}   options [配置项{}]
 * @param  {Function} fn      [执行的函数]
 * @return {[type]}           [this]
 */
TQuery.prototype.mutation = function(options,fn){
	var MutationObserver,observer;
	for( var i=0;i<this.length;i++){
		MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
		observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				fn.call(this.elements[i]);
			});
		});
		observer.observe(this.elements[i], options);
	}
	return this;
};
/**
 * [ajax 异步请求]
 * @param  {[type]} url      [请求地址]
 * @param  {[type]} SucessFn [请求成功执行]
 * @param  {[type]} FaildFn  [请求失败执行]
 * @return {[type]}          [null]
 */
TQuery.prototype.ajax = function(url,SucessFn,FaildFn){
	/*
		1，实例化对XMLHttpRequese对象
		2，ajax对象的open方法服务器
		3，ajax对象的send方法，发送请求
		4，监听onreadystatechange变化
			0，readyState，请求初始化，open方法没有被调用
			1，与服务器连接，open已调用
			2，请求已接收，（服务器收到请求的头部信息）
			3，请求处理中，（服务器收到请求的主体内容）
			4，响应完成，并且返回数据
				返回值有ajax.responseText和ajax.responseXML
	*/
	var oAjax;
	if(window.XMLHttpRequest){//IE7+，chrome，firefox，opara，safari
		oAjax=new XMLHttpRequest();
	}else{//兼容非IE6
		oAjax=new ActiveXObject("Microsoft.XMLHTTP");//IE5，IE6
	}
	oAjax.open('GET',url,true);//true为异步，false为同步
	oAjax.send();//post请求就需要填写参数string
	oAjax.onreadystatechange=function(){
		if(oAjax.readyState==4){	//响应完成
			if(oAjax.status==200){//状态码=200，请求成功
				SucessFn(oAjax.responseText);//传参返回值
			}else{//读取失败
					FaildFn && FaildFn(oAjax.status);
			}
		}
	};
};
//==========尺寸size========
/**
 * [width 设置/读取DOM节点的width/height]
 * @param  {[type]} setting [设置值]，可以不带单位px
 * @return {[type]}         [读取值/this]
 */
TQuery.prototype.width = function(setting){
	if(!setting && this.elements[0] instanceof Object && (this.elements[0].alert || this.elements[0].body) ){//如果是window，或document
		return this.doc.body.scrollWidth> this.doc.documentElement.scrollWidth ? this.doc.body.scrollWidth : this.doc.documentElement.scrollWidth;//获取带padding和margin的值
	}else if(setting){//设置宽度
		for(var i=0;i<this.length;i++){
			this.elements[i].style.width = setting.toString().replace('px','') + 'px';
		}
		return this;//返回对象，进行链式操作
	}else{//读取
		return this.elements[0].offsetWidth || parseFloat( this.style('width') );//读取
	}
};
TQuery.prototype.height = function(setting){
	if(this.elements[0] instanceof Object && (this.elements[0].alert || this.elements[0].body) ){//如果是window，或document，则返回整个文档高度
		return this.doc.body.scrollHeight>this.doc.documentElement.scrollHeight ? this.doc.body.clientHeight : this.doc.documentElement.scrollHeight;//获取带padding和margin的值
	}else if(setting){//设置高度
		for(var i=0;i<this.length;i++){
			this.elements[i].style.height = setting.toString().replace('px','') + 'px';
		}
		return this;//返回对象，进行链式操作
	}else if(!setting){
		return this.elements[0].offsetHeight || parseFloat( this.style('height') );//获取高度
	}
};
/**
 * [top 设置/读取DOM节点的top/left]
 * @param  {[type]} setting [top/left的值]
 * @return {[type]}         [this/读取值]
 */
TQuery.prototype.top = function(setting){
	if(setting){
		this.css('top',setting);
		return this;//返回对象，进行链式操作
	}
	return parseInt( this.elements[0].offsetTop );
};
TQuery.prototype.left = function(setting){
	if(setting){
		this.css('left',setting);
		return this;//返回对象，进行链式操作
	}
	return parseInt( this.elements[0].offsetLeft );
};
/**
 * [viewWidth/viewHeight 获取可视区域宽高]
 * @return {[type]} [可视区域宽高]
 */
TQuery.prototype.viewWidth = function(){
	return this.doc.body.clientWidth<this.doc.documentElement.clientWidth ? this.doc.body.clientWidth : this.doc.documentElement.clientWidth;//取较小值
};
TQuery.prototype.viewHeight = function(){
	return this.doc.body.clientHeight<this.doc.documentElement.clientHeight ? this.doc.body.clientHeight : this.doc.documentElement.clientHeight;//取较小值
};
/**
 * [style 返回计算后的style样式，带单位]
 * @param  {[type]} attr [style属性]
 * @return {[type]}      [style属性值]
 */
TQuery.prototype.style = function(attr){
	//IE下，如果宽高设置为百分比，则返回也是百分比。
	return this.elements[0].currentStyle ? this.elements[0].currentStyle[attr] : getComputedStyle(this.elements[0])[attr];
};
/**
 * [size 返回个BOM的尺寸]
 * @param  {[type]} attr [BOM属性]
 * @return {[type]}      [BOM属性值]
 */
TQuery.prototype.size = function(attr){
	return this.doc.documentElement[attr] ? this.doc.documentElement[attr] : this.doc.body[attr];
};

//===========属性attribute设置========
/**
 * [css 设置/读取css样式]
 * @param  {[type]} attr  [style属性/json]，可以不带单位px，支持设置百分比%，纯CSS写法。
 * @param  {[type]} value [style属性值]，如果不存在，则读取样式
 * @return {[type]}       [style属性值/this]
 */
TQuery.prototype.css = function(attr,value){
	var type = /^(width|left|top|bottom|right|line-height|font-size)+/ig;
	var type2 = /^(height|margin|padding)+/ig;
	var type3 = /\d+(px)/ig;
	var type4 = /\:/ig;
	if(arguments.length==2){//两个参数
		//设置
		if( type.test(attr) && value.indexOf('%')<0 ){
			value = parseFloat(value).toFixed(2) + 'px';
		}
		for(var m=0;m<this.length;m++){
			this.elements[m].style[attr] = value;
		}
	}else{//一个参数
		if(typeof attr=="string"){//获取样式
			//设置,background:#303030;font-size:20px;
			if( type4.test(attr) ){
				for(var x=0;x<this.length;x++){
					this.elements[x].style.cssText = attr;
				}
			}
			//读取
			else{
				return this.elements[0].currentStyle ? this.elements[0].currentStyle[attr] : getComputedStyle(this.elements[0])[attr];
			}
		}else if( typeof(attr) == "object" && Object.prototype.toString.call(attr).toLowerCase() == "[object object]" && !attr.length ){//json
			//json设置样式
			var css = "";
			for(var i =0;i<this.length;i++){
				//JS写法
				// for(var k in attr){
				// 	//k == 属性名字,width,height,opacity等
				// 	//attr[k] == 属性值,300px,#303030等
				// 	if((type.test(k) || type2.test(k)) && attr[k].indexOf('%')<0 ){//如果没有%符号
				// 		attr[k] = parseFloat( attr[k] ).toFixed(2) + 'px';
				// 	}
				// 	this.elements[i].style[k] = attr[k];
				// }
				//纯CSS写法
				for(var k in attr){
					//k == 属性名字,width,height,opacity等
					//attr[k] == 属性值,300px,#303030等
					if((type.test(k) || type2.test(k)) && attr[k].indexOf('%')<0 ){//如果是带像素的属性，并且没有%符号
						attr[k] = parseFloat( attr[k] ).toFixed(2) + 'px';
					}
					css += k+":"+attr[k]+";";
				}
				this.elements[i].style.cssText = css;
			}
		}
	}
	return this;
};
/**
 * [animate 设置动画]
 * @param  {[type]} json       [要变动的属性:属性值],可以不带单位px，不支持百分比%，opacity单位100制
 * @param  {[type]} configjson [load:每次变动执行,end:动画结束后执行,speed:每次变化的速度]
 * @return {[type]}            [this]
 */
TQuery.prototype.animate = function(json,configjson){
	//如果两个参数.animate('width','300');
	for(var i=0;i<this.length;i++){
		var _this = this.elements[i];
		clearInterval(_this.animate);
		_this.animate = setInterval(function() {
			//注意，此处this指的是window（匿名函数）
			var bStop = true;//判断运动是否停止
			for(var attr in json){//attr代表属性,'width','height'.而json[attr]代表数值
				// 1. 取得当前的值（可以是width，height，opacity等的值）
				var objAttr = 0 ;
				if(attr == 'opacity'){//获取当前数值
					objAttr = Math.round(parseFloat( $(_this).style(attr) ) * 100);
				}else{
					objAttr = parseInt( $(_this).style(attr) );
				}
				// 2.计算运动速度
				var jsonattr = parseFloat( json[attr] );
				var speedConfig = (configjson && typeof ( configjson.speed ) != 'undefined') ? configjson.speed : 10;
				var iSpeed = (jsonattr - objAttr) / speedConfig;	//(目标数值-当前数值)/10
				iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);	//如果速度>0，则速度向上取整，如果小于0，则保留小数
				// 3. 检测所有运动是否到达目标
				//objAttr,当前点，json[attr]为目标点
				if ( (iSpeed>0 && objAttr <= jsonattr) || (iSpeed<0 && objAttr >= jsonattr) ) {//如果有其中一项没有达到目标
					bStop = false;
				}
				if (attr == "opacity") {
					_this.style.filter = 'alpha(opacity:' + (objAttr + iSpeed) + ')';
					_this.style.opacity = (objAttr + iSpeed) / 100;
				} else {
					_this.style[attr] = objAttr + iSpeed + 'px';	//赋值开始运动
				}
				if( configjson && typeof configjson.load !='undefined' ){
					configjson.load.call(_this);
				}
				if (bStop) { // 表示所有运动都到达目标值
					clearInterval(_this.animate);
					if( configjson && typeof configjson.end != 'undefined' ){
						configjson.end.call(_this);
					}
				}
			}
		},30);
	}
	return this;
};
/**
 * [stop 停止animate动画]
 * @param  {[type]} delay [延迟时间]
 * @return {[type]}       [this]
 */
TQuery.prototype.stop = function(delay){
	var stardelay = delay ? delay : 0;
	setTimeout(function(){
		clearInterval( $(this).elements[0].animate );
	},stardelay);
	return this;
};
/**
 * [attr 设置/读取属性]
 * @param  {[type]} attr  [属性名称]>>>>字符串或json
 * @param  {[type]} value [属性值]>>>>>>如果不存在，则读取属性
 * @return {[type]}       [读取值/this]
 */
TQuery.prototype.attr = function(attr,value){
	if(arguments.length==2){//2个参数，设置属性
		for(var k=0;k<this.length;k++){
			if(this.elements[k][attr]){
				this.elements[k][attr] = value;
			}else{
				this.elements[k].setAttribute(attr,value);
			}
		}
	}else if(arguments.length==1){//1个参数
		//JSON，设置属性
		if( typeof(attr) == "object" && Object.prototype.toString.call(attr).toLowerCase() == "[object object]" && !attr.length ){//如果是json，则分别设置属性
			for(var i=0;i<this.length;i++){
				for(var j in attr){
					if( this.elements[i][j] ){//如果属性是可以直接读取
						this.elements[i][j] = attr[j];
					}else{//如果是自定义属性
						this.elements[i].setAttribute(j,attr[j]);
					}
				}
			}
		}
		//字符串
		else{
			//如果是一长串字符串设置' type="button" value="按钮" placeholder="请点击" ',则设置
			var reg = /(\w+)(\=)(("|')?[\w\u4E00-\u9FA5]+("|')?)/img;
			var attr1;
			if(str.match(reg2).length>0){
				for(var b=0;b<arr.length;b++){
					attr1 = arr[b].toString().split('=');
					var key = attr[0];
					var value1 = attr[1].replace(/'|"/img,"");
					for(var o=0;o<this.length;o++){
						this.elements[o][key] = value1;
					}
					
				}
			}
			//否则读取
			return this.elements[0][attr] || this.elements[0].getAttribute(attr);
		}
	}
	return this;
};
/**
 * [hasClass 判断是否存在class]
 * @param  {[type]}  obj   [判断目标]
 * @param  {[type]}  cName [class]
 * @return {Boolean}       [true/false]
 */
TQuery.prototype.hasClass = function(obj,cName){
	// ( \\s|^ ) 判断前面是否有空格 （\\s | $ ）判断后面是否有空格 两个感叹号为转换为布尔值 以方便做判断
	return !! obj.className.match(new RegExp("(\\s|^)" + cName + "(\\s|$)"));
};
/**
 * [addClass 添加class]
 * @param {[type]} cName [class]
 */
TQuery.prototype.addClass = function(cName){
	for(var i=0;i<this.length;i++){
		if (!this.hasClass(this.elements[i],cName)) {//如果不存在class
			if( this.elements[i].className === null || this.elements[i].className === '' ){
				this.elements[i].className = cName;
			}else{
				this.elements[i].className += " " + cName;
				if(this.elements[i].className){

				}
			}
		}
	}
	return this;//返回对象，进行链式操作
};
/**
 * [removeClass 移除class]
 * @param  {[type]} cName [class]
 * @return {[type]}       [this]
 */
TQuery.prototype.removeClass = function(cName){
	for(var i=0;i<this.length;i++){
		if (this.hasClass(this.elements[i],cName)) {
			this.elements[i].className = this.elements[i].className.replace(new RegExp("(\\s|^)" + cName + "(\\s|$)"), ""); // replace方法是替换 
		}
	}
	return this;//返回对象，进行链式操作
};
//===========DOM节点操作========
/**
 * [append 在所选元素的最后插入content]
 * @param  {[type]} content [要插入的内容]
 * @return {[type]}         [this]
 */
TQuery.prototype.append = function(content){
	for(var i=0;i<this.length;i++){
		var thml = $(this).eq(i).html();
		$(this).eq(i).html(html + content);
	}
};
/**
 * [appendChild 把选择的元素，插入到obj的子集元素最后]
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
TQuery.prototype.appendChild = function(obj){
	for(var i=0;i<this.length;i++){

	}
};
TQuery.prototype.prepend = function(){

};
TQuery.prototype.prependChild = function(){

};
/**
 * [insertAfter 把选择的元素，插入到obj的后面]
 * @param  {[type]} obj [插入的位置]
 * @return {[type]}     [this]
 */
TQuery.prototype.insertAfter = function(obj){
	var parent,
		oFragment = document.createDocumentFragment();//创建文档碎片;
	for(var i=0;i<this.length;i++){
		oFragment.appendChild(this.elements[i]);
	}
	parent = obj.parentNode;//插入位置的父元素
	if(parent.lastChild == obj){//如果最后的节点是目标节点，直接添加
		parent.appendChild(oFragment);
	}else{//如果不是，则插入在目标元素的下一个兄弟节点的前面，也就是目标元素的后面
		parent.insertBefore(oFragment,obj.nextSibling);
	}
	return this;//返回对象，进行链式操作
};
/**
 * [insertBefore 把选择的元素，插入到obj的前面]
 * @param  {[type]} obj [插入的位置]
 * @return {[type]}     [this]
 */
TQuery.prototype.insertBefore =function(obj){
	var oFragment = document.createDocumentFragment();//创建文档碎片
	for(var i=0;i<this.length;i++){
		oFragment.appendChild(this.elements[i]);
	}
	obj.parentNode.insertBefore(oFragment,obj);
	return this;//返回对象，进行链式操作
};
/**
 * [empty 清空选中DOM节点的文本内容]
 * @return {[type]} [this]
 */
TQuery.prototype.empty = function(){
	for(var i=0;i<this.length;i++){
		this.val(' ');
		this.text(' ');
		this.html(' ');
	}
	return this;
};
/**
 * [remove 删除所有选中的DOM]
 * @return {[type]} [this]
 */
TQuery.prototype.remove = function(){
	for(var i=0;i<this.length;i++){
		this.elements[i].remove();
	}
	return this;
};
/**
 * [html 设置/读取DOM节点的内容，带标签]
 * @param  {[type]} setting [设置的值]
 * @return {[type]}         [读取值/this]
 */
TQuery.prototype.html = function(setting){
	if(setting){//设置
		for(var i=0;i<this.length;i++){
			this.elements[i].innerHTML = setting;
		}
		return this;
	}
	return this.elements[0].innerHTML;
};
/**
 * [text 设置/读取文本内容]
 * @param  {[type]} setting [设置的值]
 * @return {[type]}         [读取值/this]
 */
TQuery.prototype.text = function(setting){
	//设置
	if(setting){
		for(var i=0;i<this.length;i++){
			this.elements[i].innerText = this.elements[i].textContent = setting;
		}
		return this;
	}
	//读取
	return this.elements[0].innerText || this.elements[0].textContent;
};
/**
 * [val 设置/读取value]
 * @param  {[type]} setting [设置的值]
 * @return {[type]}         [读取值/this]
 */
TQuery.prototype.val = function(setting){
	//设置
	if(setting){
		for(var i=0;i<this.length;i++){
			this.elements[i].value = setting;
		}
		return this;
	}
	//读取
	return this.elements[0].value;
};
/**
 * [extend 扩展插件]
 * @param  {[type]}   name [插件名字]
 * @param  {Function} fn   [执行的函数]
 * @return {[type]}        [this]
 * example: 
 * 		$().extend('drag',function(){
 * 			console.log("drag")
 *    	})
 * user：$().drag();	结果>>>>>>>"drag"
 */
TQuery.prototype.extend = function(name,fn){
	TQuery.prototype[name] = fn;
	return this;
};
/**
 * [proxy 事件代理，修改this]
 * @param  {Function} fn    [要修改的函数]
 * @param  {[type]}   _this [要替换的this（代理人）]
 * @return {[type]}         [this]
 */
TQuery.prototype.proxy = function(fn,_this){
	fn.call(_this);
	return this;
};
//=============DOM元素方法==========
/**
 * [get 将TQuery转换成DOM对象]
 * @param  {[type]} n [要选择第n个]
 * @return {[type]}   [第n个/所有]
 */
TQuery.prototype.get = function(n){
	n = n || 0;
	return this.elements[n];
};
/**
 * [index 返回当前结点的index值]
 * @return {[type]} [this.index]
 */
TQuery.prototype.index = function(){
	var index = 0;
	var aBrother = this.elements[0].parentNode.children;//获取兄弟节点
	var length = aBrother.length;
	for(var i=0;i<length;i++){//遍历
		if( aBrother[i] == this.elements[0] ){//如果匹配到
			index = i;
			break;
		}
	}
	return index;
};
/**
 * [toArray 以数组的形式返回 TQuery 选择器匹配的元素。]
 * @return {[type]} [Array]
 */
TQuery.prototype.toArray = function(){
	return this.elements;
};
/**
 * [size 返回被 TQuery 选择器匹配的元素的数量]
 * @return {[type]} [description]
 */
TQuery.prototype.size = function(){
	return this.elements.length;
};
//=============输出调用==========
//防止constructor被修改
TQuery.prototype.constructor = TQuery;
function $(tArg){
	return new TQuery(tArg);
}
window.$ = window.TQuery = $;
//=============通用函数===========
function addEvent(obj, type, fn){
	return obj.addEventListener ?
			obj.addEventListener(type, function(e){
				var ev = window.event ? window.event : (e ? e : null);
				// ev.target = ev.target || ev.srcElement;
				if( fn.call(obj,ev)===false ){//回掉函数为false，则阻止默认时间
					e.cancelBubble = true;//阻止冒泡
					e.preventDefault();//chrome，firefox下阻止默认事件
				}
			}, false)
			 :
			obj.attachEvent('on' + type, function(e){
				//fn.call(obj,e);//解决IE8下，this是window的问题
				// var ev = window.event ? window.event : (e ? e : null);
				ev.target = ev.target || ev.srcElement;
				if(fn.call(obj,ev)===false ){
					e.cancelBubble = true;//阻止冒泡
					return false;//阻止默认事件，针对IE8
				}
			});
}
function removeEvent(obj,type,fn){
	return obj.removeEventListener ? obj.removeEventListener(type,fn,false) : obj.detachEvent('on' + type,fn);
}
function getByClass(oParent,sClassName){
	var aElement = oParent.getElementsByTagName('*');//获取所有子节点
	var result = [];
	for(var i=0;i<aElement.length;i++){
		if( aElement[i].className == sClassName ){
			result.push(aElement[i]);
		}
	}
	return result;
}
})(window,document);
