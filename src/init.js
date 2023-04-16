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
}