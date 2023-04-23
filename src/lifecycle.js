export function initLifeCycle(Vue) {
    Vue.prototype._update = function() {
        console.log('_update');
    }
    Vue.prototype._render = function() {
        console.log('_render');
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
    // 调用render方法产生虚拟节点 虚拟DOM
    vm._update(vm._render()); // vm.$options.render()

    // 根据虚拟DOM生成真是DOM

    // 插入到需要挂载的el元素中
}