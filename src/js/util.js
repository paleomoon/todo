// 判断arr是否为一个数组，返回一个bool值
function isArray(value) {
    return Object.prototype.toString.call(value) === '[Object Array]';
}

// 判断fn是否为一个函数，返回一个bool值
function isFunction(fn) {
    return Object.prototype.toString.call(fn) === '[object Function]';
}

// 使用递归来实现一个深度克隆，可以复制一个目标对象，返回一个完整拷贝
// 被复制的对象类型会被限制为数字、字符串、布尔、日期、数组、Object对象。不会包含函数、正则对象等
function deepClone(src) {
    //判断是否是数组，并赋初始值
    var o =  (Object.prototype.toString.call(src) === "[object Array]") ? [] : {};

    for (var i in src) {
        if (src.hasOwnProperty(i)) { //排除继承属性
            if (typeof src[i] === 'object') {
                o[i] = deepClone(src[i]); //递归赋值
            } else {
                o[i] = src[i];
            }
        }
    }
    return o;
}

// 对数组进行去重操作，只考虑数组中元素为数字或字符串，返回一个去重后的数组
function uniqArray(arr) {
    var newArr = [];
    for (var i in arr) {
        if (newArr.indexOf(arr[i]) == -1) { //如果新数组中不存在当前元素
            newArr.push(arr[i]); //新数组中加入当前元素
        }
    }
    return newArr;
}

//删除数组中指定元素
function removeByValue(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            arr.splice(i, 1);
            break;
        }
    }
}

// 对字符串头尾进行空格字符的去除、包括全角半角空格、Tab等，返回一个字符串
function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
}

// 实现一个遍历数组的方法，针对数组中每一个元素执行fn函数，并将数组索引和元素作为参数传递
function each(arr, fn) {
    for (var i = 0, len = arr.length; i < len ; i++) {
        fn(arr[i], i)
    }
}

// 获取一个对象里面第一层元素的数量，返回一个整数
function getObjectLength(obj) {
    var elementNum = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            elementNum++;
        }
    }
    return elementNum;
}

