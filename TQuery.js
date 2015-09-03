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
			// addEvent(document,'DOMContentLoaded',function(){
			// 	tArg.call(this);
			// });
			this.bind(document,'DOMContentLoaded',function(e){
				tArg.call(this,e);
			});
			break;
		case "string" :
				switch( tArg.charAt(0) ){
					case '<' :	//<div></div>，创建元素
						/**
						 * [HTML选择器]
						 * @type {[type]}
						 * <div data-src='{a:1,b=2}'>asdasd</div><input type='button' value='按钮' placeholder='搜索' style='width:400px;height:500px;background:#303030' />
						 * 可以多个标签平行，不能有子标签
						 */
						var oDiv = document.createElement('div');//创建一个容器
						var oFragment = document.createDocumentFragment();//创建文档碎片
						oDiv.innerHTML = tArg;
						var child = oDiv.childNodes;
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
TQuery.prototype.Sizzle = {
	"eq":function(n){
		var m = n || 0;
		this.length = 1;
		return $(this.elements[m]);
	},
	"first":function(){
		this.elements.length = 1;
		this.length = 1;
		return this;
	},
	"last":function(){
		var last = this.elements[this.length-1];
		this.length = 1;
		this.elements.length = 1;
		this.elements[0] = last;
		return this;
	},
	"not":function(selectors){
		var childElements = [];//存放临时数据
		for(var i=0;i<this.length;i++){
			switch( selectors.charAt(0) ){
				case '#':	//id
					if( $(this.elements[i]).attr('id') != selectors.substring(1) ){
						childElements.push( this.elements[i] );
					}
					break;
				case '.':	//class
					if( !this.hasClass(this.elements[i],selectors.substring(1)) ){//没有匹配到class
						childElements.push( this.elements[i] );
					}
					break;
				default :	//tagName
					if( this.elements[i].tagName != selectors.toUpperCase() ){
						childElements.push( this.elements[i] );
					}
			}
		}
		this.elements = childElements;
		this.length = childElements.length;
		return this;
	},
	"filter":function(selectors){
		var childElements = [];//存放临时数据
		for(var i=0;i<this.length;i++){
			var ele = this.elements[i];
			switch(selectors.charAt(0)){
				case '#':
					if( $(ele).attr('id') == selectors.substring(1) ){
						childElements.push( ele );
					}
					break;
				case '.':
					if( this.hasClass(ele,selectors.substring(1)) ){//如果有class
						childElements.push( ele );
					}
					break;
				case '[' :
					var attrinfo = selectors.replace(/(\[+|\]+|\"|\"+])/g,'').split('=');
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
					if( ele.tagName == selectors.toUpperCase() ){
						childElements.push( ele );
					}
			}
		}
		this.elements = childElements;
		this.length = childElements.length;
		return this;
	},
	"find":function(selectors){
		var childElements = [];//存放临时数据
		for(var i=0;i<this.length;i++){
			if(document.querySelectorAll){//现代浏览器
				var aElems = this.elements[i].querySelectorAll(selectors);
				var length = aElems.length;
				var j =0;
				while(j<length){
					childElements.push( aElems[j] );
					j++;
				}
			}else{//通用，支持IE8一下
				switch( selectors.charAt(0) ){
					case '#' : 	//#div1
						var aElemsid = this.elements[i].getElementById(selectors.substring(1));
						childElements.push( aElemsid );
						break;
					case '.' :	//.class
						var aElemsclass= getByClass( this.elements[i],selectors.substring(1) );
						childElements = childElements.concat(aElemsclass);
						break;
					case '[' ://属性选择器[data=""]
						var attrinfo = selectors.replace(/(\[+|\]+|\"|\"+])/g,'').split('=');
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
						var aElemstag = this.elements[i].getElementsByTagName(selectors);
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
	},
	"add":function(selectors){
		var newTQ = $(selectors);//先获取元素
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
	},
	"slice":function(n,m){
		if(n<0 || m>this.length) return;
		var temps = this.elements;
		var newarr = temps.slice(n,m+1);
		this.elements = newarr;
		this.length = this.elements.length;
		return this;
	}
};
//===========遍历========
TQuery.prototype.Traversing = {
	"each":function(fn){
		for(var i=0;i<this.length;i++){
			fn.call(this.elements[i]);
		}
		return this;
	},
	"findParent":function(selectors){
		var parent = this.elements[0].parentNode;
		if( parent.className.match(/result/) ){
			this.elements.length = 0;
			this.elements.push(parent);
			this.length = this.elements.length;
			return this;
		}else if( parent==document.documentElement || parent==document.body){
			return this;
		}else{
			this.findParent(selectors);
		}
	},
	"parent":function(){
		var firstNode = this.elements[0].parentNode;
		this.elements.length = 0;//清空
		this.elements.push( firstNode );
		this.length = this.elements.length;//重置长度
		return this;
	},
	"parents":function(){
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
	},
	"children":function(){
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
	},
	"prev":function(){
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
	},
	"prevAll":function(){
		var temps = [];
		this.siblings();
		return this;
	},
	"next":function(){
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
	},
	"nextAll":function(){
		var selector = this.elements;//获取当前所选元素
		this.siblings();
		var bro = this.elements;//所有兄弟节点
		for(var i=0;i<bro.length;i++){

		}
		var a = {};
		if( a ){

		}
		return this;
	},
	"siblings":function(selectors){
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
		if(selectors){
			this.filter( selectors );
		}
		return this;
	}
};
//===========事件========
TQuery.prototype.Event = {
	"ready":function(fn){
		if(this.elements[0]==window){
			this.elements[0]=document;
		}
		this.bind('DOMContentLoaded',function(){
			fn.call(this);
		});
		return this;
	},
	"load":function(fn){
		if(this.elements[0]==document){
			this.elements[0]=window;
		}
		this.bind('load',function(e){
			fn.call(this,e);
		});
		return this;
	},
	"click":function(fn,fnName){
		this.bind('click',function(e){
			fn.call(this,e);
		},fnName);
		return this;
	},
	"on":function(type,fn){
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
	},
	"hover":function(json){
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
	},
	"toggle":function(){
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
	},
	"mouseScroll":function(){
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
	},
	"bind":function(type,fn,fnName){
		//如果只传一个json参数e
		if(arguments.length==1){
			for(var k=0;k<this.length;k++){
				for(var attr in type){
					bindEvent(this.elements[k],attr,type[attr],fnName);
				}
			}
		}
		//如果传两个参数，则多个事件统一执行一个e
		else{
			var events = type.split(' '),
				eventsLength = events.length;
			for(var i=0;i<this.length;i++){
				var j=0;
				while(j<eventsLength){
					bindEvent.call(this,this.elements[i],events[j],fn,fnName);
					j++;
				}
			}
		}
		function bindEvent(dom,type,fn,fnName){
			dom.eventQueue = dom.eventQueue || {};
			dom.eventQueue[type] = dom.eventQueue[type] || {};
			dom.handler = dom.handler || {};
			var index = 0;//事件队列长度
			for (var length in dom.eventQueue[type]) {
				index++;
			}
			if (!fnName) {
				dom.eventQueue[type]['fn' + index] = fn;
			} else {
				dom.eventQueue[type][fnName] = fn;
				// this.fnName = fnName;
			}
			//如果不存在handler[click]，handler[mouseover],…………
			if (!dom.handler[type]) {
				dom.handler[type] = function(e) {
					ev = window.event ? window.event : (e ? e : null);
					ev.target = ev.target || ev.srcElement;
					for (var fn in dom.eventQueue[type]) {
						if( dom.eventQueue[type][fn].call(this,ev)===false ){
							ev.stopPropagation();//阻止冒泡，w3c标准,chrome
							ev.cancelBubble = true;//阻止冒泡,firefox,IE
							ev.preventDefault();//阻止默认事件，w3c标准
							ev.returnValue = false;//阻止默认事件，针对老版本IE
							return false;//阻止默认事件，针对IE8
						}
					}
				};
				addEvent(dom,type,dom.handler[type]);
			}
		}
		return this;
	},
	"unbind":function(type,fnName){
		for( var m=0;m<this.elements.length;m++ ){
			var dom = this.elements[m];
			var hasQueue = dom.eventQueue && dom.eventQueue[type];
			var queueLength = 0;
			for (var length in dom.eventQueue[type]) {
				queueLength++;
			}
			if (!hasQueue) return;
			if (!fnName) {//解除匿名函数
				if (window.removeEventListener) {
					dom.removeEventListener(type, dom.handler[type]);
				} else {
					dom.detachEvent(type, dom.handler[type]);
				}
				delete dom.eventQueue[type];
			} else {//解除有名函数
				delete dom.eventQueue[type][fnName];
				if ( queueLength === 0) {//解除绑定
					if (window.removeEventListener) {
						dom.removeEventListener(type, dom.handler[type]);
					} else {
						dom.detachEvent(type, dom.handler[type]);
					}
					delete dom.eventQueue[type];
				}
			}
		}
	},
	"one":function(type,fn){
		var _this = this;
		//只穿一个json参数
		if(arguments.length==1){
			for(var k=0;k<this.length;k++){
				for(var attr in type){
					// bindEvent(this.elements[k],attr,type[attr],fnName);
					this.bind(attr,function(e){
						var ev = window.event ? window.event : (e ? e : null);
						type[attr].call(this);
						_this.unbind(ev.type,'one');
					},"one");
				}
			}
		}
		//传2个参数
		else{
			var events = type.split(' ');//获取每个事件
			var eventsLength = events.length;
			for(var i=0;i<this.length;i++){
				var j =0;
				while(j<eventsLength){
					// this.elements[i][ 'on'+events[j] ] = fn;
					this.bind(events[j],function(e){
						var ev = window.event ? window.event : (e ? e : null);
						fn.call(this);
						_this.unbind(ev.type,'one');
					},"one");
					j++;
				}
			}
		}
		return this;
	},
	"trigger":function(type,fnName){
		var dom = this.elements[0];
		if(!fnName){
			//触发DOM2级事件，通过bind绑定的。
			if( dom.eventQueue ){
				for(var fn in dom.eventQueue[type] ){
					dom.eventQueue[type][fn].call(dom);
				}
			}
			//触发DOM2级事件,不通过bind绑定的
			if( typeof dom[type] !== "undefined" ){
				dom[type].call(dom);
			}
		}
		//指定触发哪个函数
		else{
			dom.eventQueue[type][fnName].call(dom);
		}
	},
	"live":function(type,fn,parent){
		var _this = this,
			liveIndex = "live" + parseFloat( Math.random()*10 ).toFixed(10).replace('.',"");
		parent = parent ? parent : document;
		for( var j=0;j<this.length;j++ ){
			this.elements[j].parentLive = parent;
			this.elements[j].liveIndex = liveIndex;
		}
		$(parent).bind(type,function(e){
			for( var i=0;i<_this.length;i++ ){
				if( e.target == _this.elements[i] ){
					fn.call(e.target,e);
					break;
				}
			}
			return false;
		},liveIndex);
		return this;
	},
	"die":function(type,parent){
		var liveIndex = this.elements[0].liveIndex;
		parent = parent ? parent : ( this.elements[0].parentLive ? this.elements[0].parentLive : document );
		$(parent).unbind(type,liveIndex);
	},
	"mutation":function(options,fn){
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
	}
};
//===========尺寸========
TQuery.prototype.Dimensions = {
	"width":function(setting){
		if(!setting && this.elements[0] instanceof Object && (this.elements[0].alert || this.elements[0].body) ){//如果是window，或document
			return this.doc.body.scrollWidth> this.doc.documentElement.scrollWidth ? this.doc.body.scrollWidth : this.doc.documentElement.scrollWidth;//获取带padding和margin的值
		}else if(setting){//设置宽度
			for(var i=0;i<this.length;i++){
				this.elements[i].style.width = setting.toString().replace('px','') + 'px';
			}
			return this;
		}else{
			return this.elements[0].offsetWidth || parseFloat( this.style('width') );//获取宽度
		}
	},
	"height":function(setting){
		if(this.elements[0] instanceof Object && (this.elements[0].alert || this.elements[0].body) ){//如果是window，或document，则返回整个文档高度
			return this.doc.body.scrollHeight>this.doc.documentElement.scrollHeight ? this.doc.body.clientHeight : this.doc.documentElement.scrollHeight;//获取带padding和margin的值
		}else if(setting){//设置高度
			for(var i=0;i<this.length;i++){
				this.elements[i].style.height = setting.toString().replace('px','') + 'px';
			}
			return this;
		}else if(!setting){
			return this.elements[0].offsetHeight || parseFloat( this.style('height') );//获取高度
		}
	},
	"top":function(setting){
		if(setting){
			this.css('top',setting);
			return this;
		}
		return parseInt( this.elements[0].offsetTop );
	},
	"left":function(setting){
		if(setting){
			this.css('left',setting);
			return this;//返回对象，进行链式操作
		}
		return parseInt( this.elements[0].offsetLeft );
	},
	"viewWidth":function(){
		return this.doc.body.clientWidth<this.doc.documentElement.clientWidth ? this.doc.body.clientWidth : this.doc.documentElement.clientWidth;//取较小值
	},
	"viewHeight":function(){
		return this.doc.body.clientHeight<this.doc.documentElement.clientHeight ? this.doc.body.clientHeight : this.doc.documentElement.clientHeight;//取较小值
	},
	"style":function(attr){
		return this.elements[0].currentStyle ? this.elements[0].currentStyle[attr] : getComputedStyle(this.elements[0])[attr];
	},
	"size":function(attr){
		return this.doc.documentElement[attr] ? this.doc.documentElement[attr] : this.doc.body[attr];
	}
};
//===========属性========
TQuery.prototype.Attributes = {
	"attr":function(attr,value){
		if(arguments.length==2){//2个参数，设置属性
			if( attr=="className" ){
				attr = "class";
			}
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
						if( j=="className" || j=="class" ){
								var classValue = attr[j];
								this.elements[i].setAttribute("class",classValue);
								continue;
						}
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
				var arr = attr.match(reg);
				var attrInfo = {};
				var attrName,
					attrValue;
				if( arr.length>=1 ){
					for(var m=0;m<arr.length;m++){
						attrName = arr[m].split('=')[0];
						attrValue = arr[m].split('=')[1];
						if(	/^('|").*('|")$/img.test(attrValue) ){
							attrValue = attrValue.substring(1,arr[m].split('=')[1].length-1);
						}
						attrInfo[attrName] = attrValue;
					}
					this.attr(attrInfo);
				}
				//否则读取
				return this.elements[0][attr] || this.elements[0].getAttribute(attr);
			}
		}
		return this;
	},
	"removeAttr":function(attr){
		for( var i=0;i<this.length;i++ ){
			if( this.elements[i][ attr ] ){
				delete this.elements[i][ attr ];
			}else{
				this.elements[i].removeAttribute(attr);
			}
		}
		return this;
	},
	"hasClass":function(obj,classValue){
		// ( \\s|^ ) 判断前面是否有空格 （\\s | $ ）判断后面是否有空格 两个感叹号为转换为布尔值 以方便做判断
		return !! obj.className.match(new RegExp("(\\s|^)" + classValue + "(\\s|$)"));
	},
	"addClass":function(classValue){
		for(var i=0;i<this.length;i++){
			if ( this.hasClass(this.elements[i],classValue) ) {//如果已经有Class
				continue;
			}
			if( this.elements[i].className === null || this.elements[i].className === '' ){
				this.elements[i].className = classValue;
			}else{
				this.elements[i].className += " " + classValue;
				if(this.elements[i].className){

				}
			}
		}
		return this;
	},
	"removeClass":function(classValue){
		for(var i=0;i<this.length;i++){
			if (this.hasClass(this.elements[i],classValue)) {
				this.elements[i].className = this.elements[i].className.replace(new RegExp("(\\s|^)" + classValue + "(\\s|$)"), " "); // replace方法是替换 
			}
		}
		return this;
	},
	"data":function(name,data){
		if( arguments.length==1 ){//读数据
			return this.elements[0][name];
		}else{//存数据
			for(var i=0;i<this.length;i++){
				this.elements[i][name] = data;
			}
		}
		return this;
	}
};
//===========样式========
TQuery.prototype.styleSheet = {
	"css":function(attr,value){
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
	}
};
//===========动画========
TQuery.prototype.Effects = {
	"animate":function(json,configjson){
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
	},
	"stop":function(delay){
		var stardelay = delay ? delay : 0;
		setTimeout(function(){
			clearInterval( $(this).elements[0].animate );
		},stardelay);
		return this;
	},
	"show":function(){
		for(var i=0;i<this.length;i++){
			this.elements[i].style.display = 'block';
		}
		return this;
	},
	"hide":function(){
		for(var i=0;i<this.length;i++){
			this.elements[i].style.display = 'none';
		}
		return this;
	},
	"fadeIn":function(speed,callBack){
		this.animate({
			"opacity":"100"
		},{"end":function(){
			if(callBack) callBack(this);
		}});
	},
	"fadeOut":function(speed,callBack){
		this.animate({
			"opacity":"100"
		},{"end":function(){
			if(callBack) callBack(this);
		}});
	},
	"fadeTo":function(target,speed,callBack){
		this.animate({
			"opacity":target
		},{"end":function(){
			if(callBack) callBack(this);
		}});
	},
	"scroll":function(dir,step,endFn){
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
	},
	"scrollTop":function(target,endFn){
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
	}
};
//===========DOM节点操作========
TQuery.prototype.Manipulation = {
	".clone":function(deep){
		var newElements = [],
			cloneNode;
		for( var i=0;i<this.length;i++ ){
			cloneNode = this.elements[i].cloneNode(true);//带子节点
			if( deep && deep===true ){//深度克隆，带事件

			}
		}
		return this;
	},
	"append":function(content){
		for(var i=0;i<this.length;i++){
			var thml = $(this).eq(i).html();
			$(this).eq(i).html(html + content);
		}
	},
	"appendChild":function(content){
		for(var i=0;i<this.length;i++){

		}
	},
	"prepend":function(prepend){

	},
	"prependChild":function(){

	},
	"insertAfter":function(obj){
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
		return this;
	},
	"insertBefore":function(){
		var oFragment = document.createDocumentFragment();//创建文档碎片
		for(var i=0;i<this.length;i++){
			oFragment.appendChild(this.elements[i]);
		}
		obj.parentNode.insertBefore(oFragment,obj);
		return this;
	},
	"remove":function(){
		for(var i=0;i<this.length;i++){
			this.elements[i].remove();
		}
		return this;
	},
	"empty":function(){
		for(var i=0;i<this.length;i++){
			this.val(' ');
			this.text(' ');
			this.html(' ');
		}
		return this;
	},
	"html":function(setting){
		if(setting){//设置
			for(var i=0;i<this.length;i++){
				this.elements[i].innerHTML = setting;
			}
			return this;
		}
		return this.elements[0].innerHTML;
	},
	"text":function(setting){
		if(setting){
			for(var i=0;i<this.length;i++){
				this.elements[i].innerText = this.elements[i].textContent = setting;
			}
			return this;
		}
		return this.elements[0].innerText || this.elements[0].textContent;
	},
	"val":function(){
		if(setting){
			for(var i=0;i<this.length;i++){
				this.elements[i].value = setting;
			}
			return this;
		}
		return this.elements[0].value;
	}
};
//===========其他========
TQuery.prototype.other = {
	"extend":function(name,fn){
		if( typeof TQuery.prototype[name] !== "undefined" ){
			TQuery.prototype[name] = fn;
		}
		return this;
	},
	"proxy":function(fn,_this){
		fn.call(_this);
		return this;
	}
};

//===========转换========
TQuery.prototype.transform = {
	"get":function(n){
		n = n || 0;
		return this.elements[n];
	},
	"toArray":function(){
		return this.elements;
	},
	"index":function(n){
		var _this = this,
			V = {
				"index":0,
				"Brothers":_this.elements[0].parentNode.children,//获取兄弟节点
				"length":this.Brothers.length
			};
		for(var i=0;i<V.length;i++){//遍历
			if( V.Brothers[i] == this.elements[0] ){//如果匹配到
				index = i;
				break;
			}
		}
		return index;
	},
	"ElementsSize":function(){
		return this.elements.length;
	}
};
//=============工具集==========

$.type = function(obj){
	var string = Object.prototype.toString.call(obj);
	return string.split(" ")[1].replace(/\]|\[/img,"").toString().toLowerCase();
};
var juggType = {
	"isNumber":function(obj){
		if( typeof obj == "number" && !isNaN(obj) ){
			return true;
		}else{
			return false;
		}
	},
	"isString":function(obj){
		if( typeof obj == "string" || obj instanceof String ){
			return true;
		}else{
			return false;
		}
	},
	"isUndefined":function(obj){
		return Object.prototype.toString.call(obj) === '[object Undefined]';
	},
	"isFunction":function(obj){
		if( typeof obj == "function" && obj instanceof Function && Object.prototype.toString.call(obj) === '[object Function]' ){
			return true;
		}else{
			return false;
		}
	},
	"isArray":function(obj){
		return Array.isArray ? Array.isArray(obj) : Object.prototype.toString.call(o) === '[object Array]';
	},
	"isObject":function(obj){
		return Object.prototype.toString.call(obj) === '[object Object]';
	},
	"isWindow":function(obj){
		if( obj == obj.obj ){
			return true;
		}else{
			return false;
		}
	}
};
for( var mothod in juggType  ){
	$.type[ mothod ] = juggType[ mothod ];
}
/**
 * [ajax 异步请求]
 * @param  {[type]} options [配置参数]
 * @return {[type]}         [description]
 */
$.ajax = function(options){
	var oAjax,
		data = options.data ? options.data : "",//头部信息。必须是数组[key,value]
		context = options.context ? options.context : window,//执行上下文，this
		type = options.type ? options.type : 'GET',//请求方式
		async = options.async ? options.async : true;//默认异步加载
	if(window.XMLHttpRequest){//IE7+，chrome，firefox，opara，safari
		oAjax=new XMLHttpRequest();
	}else{
		oAjax=new ActiveXObject("Microsoft.XMLHTTP");//IE5，IE6
	}

	if(options.beforeSend) options.beforeSend.call(context);//发送之前

	oAjax.setRequestHeader(data[0],data[1]);//设置头部信息
	oAjax.open(options.type,options.url,async);
	oAjax.send();
	oAjax.onreadystatechange=function(){
		if(oAjax.readyState==4){
			if(options.complete) options.complete.call(context,oAjax.status);//读取完成
			if(oAjax.status==200){
				if(options.success) options.success.call(context,oAjax.responseText);//读取成功
			}else{
				if(options.fail) options.fail.call(context,oAjax.status);//读取失败
			}
		}
	};
};
$.unique = function(obj){
	var V = {
		"hash":{},
		"arr":[],
		"length":obj.length
	};
	for( var i=0;i<V.length;i++ ){
		if( typeof V.hash[ obj[i] ] == "undefined" ){
			V.hash[ obj[i] ] = 1;
			V.arr.push( obj[i] );
		}
	}
	return V.arr;
};

//刷新页面
$.reload = function(){
	window.location.reload(true);
};

//打乱数组
$.shuffleArray = function(arr){
	var V = {
		"temp":[],
		"length":arr.length
	};
	for( var i=0;i<V.length;i++ ){
		V.temp.push( arr[i] );
	}
	V.temp.sort(function(){
		return Math.random()-0.5;
	});
	return V.temp;
};

//获取对象的长度
$.sizeof = function(obj){
	var V = {
		"temp":[],
		"length":0
	};
	for( var attr in obj ){
		V.length++;
	}
	return V.length;
};

//获取浏览器信息
$.browser = function(){
	var V = {
		"userAgent":navigator.userAgent,
		"matchRules":{
			"msie":/msie|Trident/img,//Trident内核
			"moz":/firefox/img,//Gecko内核
			"webkit":/webkit/img,//WebKit内核
			"opera":/opera|Presto/img//Presto内核
		}
	};
	this.browser.msie = function(){
		return V.matchRules.msie.test( V.userAgent );
	};
	this.browser.moz = function(){
		return V.matchRules.moz.test( V.userAgent );
	};
	this.browser.webkit = function(){
		return V.matchRules.webkit.test( V.userAgent );
	};
	this.browser.opera = function(){
		return V.matchRules.opera.test( V.userAgent );
	};
	this.$.browser.which = function(){

	};
	return V.userAgent;
};

//合并对象
$.merger = function(cover){
	var object = new Object({});
	for( var i=0;i<arguments.length;i++ ){
		for( var key in arguments[i] ){
			if( cover && cover===true ){
				object[key] = arguments[i][key];
			}else{
				if( typeof object[key] == "undefined" ){
					object[key] = arguments[i][key];
				}
			}
		}
	}
	return object;
};

$.parseJSON = function(str,compatibility){
	return (compatibility && compatibility===true) ? (new Function("return " + str))() : JSON.parse(str);
};
//=============输出调用==========
//防止constructor被修改
TQuery.prototype = $.merger(TQuery.prototype.Sizzle,TQuery.prototype.Traversing,TQuery.prototype.Event,TQuery.prototype.Dimensions,TQuery.prototype.Attributes,TQuery.prototype.styleSheet,TQuery.prototype.Effects,TQuery.prototype.Manipulation,TQuery.prototype.other,TQuery.prototype.transform);
TQuery.prototype.constructor = TQuery;
function $(tArg){
	return new TQuery(tArg);
}
window.$ = window.TQuery = $;
//=============通用函数===========
function addEvent(obj, type, fn){
	var ev = null;
	return obj.addEventListener ?
			obj.addEventListener(type, function(e){
				ev = window.event ? window.event : (e ? e : null);
				ev.target = ev.target || ev.srcElement;
				if( fn.call(obj,ev)===false ){
					ev.stopPropagation();//阻止冒泡，w3c标准
					ev.cancelBubble = true;//阻止冒泡,ie,firefox
					ev.preventDefault();//w3c标准
				}
			}, false)
			 :
			obj.attachEvent('on' + type, function(e){
				ev = window.event ? window.event : (e ? e : null);
				ev.target = ev.target || ev.srcElement;
				if(fn.call(obj,ev)===false ){
					ev.cancelBubble = true;//阻止冒泡
					ev.returnValue = false;//阻止默认事件，针对老版本IE
					return false;//阻止默认事件，针对IE8
				}
			});
}
function getByClass(oParent,sClassName){
	var V = {
		"elements":oParent.getElementsByTagName('*'),//获取所有子节点
		"length":this.elements.length,
		"result":[]
	};
	for(var i=0;i<V.elements.length;i++){
		if( V.elements[i].className == sClassName ){
			V.result.push(V.elements[i]);
		}
	}
	return V.result;
}
})(window,document);
