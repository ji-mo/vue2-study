import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";
import { patch } from "./vdom/patch";

export function initLifeCycle(Vue) {
    // 将vnode转化成为真实dom
    Vue.prototype._update = function(vnode) {
        // 通过_render方法，拿到虚拟dom
        const vm = this;
        const el = vm.$el;
        // patch 初始化、更新
        // vm.$el = patch(el, vnode); // 每次覆盖最新的dom
        const prevVnode = vm._vnode;
        if (prevVnode) {
            // 后续使用diff算法比对更新
            vm.$el = patch(prevVnode, vnode);
        } else {
            // 第一次直接替换模板
            vm.$el = patch(el, vnode);
        }
    }
    // _c('div', {}, ...children) 创建元素节点
    Vue.prototype._c = function() {
        return createElementVNode(this, ...arguments);
    }
    // _v(_s(name) + 'text' + _s(age)) // 创建文本节点
    Vue.prototype._v = function() {
        return createTextVNode(this, ...arguments);
    }
    // 直接返回文本字符串即可
    Vue.prototype._s = function(value) {
        if (typeof value !== 'object') return value;
        return JSON.stringify(value);
    }
    Vue.prototype._render = function() {
        // 使得render中的with(this)指向vm，从而获取到data中的值
        // 并返回由with包裹的_c(tag, {}, ...children)方法
        return this.$options.render.call(this);
    }
}

/**
 * vue的核心流程：
 * 1.创建响应式的数据
 * 2.模板转换成ast语法树
 * 3.将ast语法树转换成render函数（render函数会去产生虚拟节点、使用响应式数据）
 * 4.每次更新数据只执行render函数（无需再执行ast转化过程）
 * 通过虚拟节点创建真是DOM
 */

export function mountComponent(vm, el) {
    vm.$el = el; // 保存最开始的dom
    // 调用render方法产生虚拟节点 虚拟DOM
    // 渲染时通过with方法，插值表达式中的属性会从实例中取值
    // 做到data的属性和dom视图绑定在一起
    const updateComponent = () => {
        // 根据虚拟DOM生成真是DOM
        // 插入到需要挂载的el元素中
        vm._update(vm._render()); // vm.$options.render()
    };
    // 一个watcher就是一个组件的更新观察者
    new Watcher(vm, updateComponent, true);
}

export function callHook(vm, hook) { // 调用钩子函数
    const hanlers = vm.$options[hook];
    // hanlers是一个数组
    if (hanlers) {
        hanlers.forEach(hand => hand.call(vm));
    }
}