// 判断是否为邮箱地址
function isEmail(emailStr) {
    return /^([a-zA-Z0-9]+[\._-]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[\._-]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(emailStr);
}

// 判断是否为手机号
function isMobilePhone(phone) {
    return /^1[34578]\d{9}$/.test(phone);
}

// 为element增加一个样式名为newClassName的新样式，已存在不重复添加
function addClass(element, newClassName) {
    var oldClassName = element.className; //获取旧的样式类
    if (oldClassName.indexOf(newClassName) !== -1) {
        return oldClassName;
    }
    element.className = oldClassName === "" ? newClassName : oldClassName + " " + newClassName;
}

// 移除element中的样式oldClassName
function removeClass(element, oldClassName) {
    element.className = element.className.replace(oldClassName, '');
}

// 判断siblingNode和element是否为同一个父元素下的同一级的元素，返回bool值
function isSiblingNode(element, siblingNode) {
    return element.parentNode === siblingNode.parentNode;
}

// 获取element相对于浏览器窗口的位置，返回一个对象{x, y}
// getBoundingClientRect()方法。它返回一个对象，其中包含了left、right、top、bottom四个属性
// 分别对应了该元素的左上角和右下角相对于浏览器窗口（viewport）左上角的距离。
// document.documentElement.scrollLeft || document.body.scrollLeft获取滚动条滚动的距离。
function getPosition(element) {
    var pos = {};
    pos.x = element.getBoundingClientRect().left + (document.documentElement.scrollLeft || document.body.scrollLeft);
    pos.y = element.getBoundingClientRect().top + (document.documentElement.scrollTop || document.body.scrollTop);
    return pos;
}

//获取元素所有兄弟节点
function siblings(ele) {
    var a = [];
    var p = ele.parentNode.children;
    for (var i = 0, len = p.length; i < len; i++) {
        if(p[i] !== ele) {
            a.push(p[i])
        }
    }
    return a;
}

/**
 * 实现一个简单的Query
 * 可以通过id获取DOM对象,可以通过tagName获取DOM对象,可以通过类名获取DOM对象
 * 可以通过attribute匹配获取DOM对象，例如
 * $("[data-log]"); // 返回第一个包含属性data-log的对象
 * $("[data-time=2015]"); // 返回第一个包含属性data-time且值为2015的对象
 * 可以通过简单的组合提高查询便利性，例如
 * $("#adom .classa"); // 返回id为adom的DOM所包含的所有子节点中，第一个样式定义包含classa的对象
*/
function $(selector) {
    var ele = document;
    var sele = selector.replace(/\s+/, ' ').split(' ');    // 去除多余的空格并分割

    for (var i = 0, len = sele.length; i < len; i++) {

        switch (sele[i][0]) {    // 从子节点中查找
            case '#':
                ele = ele.getElementById(sele[i].substring(1));
                break;
            case '.':
                ele = ele.getElementsByClassName(sele[i].substring(1))[0];
                break;
            case '[':
                var valueLoc = sele[i].indexOf('=');
                var temp = ele.getElementsByTagName('*');
                var tLen = temp.length;
                if (valueLoc !== -1) {
                    var key = sele[i].substring(1, valueLoc);
                    var value = sele[i].substring(valueLoc + 1, sele[i].length - 1);
                    for (var j = 0; j < tLen; j++) {
                        if (temp[j].getAttribute(key) === value) { //不能用中括号获取自定义属性
                            ele = temp[j];
                            break;
                        }
                    }
                }
                else {
                    var key = sele[i].substring(1, sele[i].length - 1);
                    for (var j = 0; j < tLen; j++) {
                        if (temp[j].getAttribute(key)) {
                            ele = temp[j];
                            break;
                        }
                    }
                }
                break;
            default :
                ele = ele.getElementsByTagName(sele[i])[0];
                break;
        }
    }

    if (!ele) {
        ele = null;
    }

    return ele;
}

// 给一个element绑定一个针对event事件的响应，响应函数为listener
function addEvent(element, event, listener) {
    if (element.addEventListener) {
        element.addEventListener(event, listener, false);
    }
    else if (element.attachEvent) {
        element.attachEvent("on" + event, listener);
    }
    else {
        element["on" + event] = listener;
    }
}

// 移除element对象对于event事件发生时执行listener的响应
function removeEvent(element, event, listener) {
    if (element.removeEventListenr) {
        element.removeEventListenr(event, listener, false);
    } 
    else if (element.detachEvent) {
        element.detachEvent("on" + event, listener);
    }
    else {
        element["on" + event] = null;
    }
}

function getEvent(event) {
    return event ? event : window.event;
}

function getTarget(event) {
    return event.target || event.srcElement;
}

function preventDefault(event) {
    if (event.preventDefault) {
        event.preventDefault();
    }
    else {
        event.returnValue = false;
    }
}

function stopPropagation(event) {
    if (event.stopPropagation) {
        event.stopPropagation();
    }
    else {
        event.cancelBubble = true;
    }
}


// 实现对click事件的绑定
function addClickEvent(element, listener) {
    addEvent(element, "click", listener);
}


// 实现对于按Enter键时的事件绑定
function addEnterEvent(element, listener) {
    addEvent(element, 'keydown', function(e) {
        var event = e || window.event;
        var keyCode = event.which || event.keyCode;
        if (keyCode === 13) {
            listener.call(element, event);
        }
    });
}

// 我们增加了一个按钮，当点击按钮时，改变list里面的项目，这个时候你再点击一下li，绑定事件不再生效了。
// 那是不是我们每次改变了DOM结构或者内容后，都需要重新绑定事件呢？当然不会这么笨，接下来学习一下事件代理，然后实现下面新的方法。
function delegateEvent(element, tag, eventName, listener) {
    addEvent(element, eventName, function (e) {
        var event = e || window.event;
        var target = event.target || event.srcElement;

        if (target.tagName.toUpperCase() === tag.toUpperCase()) {
            listener.call(target, event);
        }
    });
}

// 估计有同学已经开始吐槽了，函数里面一堆$看着晕啊，那么接下来把我们的事件函数做如下封装改变：
$.on = function(selector, event, listener) {
    addEvent($(selector), event, listener);
};
$.click = function(selector, listener) {
    addClickEvent($(selector), listener);
};
$.un = function(selector, event, listener) {
    removeEvent($(selector), event, listener);
};
$.delegate = function(selector, tag, event, listener) {
    delegateEvent($(selector), tag, event, listener);
};

// 判断是否为IE浏览器，返回-1或者版本号
function isIE() {
    /*
    var ua = navigator.userAgent.toLowerCase();
    var ie = ua.match(/rv:([\d.]+)/) || ua.match(/msie ([\d.]+)/);
    if(ie) {
        return ie[1];
    }
    else {
        return -1;
    }
    */
    return /msie (\d+\.\d+)/i.test(navigator.userAgent)
        ? (document.documentMode || + RegExp['\x241']) : -1;
}

// 设置cookie
function isValidCookieName(cookieName) {
    // http://www.w3.org/Protocols/rfc2109/rfc2109
    // Syntax:  General
    // The two state management headers, Set-Cookie and Cookie, have common
    // syntactic properties involving attribute-value pairs.  The following
    // grammar uses the notation, and tokens DIGIT (decimal digits) and
    // token (informally, a sequence of non-special, non-white space
    // characters) from the HTTP/1.1 specification [RFC 2068] to describe
    // their syntax.
    // av-pairs   = av-pair *(";" av-pair)
    // av-pair    = attr ["=" value] ; optional value
    // attr       = token
    // value      = word
    // word       = token | quoted-string

    // http://www.ietf.org/rfc/rfc2068.txt
    // token      = 1*<any CHAR except CTLs or tspecials>
    // CHAR       = <any US-ASCII character (octets 0 - 127)>
    // CTL        = <any US-ASCII control character
    //              (octets 0 - 31) and DEL (127)>
    // tspecials  = "(" | ")" | "<" | ">" | "@"
    //              | "," | ";" | ":" | "\" | <">
    //              | "/" | "[" | "]" | "?" | "="
    //              | "{" | "}" | SP | HT
    // SP         = <US-ASCII SP, space (32)>
    // HT         = <US-ASCII HT, horizontal-tab (9)>

    return (new RegExp('^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24'))
        .test(cookieName);
}

function setCookie(cookieName, cookieValue, expiredays) {
    if (!isValidCookieName(cookieName)) {
        return;
    }

    var exdate = '';
    if (expiredays) {
        exdate = new Date();
        exdate.setDate(exdate.getDate() + expiredays);
        var expires = ';expires=' + exdate.toUTCString();     // toGMTString is deprecated and should no longer be used, it's only there for backwards compatibility, use toUTCString() instead
    }
    document.cookie = cookieName + '=' + encodeURIComponent(cookieValue) + expires;    // 废弃的 escape() 方法生成新的由十六进制转移序列替换的字符串. 使用 encodeURI 或 encodeURIComponent 代替
}

// 获取cookie值
function getCookie(cookieName) {
    if (!isValidCookieName(cookieName)) {
        return null;
    }

    var re = new RegExp(cookieName + '=(.*?)($|;)');
    return re.exec(document.cookie)[1] || null;
}

//-------------Ajax---------------
// 学习Ajax，并尝试自己封装一个Ajax方法。
function ajax(url, options) {
    // 创建对象
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    }
    else {        //兼容 IE5 IE6
        xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
    }

    // 处理data
    if (options.data) {
        var dataarr = [];
        for (var item in options.data) {
            dataarr.push(item + '=' + encodeURI(options.data[item]));
        }
        var data = dataarr.join('&');
    }

    // 处理type
    if (!options.type) {
        options.type = 'GET';
    }
    options.type = options.type.toUpperCase();

    // 发送请求
    if (options.type === 'GET') {
        var myURL = '';
        if (options.data) {
            myURL = url + '?' + data;
        }
        else {
            myURL = url;
        }
        xmlhttp.open('GET', myURL, true);
        xmlhttp.send();
    }
    else if (options.type === 'POST') {
        xmlhttp.open('POST', url, true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send(data);
    }

    // readyState
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                if (options.onsuccess) {
                    options.onsuccess(xmlhttp.responseText, xmlhttp.responseXML);
                }
            }
            else {
                if (options.onfail) {
                    options.onfail();
                }
            }
        }
    }
}

// 使用示例：
// ajax(
//     'http://localhost:8080/server/ajaxtest', {
//         data: {
//             name: 'simon',
//             password: '123456'
//         },
//         onsuccess: function(responseText, xhr) {
//             console.log(responseText);
//         }
//     }
// );　