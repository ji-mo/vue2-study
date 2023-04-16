import babel from 'rollup-plugin-babel';

export default {
    input: './src/index.js', // 打包入口
    output: {
        file: './dist/vue.js', // 打包出口
        name: 'Vue', // 会挂在全局实例，global.Vue
        format: 'umd', // 兼容commonjs、adm
        sourcemap: true,  // 调试源代码
    },
    plugins: [
        babel({
            exclude: 'node_modules/**' // 排除node_modules所有模块
        })
    ]
}