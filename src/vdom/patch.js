import { isSameVnode } from ".";

export function createElm(vnode) {
    let { tag, data, children, text } = vnode;
    if (typeof tag === 'string') {
        // 创建标签
        vnode.el = document.createElement(tag);
        // 设置属性
        patchProps(vnode.el, {}, data);
        children.forEach(child => {
            vnode.el.appendChild(createElm(child));
        });
    } else {
        // 创建文本
        vnode.el = document.createTextNode(text);
    }
    return vnode.el;
}

export function patchProps(el, oldProps = {}, props = {}) {
    // 比较新老dom的属性
    let oldStyles = oldProps.style || {};
    let newStyles = props.style || {};
    for (let key in oldStyles) {
        // 新dom没有的style属性删除
        if (!newStyles[key]) {
            el.style[key] = '';
        }
    }
    for (let key in oldProps) {
        // 新dom没有的属性删除
        if (!props[key]) {
            el.removeAttribute(key);
        }
    }

    for (let key in props) {
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName];
            }
        } else {
            el.setAttribute(key, props[key]);
        }
    }
}

export function patch(oldVNode, vnode) {
    const isRealElement = oldVNode.nodeType; // 是否是真实节点
    if (isRealElement) {
        const elm = oldVNode;
        const parentElm = elm.parentNode; // 获取节点父元素
        let newElm = createElm(vnode);
        parentElm.insertBefore(newElm, elm.nextSibling); // 插入生成的节点
        parentElm.removeChild(elm); // 删除老节点
        return newElm;
    }  else {
        // 1.两个节点不是同一个节点  直接删除老的换上新的  （没有比对了）
        // 2.两个节点是同一个节点 (判断节点的tag和 节点的key)  比较两个节点的属性是否有差异 （复用老的节点，将差异的属性更新）
        // 3.节点比较完毕后就需要比较两人的儿子
        return patchVnode(oldNode, vnode);
    }
    function patchVnode(oldVNode, vnode) {
        if (!isSameVnode(oldVNode, vnode)) { // 不是一个节点就直接用新节点替换
            let el = createElm(vnode);
            // 找到当前挂载的dom父节点，用新属性生成的节点进行替换
            oldVNode.el.parentNode.replaceChild(el, oldVNode.el);
            return el;
        }
        // 节点一样，复用老的节点
        // 文本的情况 文本我们期望比较一下文本的内容
        let el = vnode.el = oldVNode.el;
        if (!oldVNode.tag) {
            if (oldVNode.text !== vnode.text) {
                el.textContent = vnode.text; // 新文本覆盖老的文本
            }
        }
        // 比对标签的属性是否变化
        patchProps(el, oldVNode.data, vnode.data);

        // 比较子节点
        let oldChildren = oldVNode.children || [];
        let newChildren = vnode.children || [];

        if (oldChildren.length > 0 && newChildren.length > 0) {
            // 需要比较子节点
            updateChildren(el, oldChildren, newChildren);
        } else if (oldChildren.length > 0) {
            // 老节点有子节点，新节点没有子节点，直接删除
            el.innerHTML = '';
        } else if (newChildren.length > 0) {
            // 老节点没有子节点，新节点有子节点，遍历插入
            mountChildren(el, newChildren);
        }
        return el;
    }
    function mountChildren(el, newChildren) {
        for (let i = 0; i < newChildren.length; i++) {
            let child = newChildren[i];
            el.appendChild(createElm(child));
        }
    }
    function updateChildren(el, oldChildren, newChildren) {
        // 我们操作列表通常有push、shift、unshift、pop、reverse、sort等方法
        // vue2中使用双指针来比较两个节点
        let oldStartIndex = 0;
        let newStartIndex = 0;
        let oldEndIndex = oldChildren.length - 1;
        let newEndIndex = newChildren.length - 1;
        let oldStartVnode = oldChildren[0];
        let newStartVnode = newChildren[0];
        let oldEndVnode = oldChildren[oldEndIndex];
        let newEndVnode = newChildren[newEndIndex];

        function makeIndexByKey(children) {
            let map = {};
            children.forEach((child, index) => {
                map[child.key] = index;
            });
            return map;
        }
        let map = makeIndexByKey(oldChildren);

        while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
            // 在给动态列表增加key时，避免使用索引作为key值（old:[a,b,c],new[d,a,b,c].由于a和d索引一致，从尾尾比对变成首首比对）
            // 有一方头指针大于尾指针就停止循环
            if (!oldStartVnode) {
                oldStartVnode = oldChildren[++oldStartIndex];
            } else if (!oldEndVnode) {
                oldEndVnode = oldChildren[--oldEndIndex];
            } else if (isSameVnode(oldStartVnode, newStartVnode)) { // old a,b,c    new a,b，开头相同，末尾有增减 
                patchVnode(oldStartVnode, newStartVnode); // 如果相同节点，则递归比较子节点
                oldStartVnode = oldChildren[++oldStartIndex];
                newStartVnode = newChildren[++newStartIndex];
            } else if (isSameVnode(oldEndVnode, newEndVnode)) { // old a,b,c    new d,a,b,c 末尾相同，开头有增减 
                patchVnode(oldEndVnode, newEndVnode); // 如果相同节点，则递归比较子节点
                oldEndVnode = oldChildren[--oldEndIndex];
                newEndVnode = newChildren[--newEndIndex];
            } else if (isSameVnode(oldEndVnode, newStartVnode)) { // old a,b,c,d     new  d,a,b,c 尾部移动到前面
                // 剩下的交叉（旧尾新首比对）
                patchVnode(oldEndVnode, newStartVnode);
                el.insertBefore(oldEndVnode.el, oldStartVnode.el); // 将老节点的尾部移动到前面
                oldEndVnode = oldChildren[--oldEndIndex];
                newStartVnode = newChildren[++newStartIndex];
            } else if (isSameVnode(oldStartVnode, newEndVnode)) { // old a,b,c,d     new  b,c,d,a 尾部移动到前面
                // 剩下的交叉（旧首新尾比对）
                patchVnode(oldStartVnode, newEndVnode);
                el.insertBefore(oldStartVnode.el, newEndVnode.el.nextSibling); // 将老节点的前面移动到尾部
                oldStartVnode = oldChildren[++oldStartIndex];
                newEndVnode = newChildren[--newEndIndex];
            } else {
                // 乱序比对
                // 根据老的子节点做一个映射表map，用新的去找，找到就移动，找不到就将新的添加，多得最后删除
                let moveIndex = map[newStartVnode.key]; // 如果拿到了对应的索引则说明要移动
                if (moveIndex !== undefined) {
                    let moveVnode = oldChildren[moveIndex];
                    el.insertBefore(moveVnode.el, oldStartVnode.el);
                    oldChildren[moveIndex] = undefined; // 表示这个节点已经移走
                    patchVnode(moveVnode, newStartVnode); // 移动后别忘了继续比较子节点
                } else {
                    // 新节点在映射中找不到，直接插入新的节点
                    el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
                }
                // 最后保存新的头节点
                newStartVnode = newChildren[++newStartIndex];
            }
        }

        if (newStartIndex <= newEndIndex) { // 新节点的子节点更多，将多余节点插入
            for (let i = newStartIndex; i <= newEndIndex; i++) {
                let childEl = createElm(newChildren[i]);
                // 这里可能是向前追加，可能是向后追加（判断后面还有没有节点知悉是向头还是向尾插入）
                let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null;
                el.insertBefore(childEl, anchor); // anchor为null时直接从尾部插入appendChild
            }
        }
        if (oldStartIndex <= oldEndIndex) { // 旧节点的子节点更多，删除多余的节点
            for (let i = oldStartIndex; i <= oldEndIndex; i++) {
                if (oldChildren[i]) {
                    let childEl = oldChildren[i].el;
                    el.removeChild(childEl);
                }
            }
        }
    }
}