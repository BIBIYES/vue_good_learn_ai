import './assets/base.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import piniaPersistedState from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import JsonExcel from "vue-json-excel3";

const app = createApp(App)
app.component("downloadExcel", JsonExcel)

app.use(ElementPlus, {
  locale: zhCn
})
const pinia = createPinia()
pinia.use(piniaPersistedState)
app.use(pinia)
app.use(router)
app.mount('#app')
