import Vue from 'vue'
import vueCustomElement from 'vue-custom-element'
// import dataFilter from './components/datafilter'
// import dataConnector from './components/dataconnector'
import vizwiz from './components/vizwiz'
import Vuex from 'vuex'

// Configure Vue to ignore the element name when defined outside of Vue.
Vue.config.ignoredElements = [
  'data-filter',
  'data-connector',
  'viz-wiz',
]

// Enable the plugin
Vue.use(vueCustomElement)
Vue.use(Vuex)

// Register your component
// Vue.customElement('data-filter', dataFilter, {
//   // Additional Options: https://github.com/karol-f/vue-custom-element#options
// })
// Vue.customElement('data-connector', dataConnector, {
//   // Additional Options: https://github.com/karol-f/vue-custom-element#options
// })
Vue.customElement('viz-wiz', vizwiz, {
  // Additional Options: https://github.com/karol-f/vue-custom-element#options
})
