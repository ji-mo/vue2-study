import { newArrayProto } from './array';
import Dep from './dep';

class Observer {
    constructor(data) {

        // 给每个对象都增加依赖收集（对象、数组增加新的属性元素都能都收集到）
        this.dep = new Dep(); // 让整个对象被收集到

        // 在data属性上保存实例，以便后续随时可以调用walk/observeArray等方法
        Object.defineProperty(data, '__ob__', { 
            value: this,
            enumerable: false, // 不可被枚举（遍历），方死循环
        });
        if (Array.isArray(data)) {
            // 劫持数组每个属性极其耗费性能，所以直接修改会对数组造成改动的方法
            data.__proto__ = newArrayProto; // 改变data中数组变量的原型（影响性能）
            this.observeArray(data); // 
        }
        this.walk(data);
    }
    walk(data) {
        // 遍历data的所有属性，依次劫持
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]));
    }
    observeArray(data) {
        // 劫持数组的属性
        data.forEach(item => observe(item));
    }
}

// 深层次嵌套产生递归，递归多了性能差，不存在的属性监控不到，存在的属性要重写方法
function dependArray(value) {
    for(let i = 0; i < value.length; i ++) {
        let current = value[i];
        current.__ob__ && current.__ob__.dep.depend();
        if (Array.isArray(current)) {
            dependArray(current);
        }
    }
}

export function defineReactive(target, key, value) { // 与Object.defineProperty形成闭包
    let childOb = observe(value); // 若value也为对象，增继续向下监听
    let dep = new Dep(); // 闭包到时dep一直被get和set引用
    // 属性劫持，对data的每个属性"重新定义"，影响了性能
    Object.defineProperty(target, key, {
        get() {
            if (Dep.target) {
                dep.depend(); // watcher获取所需属性，让收集器记住当前属性的watcher
                if (childOb) {
                    childOb.dep.depend(); // 不止对象的属性，数组、对象本身也依赖收集
                    if (Array.isArray(value)) {
                        dependArray(value);
                    }
                }
            }
            return value;
        },
        set(newVal) {
            if (value === newVal) return;
            observe(newVal); // 如果设置新值为对象，则需要继续劫持
            value = newVal;
            dep.notify(); // 通知更新
        }
    })
}

export function observe(data) {
    // 只劫持对象，多层对象深度劫持时的出口
    if (typeof data !== 'object' || data == null) return;
    if(data.__ob__ instanceof Observer){ // 说明这个对象被代理过了
        return data.__ob__;
    }
    return new Observer(data);
}