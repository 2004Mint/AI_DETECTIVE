import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { revealDirective } from './directives/reveal'
import './assets/main.css'

const app = createApp(App)

// 全站入场动效：v-reveal（GSAP 懒加载，见 src/directives/reveal.ts）
app.directive('reveal', revealDirective)

app.use(createPinia())
app.use(router)

app.mount('#app')