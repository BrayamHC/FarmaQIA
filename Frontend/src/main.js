import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import Chart from 'primevue/chart';

import App from './App.vue';
import router from './router';

import 'primeicons/primeicons.css';
import './assets/main.css';
import 'chart.js/auto';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  ripple: true,
  zIndex: {
    modal: 1100,
    overlay: 1000,
    menu: 1000,
    tooltip: 1200,
  },
});

app.directive('tooltip', Tooltip);
app.component('Chart', Chart);

app.mount('#app');
