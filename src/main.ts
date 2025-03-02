
import { createApp } from 'vue';
import Vue3TouchEvents, { type Vue3TouchEventsOptions } from "vue3-touch-events";
import App from './App.vue'
import './styles/index.scss'

const app = createApp(App);

app.use<Vue3TouchEventsOptions>(Vue3TouchEvents, {
    disableClick: false
});

app.mount('#app');
