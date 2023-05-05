let id = 0;

class Dep {
    constructor() {
        this.id = id ++;
        this.subs = [];
    }
    depend() {
        // 不希望重复记录同一个watcher，所以wathcer记录dep
        // this.subs.push(Dep.target);
        Dep.target.addDep(this); // 先让watcher记录dep，通过watcher通过id去重

        // 一个属性可以在多个组件中使用，所以dep -> 多个watcher
        // 一个组件使用多个属性，所以watcher -> 多个dep
    }
    addSub(watcher) {
        this.subs.push(watcher);
    }
    notify() {
        this.subs.forEach(watcher => watcher.update()); // 一个属性变化，则所有依赖该属性的组件都需要更新
    }
}
Dep.target = null;

let stack = [];
export function pushStack(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
}
export function popStack() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
}

export default Dep;