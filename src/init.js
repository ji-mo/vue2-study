import { compileToFunction } from "./complier";
import { mountComponent } from "./lifecycle";
import { initState } from "./state";

// 给Vue增加init方法
export function initMixin(Vue) {
    // new Vue初始化需要执行的操作
    Vue.prototype._init = function (options) {
        // 将传进来的用户选项挂载到实例上
        const vm = this;
        vm.$options = options;

        // 初始化参数各个属性的状态（data、watch、computed）
        initState(vm);
    }
    Vue.prototype.$mount = function (el) {
        const vm = this;
        el = document.querySelector(el); // 找到实例挂载的元素
        let ops = vm.$options;
        if (!ops.render) { // 查找有没有render函数
            let template;
            if (!ops.template && el) {
                // 没有模板但是挂载了元素，直接使用挂载元素
                template = el.outerHTML;
            } else {
                // 有模板且挂载了元素，直接使用模板
                if (el) {
                    template = ops.template;
                }
            }
            if (template) {
                // 拿到模板，则对模板进行编译，得到render方法
                const render = compileToFunction(template);
                ops.render = render;
            }
            // 拿到了Vue的实例化对象（包含所有选项和render方法），以及需要挂载的元素节点
            mountComponent(vm, el);
        }
        ops.render;
    }
}