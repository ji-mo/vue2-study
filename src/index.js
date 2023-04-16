import { initMixin } from "./init";

// 将所有的方法都耦合在一起
function Vue(options) {
    // options就是用户的选项
    this._init(options);
}
initMixin(Vue); // 拓展Vue的实例方法

export default Vue;