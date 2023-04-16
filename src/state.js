import { observe } from "./observe/index";

export function initState(vm) {
    const opts = vm.$options;
    if (opts.data) {
        initData(vm);
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
    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data; // 将data挂载到实例上，方面每次使用（vm.$options.data -> vm._data）
    // 拿到data后对其进行数据劫持（监听data中数据的变化）
    observe(data);
    // 将vm._data代理到vm身上
    for (let key in data) {
        proxy(vm, '_data', key);
    }
}