(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    var strats = {};
    var LIFECYCLE = ['beforeCreate', 'created'];
    LIFECYCLE.forEach(function (hook) {
      strats[hook] = function (p, c) {
        if (c) {
          if (p) {
            return p.concat(c);
          } else {
            return [c];
          }
        } else {
          return p;
        }
      };
    });
    function mergeOptions(parent, child) {
      var options = {};
      for (var key in parent) {
        mergeField(key);
      }
      for (var _key in child) {
        if (!parent.hasOwnProperty(_key)) {
          mergeField(_key);
        }
      }
      function mergeField(key) {
        // 用策略模式，减少if else
        if (strats[key]) {
          options[key] = strats[key](parent[key], child[key]);
        } else {
          // 不在策略中，以儿子为准
          options[key] = child[key] || parent[key]; // 优先儿子，最后用父级
        }
      }

      return options;
    }

    function initGlobalAPI(Vue) {
      Vue.options = {};
      Vue.mixin = function (mixin) {
        // 期望将用户的选项和全聚德options进行合并
        // mixin(xxx(){}) => {xxx: [fn]}
        // {xxx: [fn]}  mixin(xxx(){}) => {xxx: [fn, fn]}
        this.options = mergeOptions(this.options, mixin);
        return this;
      };
      // Vue.extend = function(options) {
      //     function Sub() {

      //     }
      //     Sub.prototype = Object.create(Vue.prototype); // Sub.prototype.__proto__ === Vue.prototype
      //     Sub.options = options; // 保存用户传递的选项
      //     return Sub;
      // }
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
      if (null != _i) {
        var _s,
          _e,
          _x,
          _r,
          _arr = [],
          _n = !0,
          _d = !1;
        try {
          if (_x = (_i = _i.call(arr)).next, 0 === i) {
            if (Object(_i) !== _i) return;
            _n = !1;
          } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
        } catch (err) {
          _d = !0, _e = err;
        } finally {
          try {
            if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
          } finally {
            if (_d) throw _e;
          }
        }
        return _arr;
      }
    }
    function _typeof(obj) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }, _typeof(obj);
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
      return arr2;
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _toPrimitive(input, hint) {
      if (typeof input !== "object" || input === null) return input;
      var prim = input[Symbol.toPrimitive];
      if (prim !== undefined) {
        var res = prim.call(input, hint || "default");
        if (typeof res !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (hint === "string" ? String : Number)(input);
    }
    function _toPropertyKey(arg) {
      var key = _toPrimitive(arg, "string");
      return typeof key === "symbol" ? key : String(key);
    }

    // vue3并没有使用正则匹配
    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 他匹配到的分组是一个标签名  <xxx 匹配到的是开始 标签的名字

    var startTagClose = /^\s*(\/?)>/; // 开始标签的结尾  > <br/>

    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字
    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配标签中的属性
    // 第一个分组就是属性的key value 就是 分组3/分组4/分组五

    function parseHTML(html) {
      var ELEMENT_TYPE = 1;
      var TEXT_TYPE = 3;
      var stack = []; // 记录当前匹配的标签，碰到配对的结束标签则出站
      var currentParent;
      var root;

      // 最终转化成为抽象语法树
      function createASTElement(tag, attrs) {
        return {
          tag: tag,
          type: ELEMENT_TYPE,
          children: [],
          attrs: attrs,
          parent: null
        };
      }
      function start(tag, attrs) {
        var node = createASTElement(tag, attrs);

        // 进入时没有根标签说明其就是根标签
        if (!root) {
          root = node;
        }
        // 下一个开始标签进入时，已经存在标签了，则自身为子标签
        if (currentParent) {
          node.parent = currentParent;
          currentParent.children.push(node);
        }
        stack.push(node); // 入栈
        currentParent = node; // currentParent是栈中的最后(后入先出)一个
      }

      function chars(text) {
        text = text.replace(/\s/g, ''); // 如果空格超过2则不删除
        text && currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent
        });
      }
      function end() {
        stack.pop();
        currentParent = stack[stack.length - 1]; // 将栈中的最后(后入先出)一个设为当前父元素
      }
      // 将匹配完的字符串截取掉
      function advance(len) {
        html = html.substring(len);
      }
      // 匹配解析字符串的开始标签
      function parseStartTag() {
        var start = html.match(startTagOpen);
        if (start) {
          var match = {
            tagName: start[1],
            attrs: []
          };
          advance(start[0].length);
          // 继续匹配开始标签名之后的内容
          var attr, _end;
          while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length);
            // attribute是匹配到的 0：属性名和值，1：属性名，2：=，3\4\5：属性值
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5] || true
            });
          }
          // 匹配到开始标签的结束标签
          if (_end) {
            advance(_end[0].length);
          }
          // console.log(match, html);
          return match;
        }
        return false;
      }
      while (html) {
        // 如果index = 0，为开始标签或者结束标签
        // 如果index > 0，两标签之间的文本内容
        var textEnd = html.indexOf('<');
        if (textEnd === 0) {
          // 解析开始标签和属性
          var startTagMatch = parseStartTag();
          if (startTagMatch) {
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }
          // 解析结束标签
          var endTagMatch = html.match(endTag);
          if (endTagMatch) {
            advance(endTagMatch[0].length);
            end(endTagMatch[1]);
            continue;
          }
        }
        if (textEnd > 0) {
          // 解析标签之间（开始-文本-结束）(结束-换行空格-开始)文本内容
          var text = html.substring(0, textEnd);
          if (text) {
            chars(text);
            advance(text.length);
          }
        }
      }
      return root;
    }

    var ELEMENT_TYPE = 1;
    var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ asdsadsa }}  匹配到的内容就是我们表达式的变量

    function genProps(attrs) {
      var str = '';
      var _loop = function _loop() {
        var attr = attrs[i]; // {name, value}形式
        if (attr.name === 'style') {
          // 样式需要进行特殊处理
          // style="width: 160px;height: 48px;"
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              value = _item$split2[1];
            obj[key] = value;
          });
          attr.value = obj;
        }
        str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
      };
      for (var i = 0; i < attrs.length; i++) {
        _loop();
      }
      return "{".concat(str.slice(0, -1), "}"); // 出去最后一个逗号
    }

    function gen(node) {
      if (node.type === ELEMENT_TYPE) {
        return codegen(node);
      } else {
        var text = node.text;
        if (!defaultTagRE.test(text)) {
          // 如果是纯文本，则直接返回纯文本
          return "_v(".concat(JSON.stringify(text), ")");
        } else {
          // 如果匹配到插值表达式，则进行处理
          // _v(_s(name) + 'text' + _s(age))
          var tokens = [];
          var match;
          defaultTagRE.lastIndex = 0; // 重置lastIndex
          var lastIndex = 0;
          while (match = defaultTagRE.exec(text)) {
            var index = match.index;
            if (index > lastIndex) {
              tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            tokens.push("_s(".concat(match[1].trim(), ")"));
            lastIndex = index + match[0].length;
          }
          if (text.length > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
          }
          return "_v(".concat(tokens.join('+'), ")");
        }
      }
    }
    function genChildren(children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
    function codegen(ast) {
      var children = genChildren(ast.children);
      // _c("div", {id: "app"}, _c("p", null, _v(_s(name) + 'text' + _s(age), ...), ...))
      var code = "_c(\"".concat(ast.tag, "\",").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : "null").concat(ast.children.length > 0 ? ",".concat(children) : "", ")");
      return code;
    }

    // 对模板进行编译
    function compileToFunction(template) {
      // 1.将template字符串通过正则匹配，然后解析成语法树
      var ast = parseHTML(template);
      // 2.生成render方法（render方法执行后返回的结果就是虚拟DOM）
      // _c("div", {id: "app"}, _c("p", null, _v(_s(name) + 'text' + _s(age), ...), ...))
      var code = codegen(ast);
      // 实现模板引擎，with + new Function（需要了解with函数和Function构造函数）
      code = "with(this){return ".concat(code, "}");
      var render = new Function(code);
      return render;
    }

    var id$1 = 0;
    var Dep = /*#__PURE__*/function () {
      function Dep() {
        _classCallCheck(this, Dep);
        this.id = id$1++;
        this.subs = [];
      }
      _createClass(Dep, [{
        key: "depend",
        value: function depend() {
          // 不希望重复记录同一个watcher，所以wathcer记录dep
          // this.subs.push(Dep.target);
          Dep.target.addDep(this); // 先让watcher记录dep，通过watcher通过id去重

          // 一个属性可以在多个组件中使用，所以dep -> 多个watcher
          // 一个组件使用多个属性，所以watcher -> 多个dep
        }
      }, {
        key: "addSub",
        value: function addSub(watcher) {
          this.subs.push(watcher);
        }
      }, {
        key: "notify",
        value: function notify() {
          this.subs.forEach(function (watcher) {
            return watcher.update();
          }); // 一个属性变化，则所有依赖该属性的组件都需要更新
        }
      }]);
      return Dep;
    }();
    Dep.target = null;
    var stack = [];
    function pushStack(watcher) {
      stack.push(watcher);
      Dep.target = watcher;
    }
    function popStack() {
      stack.pop();
      Dep.target = stack[stack.length - 1];
    }

    var id = 0;

    // 每一个属性都有一个dep记录（属性是被观察者），watcher就是观察者（属性变化了会通知观察者来更新） -> 观察者模式

    // 每个组件都有一个watcher，用一个id进行区分
    // 目前只有根组件
    var Watcher = /*#__PURE__*/function () {
      function Watcher(vm, exprOrFn, options, cb) {
        _classCallCheck(this, Watcher);
        this.id = id++;
        this.renderWatcher = options; // 是一个渲染watcher
        // getter说明该函数会发生取值（将插值表达式中的属性从data中取出，触发get属性描述符）操
        // 每次都会拿到oldNode，创建newOld，更新DOM后重新赋值vm.$el
        if (typeof exprOrFn === 'string') {
          this.getter = function () {
            return vm[exprOrFn];
          };
        } else {
          this.getter = exprOrFn;
        }
        this.deps = []; // 后续我们需要实现计算属性等，还有一些清理工作
        this.depsId = new Set();
        this.cb = cb;
        this.user = options.user; // 表示是否是用户自己的watcher

        this.lazy = options.lazy;
        this.dirty = this.lazy; // 缓存值
        this.vm = vm;
        this.value = this.lazy ? undefined : this.get(); // 调用执行一次
      }
      _createClass(Watcher, [{
        key: "addDep",
        value: function addDep(dep) {
          // 当多个属性变化需要更新节点，通过dep收集这些属性所在的watcher，多个属性在同一个watcher则需要去重
          // defineReactive的闭包导致每一个属性都是同一个new Dep在收集，所以id不变
          var id = dep.id;
          if (!this.depsId.has(id)) {
            this.deps.push(dep); // 当前的wathcer是由哪个dep进行记录
            this.depsId.add(id);
            dep.addSub(this); // dep记录当前属性变化后所需更新视图的watcher
          }
        }
      }, {
        key: "evaluate",
        value: function evaluate() {
          this.value = this.get(); // 获取用户函数返回值（计算属性），并标记为脏
          this.dirty = false;
        }
      }, {
        key: "get",
        value: function get() {
          // 静态属性，将当前更新视图的watcher保存
          // getter里的with方法触发数据劫持，get回调中拿到当前属性的watcher
          // 并使用dep.depend方法，depend调用watcher.addDep去重多个属性在同一个watcher
          // Dep.target = this;
          pushStack(this);
          var value = this.getter.call(this.vm); // 将插值表达式中的属性从data中取出（计算属性也会从实例上取值），触发get属性描述符
          // Dep.target = null; // 清空
          popStack();
          return value;
        }
      }, {
        key: "depend",
        value: function depend() {
          var i = this.deps.length;
          while (i--) {
            // dep.depend收集渲染watcher（Dep.target）
            this.deps[i].depend(); // 计算属性watcher也收集渲染watcher
          }
        }
      }, {
        key: "update",
        value: function update() {
          if (this.lazy) {
            this.dirty = true; // 如果计算属性依赖值变化了，重置脏值
          } else {
            // 把所有需要update的watcher都暂存起来
            queryWatcher(this);
          }
        }
      }, {
        key: "run",
        value: function run() {
          var oldValue = this.value;
          var newValue = this.get();
          this.get();
          if (this.user) {
            this.cb.call(this.vm, newValue, oldValue);
          }
        }
      }]);
      return Watcher;
    }(); // 给每个属性都增加一个dep，目的是收集watcher（需要去重）
    var queue = [];
    var has = {};
    var pending = false; // 防抖

    function flushSchedulerQueue() {
      var flushQueue = queue.slice(0);
      queue = []; // 再刷新的过程中，可能还有新的watcher放入queue中，继续收集
      has = {};
      pending = false;
      flushQueue.forEach(function (q) {
        return q.run();
      });
    }
    function queryWatcher(watcher) {
      // 对watcher进行去重
      var id = watcher.id;
      if (!has[id]) {
        queue.push(watcher); // 去重watcher
        has[id] = true;
        // 不管我们的update执行多少次，但是最终所有同步操作执行后异步更新dom（事件循环）
        if (!pending) {
          // setTimeout(flushSchedulerQueue, 0);
          // 通过异步任务，当所有的相应数据变化后，最后只进行一次dom更新
          nextTick(flushSchedulerQueue);
          pending = true;
        }
      }
    }
    var callbacks = [];
    var waiting = false;
    function flushCallbacks() {
      var cbs = callbacks.slice(0); // 保存需要执行方法
      waiting = false;
      callbacks = []; // 在执行时可以继续收集方法
      cbs.forEach(function (cb) {
        return cb();
      });
    }

    // vue中没有直接使用某个api，而是采用了优雅降级的方式
    // 先用promise(ie不兼容)  MutationObserver(H5的api，node没有)  IE专享setImmediate  最后setTimeout
    var timerFunc;
    if (Promise) {
      timerFunc = function timerFunc() {
        Promise.resolve().then(flushCallbacks);
      };
    } else if (MutationObserver) {
      var observer = new MutationObserver(flushCallbacks); // 传入的回调异步执行
      var textNode = document.createTextNode(1);
      observer.observe(textNode, {
        characterData: true
      });
      timerFunc = function timerFunc() {
        textNode.textContent = 2;
      };
    } else if (setImmediate) {
      timerFunc = function timerFunc() {
        setImmediate(flushCallbacks);
      };
    } else {
      timerFunc = function timerFunc() {
        setTimeout(flushCallbacks);
      };
    }
    function nextTick(cb) {
      callbacks.push(cb); // 维护nextTick中的callback方法
      if (!waiting) {
        // setTimeout(() => {
        //     flushCallbacks();
        // }, 0);
        timerFunc(); // 正常直接使用Promise即可
        waiting = true;
      }
    }

    // _c('div', {}, ...children)
    function createElementVNode(vm, tag, data) {
      if (data == null) {
        data = {};
      }
      // key是元素属性绑定的标识，可能存在
      var key = data.key;
      // key用于识别元素，dom上并不需要进行绑定该属性
      if (key) {
        delete data.key;
      }
      for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        children[_key - 3] = arguments[_key];
      }
      return vnode(vm, tag, key, data, children);
    }
    // _v(_s(name) + 'text' + _s(age))
    function createTextVNode(vm, text) {
      return vnode(vm, undefined, undefined, undefined, undefined, text);
    }

    // 结构和ast一样吗？ast做的是语法层面的转化，描述语法本身
    // 虚拟dom是描述dom元素，可以增加自定义属性
    function vnode(vm, tag, key, data, children, text) {
      return {
        vm: vm,
        tag: tag,
        key: key,
        data: data,
        // 属性
        children: children,
        text: text
      };
    }
    function isSameVnode(vnode1, vnode2) {
      // 比较两个虚拟dom的标签名和key
      return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
    }

    function createElm(vnode) {
      var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;
      if (typeof tag === 'string') {
        // 创建标签
        vnode.el = document.createElement(tag);
        // 设置属性
        patchProps(vnode.el, {}, data);
        children.forEach(function (child) {
          vnode.el.appendChild(createElm(child));
        });
      } else {
        // 创建文本
        vnode.el = document.createTextNode(text);
      }
      return vnode.el;
    }
    function patchProps(el) {
      var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      // 比较新老dom的属性
      var oldStyles = oldProps.style || {};
      var newStyles = props.style || {};
      for (var key in oldStyles) {
        // 新dom没有的style属性删除
        if (!newStyles[key]) {
          el.style[key] = '';
        }
      }
      for (var _key in oldProps) {
        // 新dom没有的属性删除
        if (!props[_key]) {
          el.removeAttribute(_key);
        }
      }
      for (var _key2 in props) {
        if (_key2 === 'style') {
          for (var styleName in props.style) {
            el.style[styleName] = props.style[styleName];
          }
        } else {
          el.setAttribute(_key2, props[_key2]);
        }
      }
    }
    function patch(oldVNode, vnode) {
      var isRealElement = oldVNode.nodeType; // 是否是真实节点
      if (isRealElement) {
        var elm = oldVNode;
        var parentElm = elm.parentNode; // 获取节点父元素
        var newElm = createElm(vnode);
        parentElm.insertBefore(newElm, elm.nextSibling); // 插入生成的节点
        parentElm.removeChild(elm); // 删除老节点
        return newElm;
      } else {
        // 1.两个节点不是同一个节点  直接删除老的换上新的  （没有比对了）
        // 2.两个节点是同一个节点 (判断节点的tag和 节点的key)  比较两个节点的属性是否有差异 （复用老的节点，将差异的属性更新）
        // 3.节点比较完毕后就需要比较两人的儿子
        return patchVnode(oldNode, vnode);
      }
      function patchVnode(oldVNode, vnode) {
        if (!isSameVnode(oldVNode, vnode)) {
          // 不是一个节点就直接用新节点替换
          var _el = createElm(vnode);
          // 找到当前挂载的dom父节点，用新属性生成的节点进行替换
          oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
          return _el;
        }
        // 节点一样，复用老的节点
        // 文本的情况 文本我们期望比较一下文本的内容
        var el = vnode.el = oldVNode.el;
        if (!oldVNode.tag) {
          if (oldVNode.text !== vnode.text) {
            el.textContent = vnode.text; // 新文本覆盖老的文本
          }
        }
        // 比对标签的属性是否变化
        patchProps(el, oldVNode.data, vnode.data);

        // 比较子节点
        var oldChildren = oldVNode.children || [];
        var newChildren = vnode.children || [];
        if (oldChildren.length > 0 && newChildren.length > 0) {
          // 需要比较子节点
          updateChildren(el, oldChildren, newChildren);
        } else if (oldChildren.length > 0) {
          // 老节点有子节点，新节点没有子节点，直接删除
          el.innerHTML = '';
        } else if (newChildren.length > 0) {
          // 老节点没有子节点，新节点有子节点，遍历插入
          mountChildren(el, newChildren);
        }
        return el;
      }
      function mountChildren(el, newChildren) {
        for (var i = 0; i < newChildren.length; i++) {
          var child = newChildren[i];
          el.appendChild(createElm(child));
        }
      }
      function updateChildren(el, oldChildren, newChildren) {
        // 我们操作列表通常有push、shift、unshift、pop、reverse、sort等方法
        // vue2中使用双指针来比较两个节点
        var oldStartIndex = 0;
        var newStartIndex = 0;
        var oldEndIndex = oldChildren.length - 1;
        var newEndIndex = newChildren.length - 1;
        var oldStartVnode = oldChildren[0];
        var newStartVnode = newChildren[0];
        var oldEndVnode = oldChildren[oldEndIndex];
        var newEndVnode = newChildren[newEndIndex];
        function makeIndexByKey(children) {
          var map = {};
          children.forEach(function (child, index) {
            map[child.key] = index;
          });
          return map;
        }
        var map = makeIndexByKey(oldChildren);
        while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
          // 在给动态列表增加key时，避免使用索引作为key值（old:[a,b,c],new[d,a,b,c].由于a和d索引一致，从尾尾比对变成首首比对）
          // 有一方头指针大于尾指针就停止循环
          if (!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex];
          } else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex];
          } else if (isSameVnode(oldStartVnode, newStartVnode)) {
            // old a,b,c    new a,b，开头相同，末尾有增减 
            patchVnode(oldStartVnode, newStartVnode); // 如果相同节点，则递归比较子节点
            oldStartVnode = oldChildren[++oldStartIndex];
            newStartVnode = newChildren[++newStartIndex];
          } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            // old a,b,c    new d,a,b,c 末尾相同，开头有增减 
            patchVnode(oldEndVnode, newEndVnode); // 如果相同节点，则递归比较子节点
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex];
          } else if (isSameVnode(oldEndVnode, newStartVnode)) {
            // old a,b,c,d     new  d,a,b,c 尾部移动到前面
            // 剩下的交叉（旧尾新首比对）
            patchVnode(oldEndVnode, newStartVnode);
            el.insertBefore(oldEndVnode.el, oldStartVnode.el); // 将老节点的尾部移动到前面
            oldEndVnode = oldChildren[--oldEndIndex];
            newStartVnode = newChildren[++newStartIndex];
          } else if (isSameVnode(oldStartVnode, newEndVnode)) {
            // old a,b,c,d     new  b,c,d,a 尾部移动到前面
            // 剩下的交叉（旧首新尾比对）
            patchVnode(oldStartVnode, newEndVnode);
            el.insertBefore(oldStartVnode.el, newEndVnode.el.nextSibling); // 将老节点的前面移动到尾部
            oldStartVnode = oldChildren[++oldStartIndex];
            newEndVnode = newChildren[--newEndIndex];
          } else {
            // 乱序比对
            // 根据老的子节点做一个映射表map，用新的去找，找到就移动，找不到就将新的添加，多得最后删除
            var moveIndex = map[newStartVnode.key]; // 如果拿到了对应的索引则说明要移动
            if (moveIndex !== undefined) {
              var moveVnode = oldChildren[moveIndex];
              el.insertBefore(moveVnode.el, oldStartVnode.el);
              oldChildren[moveIndex] = undefined; // 表示这个节点已经移走
              patchVnode(moveVnode, newStartVnode); // 移动后别忘了继续比较子节点
            } else {
              // 新节点在映射中找不到，直接插入新的节点
              el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
            }
            // 最后保存新的头节点
            newStartVnode = newChildren[++newStartIndex];
          }
        }
        if (newStartIndex <= newEndIndex) {
          // 新节点的子节点更多，将多余节点插入
          for (var i = newStartIndex; i <= newEndIndex; i++) {
            var childEl = createElm(newChildren[i]);
            // 这里可能是向前追加，可能是向后追加（判断后面还有没有节点知悉是向头还是向尾插入）
            var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null;
            el.insertBefore(childEl, anchor); // anchor为null时直接从尾部插入appendChild
          }
        }

        if (oldStartIndex <= oldEndIndex) {
          // 旧节点的子节点更多，删除多余的节点
          for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
            if (oldChildren[_i]) {
              var _childEl = oldChildren[_i].el;
              el.removeChild(_childEl);
            }
          }
        }
      }
    }

    function initLifeCycle(Vue) {
      // 将vnode转化成为真实dom
      Vue.prototype._update = function (vnode) {
        // 通过_render方法，拿到虚拟dom
        var vm = this;
        var el = vm.$el;
        // patch 初始化、更新
        // vm.$el = patch(el, vnode); // 每次覆盖最新的dom
        var prevVnode = vm._vnode;
        if (prevVnode) {
          // 后续使用diff算法比对更新
          vm.$el = patch(prevVnode, vnode);
        } else {
          // 第一次直接替换模板
          vm.$el = patch(el, vnode);
        }
      };
      // _c('div', {}, ...children) 创建元素节点
      Vue.prototype._c = function () {
        return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };
      // _v(_s(name) + 'text' + _s(age)) // 创建文本节点
      Vue.prototype._v = function () {
        return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };
      // 直接返回文本字符串即可
      Vue.prototype._s = function (value) {
        if (_typeof(value) !== 'object') return value;
        return JSON.stringify(value);
      };
      Vue.prototype._render = function () {
        // 使得render中的with(this)指向vm，从而获取到data中的值
        // 并返回由with包裹的_c(tag, {}, ...children)方法
        return this.$options.render.call(this);
      };
    }

    /**
     * vue的核心流程：
     * 1.创建响应式的数据
     * 2.模板转换成ast语法树
     * 3.将ast语法树转换成render函数（render函数会去产生虚拟节点、使用响应式数据）
     * 4.每次更新数据只执行render函数（无需再执行ast转化过程）
     * 通过虚拟节点创建真是DOM
     */

    function mountComponent(vm, el) {
      vm.$el = el; // 保存最开始的dom
      // 调用render方法产生虚拟节点 虚拟DOM
      // 渲染时通过with方法，插值表达式中的属性会从实例中取值
      // 做到data的属性和dom视图绑定在一起
      var updateComponent = function updateComponent() {
        // 根据虚拟DOM生成真是DOM
        // 插入到需要挂载的el元素中
        vm._update(vm._render()); // vm.$options.render()
      };
      // 一个watcher就是一个组件的更新观察者
      new Watcher(vm, updateComponent, true);
    }
    function callHook(vm, hook) {
      // 调用钩子函数
      var hanlers = vm.$options[hook];
      // hanlers是一个数组
      if (hanlers) {
        hanlers.forEach(function (hand) {
          return hand.call(vm);
        });
      }
    }

    var oldArrayProto = Array.prototype; // 保存Array上已有的原型方法
    var newArrayProto = Object.create(oldArrayProto); // 通过已有的原型方法，创建一个对象

    var methods = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice']; // 记录会改变数组的原型方法名称

    methods.forEach(function (method) {
      // 重写对象中的方法
      newArrayProto[method] = function () {
        var _oldArrayProto$method;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        // 调用原来的方法对数组进行操作（注意this指向）
        var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));
        var inserted = null; // 保存数组新增的元素
        var ob = this.__ob__; // 获取调用者身上保存的Observe实例，方式后续使用walk、observeArray方法
        switch (method) {
          case 'push':
          case 'unshift':
            inserted = args;
            break;
          case 'splice':
            inserted = args.slice(2);
            break;
        }
        if (inserted) {
          ob.observeArray(inserted); // 遍历数组，对引用类型子元素进行监听
        }
        // 对改变数组的值进行劫持
        ob.dep.notify(); // 通知数组的watcher进行更新
        return result;
      };
    });

    var Observer = /*#__PURE__*/function () {
      function Observer(data) {
        _classCallCheck(this, Observer);
        // 给每个对象都增加依赖收集（对象、数组增加新的属性元素都能都收集到）
        this.dep = new Dep(); // 让整个对象被收集到

        // 在data属性上保存实例，以便后续随时可以调用walk/observeArray等方法
        Object.defineProperty(data, '__ob__', {
          value: this,
          enumerable: false // 不可被枚举（遍历），方死循环
        });

        if (Array.isArray(data)) {
          // 劫持数组每个属性极其耗费性能，所以直接修改会对数组造成改动的方法
          data.__proto__ = newArrayProto; // 改变data中数组变量的原型（影响性能）
          this.observeArray(data); // 
        }

        this.walk(data);
      }
      _createClass(Observer, [{
        key: "walk",
        value: function walk(data) {
          // 遍历data的所有属性，依次劫持
          Object.keys(data).forEach(function (key) {
            return defineReactive(data, key, data[key]);
          });
        }
      }, {
        key: "observeArray",
        value: function observeArray(data) {
          // 劫持数组的属性
          data.forEach(function (item) {
            return observe(item);
          });
        }
      }]);
      return Observer;
    }(); // 深层次嵌套产生递归，递归多了性能差，不存在的属性监控不到，存在的属性要重写方法
    function dependArray(value) {
      for (var i = 0; i < value.length; i++) {
        var current = value[i];
        current.__ob__ && current.__ob__.dep.depend();
        if (Array.isArray(current)) {
          dependArray(current);
        }
      }
    }
    function defineReactive(target, key, value) {
      // 与Object.defineProperty形成闭包
      var childOb = observe(value); // 若value也为对象，增继续向下监听
      var dep = new Dep(); // 闭包到时dep一直被get和set引用
      // 属性劫持，对data的每个属性"重新定义"，影响了性能
      Object.defineProperty(target, key, {
        get: function get() {
          if (Dep.target) {
            dep.depend(); // watcher获取所需属性，让收集器记住当前属性的watcher
            if (childOb) {
              childOb.dep.depend(); // 不止对象的属性，数组、对象本身也依赖收集
              if (Array.isArray(value)) {
                dependArray(value);
              }
            }
          }
          return value;
        },
        set: function set(newVal) {
          if (value === newVal) return;
          observe(newVal); // 如果设置新值为对象，则需要继续劫持
          value = newVal;
          dep.notify(); // 通知更新
        }
      });
    }

    function observe(data) {
      // 只劫持对象，多层对象深度劫持时的出口
      if (_typeof(data) !== 'object' || data == null) return;
      if (data.__ob__ instanceof Observer) {
        // 说明这个对象被代理过了
        return data.__ob__;
      }
      return new Observer(data);
    }

    function initState(vm) {
      var opts = vm.$options;
      if (opts.data) {
        initData(vm);
      }
      if (opts.computed) {
        initComputed(vm);
      }
      if (opts.watch) {
        initWatch(vm);
      }
    }
    function proxy(vm, target, key) {
      Object.defineProperty(vm, key, {
        get: function get() {
          // 取vm.name => 访问vm._data.name
          return vm[target][key];
        },
        set: function set(newVal) {
          // 设置vm.name => 访问vm._data.name
          vm[target][key] = newVal;
        }
      });
    }

    // 初始化data
    function initData(vm) {
      var data = vm.$options.data; // 赋值后如果是方法，直接调用this会指向window
      data = typeof data === 'function' ? data.call(vm) : data; // 执行方法data，指向Vue实例
      vm._data = data; // 将data挂载到实例上，方面每次使用（vm.$options.data -> vm._data）
      // 拿到data后对其进行数据劫持（监听data中数据的变化）
      observe(data);
      // 将vm._data代理到vm身上
      for (var key in data) {
        proxy(vm, '_data', key);
      }
    }
    // 计算属性
    function initComputed(vm) {
      var computed = vm.$options.computed;
      var watchers = vm._computedWatchers = {};
      for (var key in computed) {
        var userDef = computed[key];

        // 我们需要监控计算属性 get 变化
        var fn = typeof userDef === 'function' ? userDef : userDef.get;

        // 传入lazy避免初始化Watcher立刻执行fn，并将watcher与当前计算属性对应起来
        watchers[key] = new Watcher(vm, fn, {
          lazy: true
        });

        // 劫持计算属性，等触发（异步，所以此时计算属性已经和计算wathcer绑定）_update(_render)触发计算属性的get
        defineComputed(vm, key, userDef);
      }
    }
    function defineComputed(target, key, userDef) {
      var setter = userDef.set || function () {};
      // 将计算属性代理到实例上
      Object.defineProperty(target, key, {
        // defineProperty中this指向代理对象
        get: createComputedGetter(key),
        set: setter
      });
    }
    // 所以实际上不是计算属性收集依赖，而是让依赖收集计算wather和渲染watcher，然后通过get触发更新
    function createComputedGetter(key) {
      // 需要检测当前getter是否需要执行（依赖不变不用重新执行）
      return function () {
        var watcher = this._computedWatchers[key]; // 拿到计算属性对应的watcher
        if (watcher.dirty) {
          // 避免多次执行
          // 执行watcher.get方法，通过触发依赖的属性get记录当前的计算属性watcher，保存计算属性的值value
          // 计算属性取值依赖属性时，依赖属性的dep记录了当前计算属性watcher[0]
          watcher.evaluate();
        }
        if (Dep.target) {
          // 计算属性出栈后 还有渲染watcher，让依赖属性的dep将渲染watcher也记录
          // 如果依赖属性不变化，直接从当前计算属性的watcher中取值
          // 依赖属性变化，先让计算watcher重置dirty，再触发渲染wahter重新取值，重新计算新的计算属性
          watcher.depend();
        }
        return watcher.value;
      };
    }
    // 监听属性
    function initWatch(vm) {
      var watch = vm.$options.watch;
      for (var key in watch) {
        var handler = watch[key]; // 字符串、数组、函数、对象
        if (Array.isArray(handler)) {
          for (var i = 0; i < handler.length; i++) {
            createWatcher(vm, key, handler[i]);
          }
        } else {
          createWatcher(vm, key, handler);
        }
      }
    }
    function createWatcher(vm, key, handler) {
      // handler字符、函数、对象(暂不考虑)
      if (typeof handler === 'string') {
        handler = vm[handler]; // 取出当前监听的属性值
      }

      return vm.$watch(key, handler);
    }
    function initStateMixin(Vue) {
      Vue.prototype.$nextTick = nextTick;
      Vue.prototype.$watch = function (expOrFn, cb) {
        // expOrFn可能是字符name，可能时函数() => vm.name
        // expOrFn是取值操作，出发了监听属性的get收集到当前watcher
        // name变化了 直接执行cb函数即可
        new Watcher(this, expOrFn, {
          user: true
        }, cb);
      };
    }

    // 给Vue增加init方法
    function initMixin(Vue) {
      // new Vue初始化需要执行的操作
      Vue.prototype._init = function (options) {
        // 将传进来的用户选项挂载到实例上
        var vm = this;
        // 定义的全局指令和过滤器...都会（合并）挂载到实例上
        vm.$options = mergeOptions(this.constructor.options, options);

        // 初始化状态之前
        callHook(vm, 'beforeCreate');
        // 初始化参数各个属性的状态（data、watch、computed）
        initState(vm);

        // 初始化状态之后
        callHook(vm, 'created');
        if (options.el) {
          vm.$mount(options.el); // 实现数据的挂载
        }
      };

      Vue.prototype.$mount = function (el) {
        var vm = this;
        el = document.querySelector(el); // 找到实例挂载的元素
        var ops = vm.$options;
        if (!ops.render) {
          // 查找有没有render函数
          var template;
          if (!ops.template && el) {
            // 没有模板但是挂载了元素，直接使用挂载元素(字符串)
            template = el.outerHTML;
          } else {
            // 有模板且挂载了元素，直接使用模板
            if (el) {
              template = ops.template;
            }
          }
          if (template) {
            // 拿到模板，则对模板进行编译，得到render方法
            var render = compileToFunction(template);
            // 将render方法绑定到实例的options上
            ops.render = render;
          }
        }
        // 拿到了Vue的实例化对象（包含所有选项和render方法），以及需要挂载的元素节点
        mountComponent(vm, el);
      };
    }

    // 将所有的方法都耦合在一起
    function Vue(options) {
      // options就是用户的选项
      this._init(options);
    }
    initMixin(Vue); // 拓展Vue的实例方法
    initLifeCycle(Vue); // vm_update、vm_render
    initStateMixin(Vue); // 实现了nextTick、$watcher
    initGlobalAPI(Vue);

    return Vue;

}));
//# sourceMappingURL=vue.js.map
