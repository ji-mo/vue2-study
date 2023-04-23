import { parseHTML } from './parse';

const ELEMENT_TYPE = 1;
const TEXT_TYPE = 3;
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ asdsadsa }}  匹配到的内容就是我们表达式的变量

function genProps(attrs) {
    let str = '';
    for (let i = 0; i < attrs.length; i ++) {
        let attr = attrs[i]; // {name, value}形式
        if (attr.name === 'style') { // 样式需要进行特殊处理
            // style="width: 160px;height: 48px;"
            let obj = {};
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':');
                obj[key] = value;
            });
            attr.value = obj;
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`; // 出去最后一个逗号
}

function gen(node) {
    if (node.type === ELEMENT_TYPE) {
        return codegen(node);
    } else {
        let text = node.text;
        if (!defaultTagRE.test(text)) {
            // 如果是纯文本，则直接返回纯文本
            return `_v(${JSON.stringify(text)})`;
        } else {
            // 如果匹配到插值表达式，则进行处理
            // _v(_s(name) + 'text' + _s(age))
            let tokens = [];
            let match;
            defaultTagRE.lastIndex = 0; // 重置lastIndex
            let lastIndex = 0;
            while (match = defaultTagRE.exec(text)) {
                // console.log('match', match, defaultTagRE.lastIndex);
                let index = match.index;
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)));
                }
                tokens.push(`_s(${match[1].trim()})`);
                lastIndex = index + match[0].length;
            }
            if (text.length > lastIndex) {
                tokens.push(JSON.stringify(text.slice(lastIndex)));
            }
            return `_v(${tokens.join('+')})`
        }
    }
}
function genChildren(children) {
    return children.map(child => gen(child)).join(',');
}

function codegen(ast) {
    let children = genChildren(ast.children);
    // _c("div", {id: "app"}, ("p", null, ...))
    let code = (`_c("${ast.tag}",${
        ast.attrs.length > 0 ? genProps(ast.attrs) : "null"
    }${ast.children.length > 0 ? `,${children}` : ""})`);
    return code;
}

// 对模板进行编译
export function compileToFunction(template) {
    // 1.将template通过正则匹配，然后解析成语法树
    let ast = parseHTML(template);
    // 2.生成render方法（render方法执行后返回的结果就是虚拟DOM）
    let code = codegen(ast);
    console.log('code', code);
}