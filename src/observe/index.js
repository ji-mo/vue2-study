class Observe {
    constructor(data) {
        this.walk(data);
    }
    walk(data) {
        // 遍历data的所有属性，依次劫持
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]));
    }
}

export function defineReactive(target, key, value) { // 形成闭包
    observe(value); // 若value也为对象，增继续向下监听
    // 属性劫持，对data的每个属性"重新定义"，影响了性能
    Object.defineProperty(target, key, {
        get() {
            return value;
        },
        set(newVal) {
            if (value === newVal) return;
            value = newVal;
        }
    })
}

export function observe(data) {
    // 只劫持对象
    if (typeof data !== 'object') return;
    return new Observe(data);
}