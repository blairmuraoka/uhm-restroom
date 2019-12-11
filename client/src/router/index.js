import Vue from 'vue'
import VueRouter from 'vue-router'
import MapComponent from '@/components/MapComponent'
import InfoPage from '@/components/InfoPage'

Vue.use(VueRouter)

export default new VueRouter({
    routes: [
        { path: '/', name: 'MapComponent', component: MapComponent },
        { path: '/restroom/:id', name: 'InfoPage', component: InfoPage }
    ]
})