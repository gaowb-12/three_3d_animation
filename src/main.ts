import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import piniaStore from './store/pinia';
import router from './router';
import ElementPlus from 'element-plus'

const app = createApp(App);
app.use(piniaStore)
app.use(router)
app.use(ElementPlus)

app.mount('#app')
