import Vue from 'vue'
import Vuex from 'vuex'
import nanoid from 'nanoid'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: true,
  modules: {
    /**
     * `$_datasources` is registered when the editiable list module is instantiated.
     * That module uses the `$_datasources` namespace to manage those objects.
     *
     * Since there are references to it in methods below, and not a reference to it
     * here, that's where it comes from.
     */
  },
  state: {
    /**
     * The vizualization ID to include in event triggering
     */
    uid: nanoid(),
    /**
     * The title of the visualization
     */
    title: '',
    /**
     * The description of the visualization
     */
    description: '',
    /**
     * An map of maps, keyed by the uid, to use in the visualization
     */
    maps: {}, // map by uid
    /**
     * UID of each of the maps, for ordering
     */
    mapList: [],
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
    allMaps: state => {
      return state.mapList.map(mapId => state.maps[mapId])
    },
    getMapById: (state) => (uid) => {
      return state.maps[uid]
    },
    getPolygonStyleById: (state) => (uid) => {
      return state.polygonStyles[uid]
    },
    getDefaultConfig: (state) => {
      return Object.assign({}, state.defaultConfig)
    },
    getConfig: (state, getters) => {
      let config = {
        version: '1.0',
        uid: state.uid,
        title: state.title,
        description: state.description,
        dataSources: [],
        maps: [],
      }
      const dataSources = getters['$_datasources/allIds']
      dataSources.forEach(uid => {
        config.dataSources.push(getters.getDataSourceConfig(uid))
      })
      state.mapList.forEach(uid => {
        config.maps.push(getters.getMapConfig(uid))
      })
      return config
    },
    getDataSourceConfig: (state, getters) => (uid) => {
      const datasource = getters['$_datasources/getItem'](uid)
      let dataSourceType = datasource.dataSourceType
      if (dataSourceType === 'cob-arcgis') {
        dataSourceType = 'arcgis'
      }
      return {
        uid: datasource.uid,
        icons: {
          markerUrl: datasource.icon,
          cluster: datasource.clusterPoints,
        },
        polygons: {
          style: state.polygonStyles[datasource.polygonStyle].uid,
          color: state.polygonStyles[datasource.polygonStyle].color,
          hoverColor: state.polygonStyles[datasource.polygonStyle].hoverColor,
        },
        type: dataSourceType,
        popupHtmlTemplate: datasource.popover,
        data: Object.assign({}, datasource.attributes),
        legend: datasource.legendLabel,
      }
    },
    getMapConfig: (state) => (uid) => {
      const map = state.maps[uid]
      return {
        uid: map.uid,
        latitude: 42.32,
        longitude: -71.1284,
        zoom: 12,
        showZoomControl: map.showZoomControl,
        showLegend: map.showLegend,
        findUserLocation: map.findUserLocation,
        searchForAddress: map.searchForAddress,
        zoomToAddress: map.zoomToAddress,
        placeholderText: map.placeholderText,
        addressSearchPopupDataSourceUid: map.addressSearchPopupDataSourceUid,
      }
    },
  },
  mutations: {
    SET_UID: (state, payload) => {
      if (payload) {
        state.uid = payload
      } else {
        state.uid = nanoid()
      }
    },
    SET_TITLE: (state, payload) => {
      state.title = payload || ''
    },
    SET_DESCRIPTION: (state, payload) => {
      state.description = payload || ''
    },
    DELETE_DATASOURCE: (state, payload) => {
      const newDataSources = Object.assign({}, state.dataSources)
      const index = state.dataSourceList.findIndex(dataSource => dataSource === payload)
      if (index > -1) {
        state.dataSourceList.splice(index, 1)
      }
      delete newDataSources[payload]
      state.dataSources = newDataSources
    },
    UPDATE_DATASOURCE: (state, payload) => {
      if (!payload.hasOwnProperty('uid')) {
        payload.uid = nanoid()
      }
      state.dataSources = {...state.dataSources, [payload.uid]: payload}
      if (state.dataSourceList.indexOf(payload.uid) === -1) {
        state.dataSourceList.push(payload.uid)
      }
    },
    UPDATE_MAP: (state, payload) => {
      if (!payload.hasOwnProperty('uid')) {
        payload.uid = nanoid()
      }
      state.maps = {...state.maps, [payload.uid]: payload}
      if (state.mapList.indexOf(payload.uid) === -1) {
        state.mapList.push(payload.uid)
      }
    },
  },
  actions: {
    setUid: ({commit}, payload) => {
      commit('SET_UID', payload)
    },
    setTitle: ({commit}, payload) => {
      commit('SET_TITLE', payload)
    },
    setDescription: ({commit}, payload) => {
      commit('SET_DESCRIPTION', payload)
    },
    deleteDataSource: ({commit}, payload) => {
      commit('DELETE_DATASOURCE', payload)
    },
    updateDataSource: ({commit}, payload) => {
      commit('UPDATE_DATASOURCE', payload)
    },
    updateMap: ({commit}, payload) => {
      commit('UPDATE_MAP', payload)
    }
  }
})
export default store
