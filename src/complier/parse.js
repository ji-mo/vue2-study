// vue3并没有使用正则匹配
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 他匹配到的分组是一个标签名  <xxx 匹配到的是开始 标签的名字

const startTagClose = /^\s*(\/?)>/;  // 开始标签的结尾  > <br/>

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);  // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;  // 匹配标签中的属性
// 第一个分组就是属性的key value 就是 分组3/分组4/分组五

export function parseHTML(html) {
    const ELEMENT_TYPE = 1;
    const TEXT_TYPE = 3;
    const stack = []; // 记录当前匹配的标签，碰到配对的结束标签则出站
    let currentParent;
    let root;

    // 最终转化成为抽象语法树
    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null,
        }
    }
    function start(tag, attrs) {
        let node = createASTElement(tag, attrs);

        // 进入时没有根标签说明其就是根标签
        if (!root) {
            root = node;
        }
        // 下一个开始标签进入时，已经存在标签了则，则自身为子标签
        if (currentParent) {
            node.parent = currentParent;
            currentParent.children.push(node);
        }
        stack.push(node); // 入栈
        currentParent = node; // currentParent是栈中的最后(后入先出)一个
    }
    function chars(text) {
        text = text.replace(/\s/g, ''); // 如果空格超过2则不删除
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent,
        });
    }
    function end() {
        stack.pop();
        currentParent = stack[stack.length - 1]; // 将栈中的最后(后入先出)一个设为当前父元素
    }
    // 将匹配完的字符串截取掉
    function advance(len) {
        html = html.substring(len);
    }
    // 匹配解析字符串的开始标签
    function parseStartTag() {
        const start = html.match(startTagOpen);
        if (start) {
            const match = {
                tagName: start[1],
                attrs: [],
            };
            advance(start[0].length);
            // 继续匹配开始标签名之后的内容
            let attr, end;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length);
                // attribute是匹配到的 0：属性名和值，1：属性名，2：=，3\4\5：属性值
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] || true })
            }
            // 匹配到开始标签的结束标签
            if (end) {
                advance(end[0].length);
            }
            // console.log(match, html);
            return match;
        }
        return false;
    }
    while(html) {
         // 如果index = 0，为开始标签或者结束标签
         // 如果index > 0，两标签之间的文本内容
        let textEnd = html.indexOf('<');
        if (textEnd === 0) {
            // 解析开始标签和属性
            const startTagMatch = parseStartTag();
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;
            }
            // 解析结束标签
            const endTagMatch = html.match(endTag);
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                end(endTagMatch[1]);
                continue;
            }
        }
        if (textEnd > 0) {
            // 解析标签之间（开始-文本-结束）(结束-换行空格-开始)文本内容
            let text = html.substring(0, textEnd);
            if (text) {
                chars(text);
                advance(text.length);
            }
        }
    }
    return root;
}