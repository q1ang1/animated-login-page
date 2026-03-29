import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:uno.css'
import './styles/index.css'

/**
 * 启动 Vue 应用并挂载到 `#app`。
 * 当前入口只负责样式注入和根组件挂载，不包含额外插件。
 */
createApp(App).mount('#app')
