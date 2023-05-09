const strats = {};
const LIFECYCLE = ['beforeCreate', 'created'];
LIFECYCLE.forEach(hook => {
    strats[hook] = function (p, c) {
        if (c) {
            if (p) {
                return p.concat(c);
            } else {
                return [c];
            }
        } else {
            return p;
        }
    };
});

export function mergeOptions(parent, child) {
    const options = {};
    for (let key in parent) {
        mergeField(key);
    }
    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key);
        }
    }
    function mergeField(key) {
        // 用策略模式，减少if else
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key]);
        } else {
            // 不在策略中，以儿子为准
            options[key] = child[key] || parent[key]; // 优先儿子，最后用父级
        }
    }
    return options;
}