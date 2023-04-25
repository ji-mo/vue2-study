import Dep from "./dep";

let id = 0;


// 每一个属性都有一个dep记录（属性是被观察者），watcher就是观察者（属性变化了会通知观察者来更新） -> 观察者模式


// 每个组件都有一个watcher，用一个id进行区分
// 目前只有根组件
class Watcher {
    constructor(vm, fn, options) {
        this.id = id ++;
        this.renderWatcher = options; // 是一个渲染watcher
        // getter说明该函数会发生取值（将插值表达式中的属性从data中取出，触发get属性描述符）操
        // 每次都会拿到oldNode，创建newOld，更新DOM后重新赋值vm.$el
        this.getter = fn;
        this.deps = []; // 后续我们需要实现计算属性等，还有一些清理工作
        this.depsId = new Set();
        this.get();
    }
    addDep(dep) {
        let id = dep.id;
        // 数据劫持的闭包导致同一个属性的dep不被释放
        if (!this.depsId.has(id)) {
            this.deps.push(dep); // 当前的wathcer是由哪个dep进行记录
            this.depsId.add(id);
            dep.addSub(this); // dep记录当前更新视图的watcher
        }
    }
    get() {
        Dep.target = this; // 静态属性，将当前更新视图的watcher保存，供数据劫持的get拿到
        this.getter(); // 将插值表达式中的属性从data中取出，触发get属性描述符
        Dep.target = null; // 清空
    }
    update() {
        this.get();
    }
}

// 给每个属性都增加一个dep，目的是收集watcher

export default Watcher;