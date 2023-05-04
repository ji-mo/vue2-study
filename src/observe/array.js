const oldArrayProto = Array.prototype; // 保存Array上已有的原型方法
export const newArrayProto = Object.create(oldArrayProto); // 通过已有的原型方法，创建一个对象

const methods = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice']; // 记录会改变数组的原型方法名称

methods.forEach(method => {
    // 重写对象中的方法
    newArrayProto[method] = function (...args) {
        // 调用原来的方法对数组进行操作（注意this指向）
        const result = oldArrayProto[method].call(this, ...args);
        let inserted = null; // 保存数组新增的元素
        let ob = this.__ob__; // 获取调用者身上保存的Observe实例，方式后续使用walk、observeArray方法
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice': 
                inserted = args.slice(2);
                break;
            default: 
                break;
        }
        if (inserted) {
            ob.observeArray(inserted); // 遍历数组，对引用类型子元素进行监听
        }
        // 对改变数组的值进行劫持
        ob.dep.notify(); // 通知数组的watcher进行更新
        return result;
    }
});

