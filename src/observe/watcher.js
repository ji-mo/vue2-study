import Dep, { popStack, pushStack } from "./dep";

let id = 0;


// 每一个属性都有一个dep记录（属性是被观察者），watcher就是观察者（属性变化了会通知观察者来更新） -> 观察者模式


// 每个组件都有一个watcher，用一个id进行区分
// 目前只有根组件
class Watcher {
    constructor(vm, exprOrFn, options, cb) {
        this.id = id ++;
        this.renderWatcher = options; // 是一个渲染watcher
        // getter说明该函数会发生取值（将插值表达式中的属性从data中取出，触发get属性描述符）操
        // 每次都会拿到oldNode，创建newOld，更新DOM后重新赋值vm.$el
        if (typeof exprOrFn === 'string') {
            this.getter = function() {
                return vm[exprOrFn];
            }
        } else {
            this.getter = exprOrFn;
        }
        this.deps = []; // 后续我们需要实现计算属性等，还有一些清理工作
        this.depsId = new Set();
        this.cb = cb;
        this.user = options.user; // 表示是否是用户自己的watcher

        this.lazy = options.lazy;
        this.dirty = this.lazy; // 缓存值
        this.vm = vm;
        this.value = this.lazy ?  undefined : this.get(); // 调用执行一次
    }
    addDep(dep) {
        // 当多个属性变化需要更新节点，通过dep收集这些属性所在的watcher，多个属性在同一个watcher则需要去重
        // defineReactive的闭包导致每一个属性都是同一个new Dep在收集，所以id不变
        let id = dep.id;
        if (!this.depsId.has(id)) {
            this.deps.push(dep); // 当前的wathcer是由哪个dep进行记录
            this.depsId.add(id);
            dep.addSub(this); // dep记录当前属性变化后所需更新视图的watcher
        }
    }
    evaluate() {
        this.value = this.get(); // 获取用户函数返回值（计算属性），并标记为脏
        this.dirty = false;
    }
    get() {
        // 静态属性，将当前更新视图的watcher保存
        // getter里的with方法触发数据劫持，get回调中拿到当前属性的watcher
        // 并使用dep.depend方法，depend调用watcher.addDep去重多个属性在同一个watcher
        // Dep.target = this;
        pushStack(this);
        let value = this.getter.call(this.vm); // 将插值表达式中的属性从data中取出（计算属性也会从实例上取值），触发get属性描述符
        // Dep.target = null; // 清空
        popStack();
        return value;
    }
    depend() {
        let i = this.deps.length;
        while(i--) {
            // dep.depend收集渲染watcher（Dep.target）
            this.deps[i].depend(); // 计算属性watcher也收集渲染watcher
        }
    }
    update() {
        if (this.lazy) {
            this.dirty = true; // 如果计算属性依赖值变化了，重置脏值
        } else {
            // 把所有需要update的watcher都暂存起来
            queryWatcher(this);
        }
    }
    run() {
        let oldValue = this.value;
        let newValue = this.get();
        this.get();
        if (this.user) {
            this.cb.call(this.vm, newValue, oldValue);
        }
    }
}
// 给每个属性都增加一个dep，目的是收集watcher（需要去重）

let queue = [];
let has = {};
let pending = false; // 防抖

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0);
    queue = []; // 再刷新的过程中，可能还有新的watcher放入queue中，继续收集
    has = {};
    pending = false;
    flushQueue.forEach(q => q.run());
}

function queryWatcher(watcher) {
    // 对watcher进行去重
    const id = watcher.id;
    if (!has[id]) {
        queue.push(watcher); // 去重watcher
        has[id] = true;
        // 不管我们的update执行多少次，但是最终所有同步操作执行后异步更新dom（事件循环）
        if (!pending) {
            // setTimeout(flushSchedulerQueue, 0);
            // 通过异步任务，当所有的相应数据变化后，最后只进行一次dom更新
            nextTick(flushSchedulerQueue, 0);
            pending = true;
        }
    }
}

let callbacks = [];
let waiting = false;
function flushCallbacks() {
    let cbs = callbacks.slice(0); // 保存需要执行方法
    waiting = false;
    callbacks = []; // 在执行时可以继续收集方法
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