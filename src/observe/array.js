const oldArrayProto = Array.prototype; // 保存Array上已有的原型方法
export const newArrayProto = Object.create(oldArrayProto); // 通过已有的原型方法，创建一个对象

const methods = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice']; // 记录会改变数组的原型方法名称

methods.forEach(method => {
    // 重写对象中的方法
    newArrayProto[method] = function (...args) {
        // 调用原来的方法对数组进行操作（注意this指向）
        const result = oldArrayProto[method].call(this, ...args);
        let inserted = null;
        let ob = this.__ob__; // 获取调用者身上保存的Observe实例
        console.log('newArrayProto', method, ob);
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
            ob.observeArray(inserted);
        }
        // 对改变数组的值进行劫持
        return result;
    }
})

