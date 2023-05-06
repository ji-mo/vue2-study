import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import Watcher, { nextTick } from "./observe/watcher";

// 将所有的方法都耦合在一起
function Vue(options) {
    // options就是用户的选项
    this._init(options);
}
Vue.prototype.$nextTick = nextTick;
initMixin(Vue); // 拓展Vue的实例方法
initLifeCycle(Vue);
Vue.prototype.$watch = function (expOrFn, cb) {
    // expOrFn可能是字符name，可能时函数() => vm.name
    // expOrFn是取值操作，出发了监听属性的get收集到当前watcher
    // name变化了 直接执行cb函数即可
    new Watcher(this, expOrFn, {user: true}, cb);
}

export default Vue;