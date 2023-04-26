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
        queryWatcher(this); // 把watcher都暂存起来
        // this.get();
    }
    run() {
        this.get();
    }
}
// 给每个属性都增加一个dep，目的是收集watcher

let queue = [];
let has = {};
let pending = false; // 防抖

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(q => q.run()); // 再刷新的过程中，可能还有新的watcher放入queue中

}

function queryWatcher(watcher) {
    const id = watcher.id;
    if (!has[id]) {
        queue.push(watcher); // 去重watcher
        has[id] = true;
        // 不管我们的update执行多少次，但是最终所有同步操作执行后异步更新dom（事件循环）
        if (!pending) {
            // setTimeout(flushSchedulerQueue, 0);
            nextTick(flushSchedulerQueue, 0);
            pending = true;
        }
    }
}

let callbacks = [];
let waiting = false;
function flushCallbacks() {
    let cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach(cb => cb());
}

// vue中没有直接使用某个api，而是采用了优雅降级的方式
// 先用promise(ie不兼容)  MutationObserver(H5的api，node没有)  IE专享setImmediate  最后setTimeout
let timerFunc;
if (Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallbacks);
    }
} else if (MutationObserver) {
    let observer = new MutationObserver(flushCallbacks); // 传入的回调异步执行
    let textNode = document.createTextNode(1);
    observer.observe(textNode, {
        characterData: true,
    });
    timerFunc = () => {
        textNode.textContent = 2;
    };
} else if (setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallbacks);
    }
} else {
    timerFunc = () => {
        setTimeout(flushCallbacks);
    }
}
export function nextTick(cb) {
    callbacks.push(cb); // 维护nextTick中的callback方法
    if (!waiting) {
        // setTimeout(() => {
        //     flushCallbacks();
        // }, 0);
        timerFunc(); // 正常直接使用Promise即可
        waiting = true;
    }
}


export default Watcher;