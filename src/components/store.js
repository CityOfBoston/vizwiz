import nanoid from 'nanoid'

const store = {
  namespaced: true,
  strict: true,
  state () {
    return {
      /**
       * The namespace used for this store
       */
      namespace: '',
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
    }
  },
  getters: {
    getTitle: (state) => {
      return state.title
    },
    getDescription: (state) => {
      return state.description
    },
    getNamespace: (state) => {
      return state.namespace
    },
    allMaps: (state) => {
      return state.mapList.map(mapId => state.maps[mapId])
    },
    getMapById: (state) => (uid) => {
      return state.maps[uid]
    },
    getPolygonStyleById: (state) => (uid) => {
      return state.polygonStyles[uid]
    },
    getConfig: (state, getters, rootState, rootGetters) => {
      let config = {
        version: '1.0',
        uid: state.uid,
        title: state.title,
        description: state.description,
        dataSources: [],
        maps: [],
      }
      const dataSources = rootGetters[`$${getters.getNamespace}_datasources/allIds`]
      dataSources.forEach(uid => {
        config.dataSources.push(getters.getDataSourceConfig(uid))
      })
      state.mapList.forEach(uid => {
        config.maps.push(getters.getMapConfig(uid))
      })
      return config
    },
    getDataSourceConfig: (state, getters, rootState, rootGetters) => (uid) => {
      const datasource = rootGetters[`$${getters.getNamespace}_datasources/getItem`](uid)
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
          style: rootState.polygonStyles[datasource.polygonStyle].uid,
          color: rootState.polygonStyles[datasource.polygonStyle].color,
          hoverColor: rootState.polygonStyles[datasource.polygonStyle].hoverColor,
        },
        type: dataSourceType,
        popupHtmlTemplate: datasource.popover,
        data: Object.assign({}, datasource.attributes),
        legend: datasource.legendLabel,
      }
    },
    getMapConfig: (state) => (uid) => {
      const map = state.maps[uid]
      let mapConfig = {
        uid: map.uid,
        title: '',
        instructionsHtml: '',
        latitude: 42.32,
        longitude: -71.1284,
        zoom: 12,
        showZoomControl: map.showZoomControl,
        showLegend: map.showLegend,
        showUserLocation: map.findUserLocation,
        addressSearch: null,
      }
      if (map.searchForAddress) {
        mapConfig.addressSearch = {
          title: '',
          placeholder: map.placeholderText,
          zoomToResult: map.zoomToAddress,
          autoPopupDataSourceUid: map.addressSearchPopupDataSourceUid,
        }
      }
      return mapConfig
    },
  },
  mutations: {
    SET_NAMESPACE: (state, payload) => {
      if (payload) {
        state.namespace = payload
      } else {
        state.namespace = nanoid()
      }
    },
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
    // DELETE_DATASOURCE: (state, payload) => {
    //   const newDataSources = Object.assign({}, state.dataSources)
    //   const index = state.dataSourceList.findIndex(dataSource => dataSource === payload)
    //   if (index > -1) {
    //     state.dataSourceList.splice(index, 1)
    //   }
    //   delete newDataSources[payload]
    //   state.dataSources = newDataSources
    // },
    // UPDATE_DATASOURCE: (state, payload) => {
    //   if (!payload.hasOwnProperty('uid')) {
    //     payload.uid = nanoid()
    //   }
    //   state.dataSources = {...state.dataSources, [payload.uid]: payload}
    //   if (state.dataSourceList.indexOf(payload.uid) === -1) {
    //     state.dataSourceList.push(payload.uid)
    //   }
    // },
    UPDATE_MAP: (state, payload) => {
      if (!payload.hasOwnProperty('uid')) {
        payload.uid = nanoid()
      }
      state.maps = {...state.maps, [payload.uid]: payload}
      if (state.mapList.indexOf(payload.uid) === -1) {
        state.mapList.push(payload.uid)
      }
    },
    DELETE_MAP: (state, payload) => {
      const newMaps = Object.assign({}, state.maps)
      const index = state.mapList.findIndex(map => map === payload)
      if (index > -1) {
        state.mapList.splice(index, 1)
      }
      delete newMaps[payload]
      state.maps = newMaps
    },
  },
  actions: {
    setNamespace: ({commit}, payload) => {
      commit('SET_NAMESPACE', payload)
    },
    setUid: ({commit}, payload) => {
      commit('SET_UID', payload)
    },
    setTitle: ({commit}, payload) => {
      commit('SET_TITLE', payload)
    },
    setDescription: ({commit}, payload) => {
      commit('SET_DESCRIPTION', payload)
    },
    // deleteDataSource: ({commit}, payload) => {
    //   commit('DELETE_DATASOURCE', payload)
    // },
    // updateDataSource: ({commit}, payload) => {
    //   commit('UPDATE_DATASOURCE', payload)
    // },
    updateMap: ({commit}, payload) => {
      commit('UPDATE_MAP', payload)
    },
    deleteMap: ({commit}, payload) => {
      commit('DELETE_MAP', payload)
    },
  }
}
export default store
