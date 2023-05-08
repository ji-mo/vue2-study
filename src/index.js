import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";

// 将所有的方法都耦合在一起
function Vue(options) {
    // options就是用户的选项
    this._init(options);
}

initMixin(Vue); // 拓展Vue的实例方法
initLifeCycle(Vue); // vm_update、vm_render
initStateMixin(Vue); // 实现了nextTick、$watcher

export default Vue;