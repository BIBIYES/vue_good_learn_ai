/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const component: DefineComponent<{}, {}, any>
    export default component
}
// 类型声明文件
declare module 'vue3-markdown' {
    import { DefineComponent } from 'vue';
    const VMarkdownEditor: DefineComponent<{}, {}, any>;
    export { VMarkdownEditor };
}
// 类型声明文件
declare module 'vue-json-excel3' {
    import { DefineComponent } from 'vue';
    const JsonExcel: DefineComponent<{}, {}, any>;
    export default JsonExcel;
}
