import Dep from "./observe/dep";
import { observe } from "./observe/index";
import Watcher from "./observe/watcher";

export function initState(vm) {
    const opts = vm.$options;
    if (opts.data) {
        initData(vm);
    }
    if (opts.computed) {
        initComputed(vm);
    }
    if (opts.watch) {
        initWatch(vm);
    }
}

function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            // 取vm.name => 访问vm._data.name
            return vm[target][key];
        },
        set(newVal) {
            // 设置vm.name => 访问vm._data.name
            vm[target][key] = newVal;
        }
    })
}

// 初始化data
function initData(vm) {
    let data = vm.$options.data; // 赋值后如果是方法，直接调用this会指向window
    data = typeof data === 'function' ? data.call(vm) : data; // 执行方法data，指向Vue实例
    vm._data = data; // 将data挂载到实例上，方面每次使用（vm.$options.data -> vm._data）
    // 拿到data后对其进行数据劫持（监听data中数据的变化）
    observe(data);
    // 将vm._data代理到vm身上
    for (let key in data) {
        proxy(vm, '_data', key);
    }
}
// 计算属性
function initComputed(vm) {
    const computed = vm.$options.computed;
    const watchers = vm._computedWatchers = {};
    for (let key in computed) {
        let userDef = computed[key];

        // 我们需要监控计算属性 get 变化
        let fn = typeof userDef === 'function' ? userDef : userDef.get;

        // 传入lazy避免初始化Watcher立刻执行fn，并将watcher与当前计算属性对应起来
        watchers[key] = new Watcher(vm, fn, {lazy: true});

        // 劫持计算属性，等触发（异步，所以此时计算属性已经和计算wathcer绑定）_update(_render)触发计算属性的get
        defineComputed(vm, key, userDef);
    }
}
function defineComputed(target, key, userDef) {
    const setter = userDef.set || (() => {});
    // 将计算属性代理到实例上
    Object.defineProperty(target, key, {
        // defineProperty中this指向代理对象
        get: createComputedGetter(key),
        set: setter,
    });
}
// 所以实际上不是计算属性收集依赖，而是让依赖收集计算wather和渲染watcher，然后通过get触发更新
function createComputedGetter(key) {
    // 需要检测当前getter是否需要执行（依赖不变不用重新执行）
    return function() {
        const watcher = this._computedWatchers[key]; // 拿到计算属性对应的watcher
        if (watcher.dirty) { // 避免多次执行
            // 执行watcher.get方法，通过触发依赖的属性get记录当前的计算属性watcher，保存计算属性的值value
            // 计算属性取值依赖属性时，依赖属性的dep记录了当前计算属性watcher[0]
            watcher.evaluate();
        }
        if (Dep.target) {
            // 计算属性出栈后 还有渲染watcher，让依赖属性的dep将渲染watcher也记录
            // 如果依赖属性不变化，直接从当前计算属性的watcher中取值
            // 依赖属性变化，先让计算watcher重置dirty，再触发渲染wahter重新取值，重新计算新的计算属性
            watcher.depend();
        }
        return watcher.value;
    }
}
// 监听属性
function initWatch(vm) {
    let watch = vm.$options.watch;
    for (let key in watch) {
        const handler = watch[key]; // 字符串、数组、函数、对象
        if (Array.isArray(handler)) {
            for(let i = 0;i < handler.length; i++) {
                createWatcher(vm, key, handler[i]);
            }
        } else {
            createWatcher(vm, key, handler);
        }
    }
}
function createWatcher(vm, key, handler) {
    // handler字符、函数、对象(暂不考虑)
    if (typeof handler === 'string') {
        handler = vm[handler]; // 取出当前监听的属性值
    }
    return vm.$watch(key, handler);
}
