import Vue from 'vue'
import Vuex from 'vuex'
import nanoid from 'nanoid'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: true,
  state: {
    /**
     * The vizualization ID to include in event triggering
     */
    vizId: nanoid(),
    /**
     * The title of the visualization
     */
    title: '',
    /**
     * The description of the visualization
     */
    description: '',
    /**
     * An map of data sources, keyed by the uid, to use in the visualization
     */
    dataSources: {}, // map by uid
    /**
     * UID of each of the dataSources, for ordering
     */
    dataSourceList: [],
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
      'CoB ArcGIS': 'cob-arcgis'
    },
    polygonStyles: {
      'default': {
        uid: 'default',
        color: '#0C2639',
        hoverColor: '#FB4D42',
      },
    },
    polygonStyleChoices: {
      'Default Style': 'default',
    },
    defaultConfig: {
      vizId: '',
      title: '',
      description: '',
      dataSources: [],
      maps: [],
    },
  },
  getters: {
    allDataSources: state => {
      return state.dataSourceList.map(dataSourceId => state.dataSources[dataSourceId])
    },
    allMaps: state => {
      return state.mapList.map(mapId => state.maps[mapId])
    },
    getDataSourceById: (state) => (uid) => {
      return state.dataSources[uid]
    },
    getMapById: (state) => (uid) => {
      return state.maps[uid]
    },
    getPolygonStyleById: (state) => (uid) => {
      return state.polygonStyles[uid]
    },
    getDefaultConfig: (state) => {
      return state.defaultConfig
    },
    getConfig: (state, getters) => {
      let config = {
        vizId: state.vizId,
        title: state.title,
        description: state.description,
        dataSources: [],
        maps: [],
      }
      state.dataSourceList.forEach(uid => {
        config.dataSources.push(getters.getDataSourceConfig(uid))
      })
      state.mapList.forEach(uid => {
        config.maps.push(getters.getMapConfig(uid))
      })
      return config
    },
    getDataSourceConfig: (state) => (uid) => {
      let datasource = state.dataSources[uid]
      return {
        uid: datasource.uid,
        type: datasource.dataSourceType,
        icon: datasource.icon,
        clusterIcons: datasource.clusterPoints,
        polygonStyle: state.polygonStyles[datasource.polygonStyle],
        popover: datasource.popover,
        attributes: Object.assign({}, datasource.attributes),
        legendLabel: datasource.legendLabel,
      }
    },
    getMapConfig: (state) => (uid) => {
      let map = state.maps[uid]
      return {
        uid: map.uid,
        latitude: 42.347316,
        longitude: -71.065227,
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
    SET_VIZID: (state, payload) => {
      if (payload) {
        state.vizId = payload
      } else {
        state.vizId = nanoid()
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
    setVizId: ({commit}, payload) => {
      commit('SET_VIZID', payload)
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
