import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    iconChoices: {
      'bathroom': 'https://patterns.boston.gov/images/global/icons/mapping/bathroom.svg',
      'default': 'https://patterns.boston.gov/images/global/icons/mapping/waypoint-charles-blue.svg',
      'food basket': 'https://patterns.boston.gov/images/global/icons/mapping/food-basket.svg',
      'food truck': 'https://patterns.boston.gov/images/global/icons/mapping/food-truck.svg',
      'default-red': 'https://patterns.boston.gov/images/global/icons/mapping/waypoint-freedom-red.svg',
      'no parking': 'https://patterns.boston.gov/images/global/icons/mapping/parking-nope.svg',
      'parking': 'https://patterns.boston.gov/images/global/icons/mapping/parking.svg',
    },
    dataSourceTypeChoices: {
      'cob-arcgis': 'CoB ArcGIS'
    },
    polygonStyles: {
      'Charles Blue': {
        uid: 'charles-blue',
        color: '#091F2F',
        hoverColor: '#9CA5AB',
      },
      'default': {
        uid: 'default',
        color: '#0C2639',
        hoverColor: '#FB4D42',
      },
      'Freedom Trail Red': {
        uid: 'freedom-trail-red',
        color: '#FB4D42',
        hoverColor: '#FDB8B3',
      },
      'Optimistic Blue': {
        uid: 'optimistic-blue',
        color: '#288BE4',
        hoverColor: '#A9D1F4',
      },
    },
    polygonStyleChoices: {
      'Default Style': 'default',
    },
    defaultConfig: {
      uid: '',
      title: '',
      description: '',
      dataSources: [],
      maps: [],
    },
  },
  getters: {
    getDefaultConfig: (state) => {
      return Object.assign({}, state.defaultConfig)
    },
    getIconChoices: (state) => {
      return state.iconChoices
    },
    getDataSourceTypeChoices: (state) => {
      return state.dataSourceTypeChoices
    },
    getPolygonStyleChoices: (state) => {
      return state.polygonStyleChoices
    }
  }
})

export default store
