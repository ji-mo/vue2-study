import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue) {
    Vue.options = {};
    Vue.mixin = function(mixin) {
        // 期望将用户的选项和全聚德options进行合并
        // mixin(xxx(){}) => {xxx: [fn]}
        // {xxx: [fn]}  mixin(xxx(){}) => {xxx: [fn, fn]}
        this.options = mergeOptions(this.options, mixin);
        return this;
    }
    // Vue.extend = function(options) {
    //     function Sub() {

    //     }
    //     Sub.prototype = Object.create(Vue.prototype); // Sub.prototype.__proto__ === Vue.prototype
    //     Sub.options = options; // 保存用户传递的选项
    //     return Sub;
    // }
}