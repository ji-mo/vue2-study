// _c('div', {}, ...children)
export function createElementVNode(vm, tag, data, ...children) {
    if (data == null) {
        data = {};
    }
    // key是元素属性绑定的标识，可能存在
    let key = data.key;
    // key用于识别元素，dom上并不需要进行绑定该属性
    if (key) {
        delete data.key;
    }
    return vnode(vm, tag, key, data, children);
}
// _v(_s(name) + 'text' + _s(age))
export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
}

// 结构和ast一样吗？ast做的是语法层面的转化，描述语法本身
// 虚拟dom是描述dom元素，可以增加自定义属性
function vnode(vm, tag, key, data, children, text) {
    return {
        vm,
        tag,
        key,
        data, // 属性
        children,
        text
    };
}

export function isSameVnode(vnode1, vnode2) {
    // 比较两个虚拟dom的标签名和key
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}