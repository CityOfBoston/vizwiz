<template>
  <div>
    <div class="uk-container">
        <div class="uk-panel">
          <h2>Add Visualization</h2>

          <form class="uk-form-stacked" action="#" method="post" v-on:submit.prevent>
            <input type="hidden" name="vizid" v-model="uid">
            <div class="uk-margin">
              <label for="title" class="uk-form-label">Title</label>
              <div class="uk-form-controls">
                <input id="title" type="text" value="" placeholder="" class="uk-input" v-model="title">
              </div>
            </div>
            <div class="uk-margin">
              <label for="decription" class="uk-form-label">Description</label>
              <div class="uk-form-controls">
                <textarea id="description" placeholder="" class="uk-textarea" rows="4" v-model="description">
                </textarea>
              </div>
            </div>
            <editable-list
              :default-items="dataSources()"
              :editor="dsEditor"
              :namespace="dsNamespace"
              title="Data Sources"
            />
            <div class="uk-margin">
              <label class="uk-form-label" for="data-map">
                <input
                  id="data-map"
                  v-model="hasMap"
                  class="uk-checkbox"
                  type="checkbox"
                  @change="onAddMap"
                >
                &ensp;Include Map
                <button
                  class="uk-button uk-button-primary uk-button-small uk-margin-left"
                  v-if="hasMap"
                  @click="onEditMap"
                >Edit</button>
              </label>
            </div> <!-- uk-margin -->

            <div class="uk-panel">
              <div class="uk-float-right">
                <button class="uk-button uk-button-default"
                  @click="onCancel">Cancel</button>
                <button class="uk-button uk-button-primary"
                  @click="onSave">Save</button>
              </div>
            </div>

          </form>
      </div>
    </div>
    <div id='vizwiz-modals'></div>
  </div>
</template>

<script>
import Vue from 'vue'
import EditableList from 'modules/editablelist'
import DataSource from './datasource.vue'
import ModalDialog from './modaldialog.vue'
import MapEditor from './mapeditor.vue'
import globalStore from './globalstore.js'
import store from './store'
import nanoid from 'nanoid'
import { awaitSelector } from '../lib/awaitselector'

require('../../node_modules/uikit/dist/css/uikit.min.css')

export default {
  name: 'viz-wiz',
  components: {
    EditableList
  },
  store: globalStore,
  props: {
    id: {
      type: String,
      default () { return nanoid() },
    },
    /**
     * HTML id of the item that contains a JSON config
     */
    config: {
      type: String,
      default () { return '' }
    },
  },
  created () {
    if (this.id.length) {
      this.namespace = this.id
    } else {
      this.namespace = nanoid()
    }
    this.$store.registerModule(this.namespace, store)
    this.$store.dispatch(`${this.namespace}/setNamespace`, this.namespace)
  },
  mounted () {
    this.loadConfigFromElement()
  },
  data () {
    return {
      namespace: null,
      configElem: null,
      dsEditor: DataSource,
      DataSourceClass: Vue.extend(DataSource),
      hasMap: false,
      hasMapPending: false,
      ModalDialogClass: Vue.extend(ModalDialog),
      dialogInstance: null,
    }
  },
  computed: {
    configObject () {
      return this.$store.getters[`${this.namespace}/getConfig`]
    },
    dsNamespace () {
      return `$${this.namespace}_datasources`
    },
    uid: {
      get () {
        return this.$store.getters[`${this.namespace}/uid`]
      },
      set (value) {
        this.$store.dispatch(`${this.namespace}/setUid`, value)
      }
    },
    title: {
      get () {
        return this.$store.getters[`${this.namespace}/getTitle`]
      },
      set (value) {
        this.$store.dispatch(`${this.namespace}/setTitle`, value)
      }
    },
    description: {
      get () {
        return this.$store.getters[`${this.namespace}/getDescription`]
      },
      set (value) {
        this.$store.dispatch(`${this.namespace}/setDescription`, value)
      }
    },
    maps () {
      return this.$store.getters[`${this.namespace}/allMaps`]
    },
  },
  methods: {
    onEditMap () {
      let map = {}
      if (this.maps.length > 0) {
        map.uid = this.maps[0].uid
        map.initialFindUserLocation = this.maps[0].findUserLocation
        map.initialSearchForAddress = this.maps[0].searchForAddress
        map.initialZoomToAddress = this.maps[0].zoomToAddress
        map.initialPlaceholderText = this.maps[0].placeholderText
        map.initialShowDataLayer = this.maps[0].addressSearchPopupDataSourceUid
        map.initialShowZoomControl = this.maps[0].showZoomControl
        map.initialShowLegend = this.maps[0].showLegend
      }
      map.dataLayers = {}
      for (let ds of this.dataSources()) {
        let datasource = new this.DataSourceClass({propsData: ds})
        map.dataLayers[datasource.uid] = datasource.label
      }
      this.dialogInstance = new this.ModalDialogClass({
        propsData: {
          component: MapEditor,
          properties: map
        }
      })
      this.dialogInstance.$on('cancel', this.onCancelMap)
      this.dialogInstance.$on('save', this.onSaveMap)
      this.dialogInstance.show()
    },
    onAddMap () {
      if (this.hasMap) {
        // They just clicked on it, so if they cancel, we want to reset the value
        this.hasMapPending = true
        this.onEditMap()
      } else {
        this.$store.dispatch(`${this.namespace}/deleteMap`, this.maps[0].uid)
      }
    },
    onCancelMap (e) {
      if (this.hasMapPending) {
        this.hasMap = false
        this.hasMapPending = false
      }
      this.dialogInstance = null
    },
    onSaveMap (data) {
      if (this.hasMapPending) {
        this.hasMapPending = false
      }
      this.dialogInstance = null
      this.$store.dispatch(`${this.namespace}/updateMap`, data)
    },
    onSave () {
      this.serializeConfig()
    },
    onCancel () {

    },
    dataSources () {
      if (this.$store.getters.hasOwnProperty(`${this.dsNamespace}/allItems`)) {
        return this.$store.getters[`${this.dsNamespace}/allItems`]
      } else {
        return []
      }
    },
    applyConfig (configValue) {
      let conf = {}
      try {
        const defaultConfig = this.$store.getters.getDefaultConfig
        conf = Object.assign(defaultConfig, JSON.parse(configValue))
      } catch (error) {
        console.error('Got an error while processing "%s":', configValue)
        console.error(error)
        return false
      }

      // Set basic elements
      this.$store.dispatch(`${this.namespace}/setUid`, conf.uid)
      this.$store.dispatch(`${this.namespace}/setTitle`, conf.title)
      this.$store.dispatch(`${this.namespace}/setDescription`, conf.description)

      // Set the data sources
      for (let dataSource of conf.dataSources) {
        let dataSourceType = dataSource.type
        let isCobArcGis = dataSource.data.service.indexOf('sFnw0xNflSi8J0uh') !== -1
        if (dataSource.type === 'arcgis' && isCobArcGis) {
          dataSourceType = 'cob-arcgis'
        }
        let tempDataSource = {
          uid: dataSource.uid || nanoid(),
          dataSourceType: dataSourceType,
          attributes: Object.assign({}, dataSource.data),
          icon: dataSource.icons.markerUrl,
          clusterPoints: dataSource.icons.cluster,
          polygonStyle: dataSource.polygons.style || 'default',
          popover: dataSource.popupHtmlTemplate,
          legendLabel: dataSource.legend,
        }
        this.$store.dispatch(`${this.dsNamespace}/updateItem`, tempDataSource)
      }

      // Set the maps
      if (conf.maps !== null && conf.maps.length > 0) {
        this.hasMap = true
        for (let item of conf.maps) {
          let tempMap = {
            uid: item.uid,
            latitude: item.latitude || 42.32,
            longitude: item.longitude || -71.1284,
            zoom: item.zoom || 12,
            showZoomControl: item.showZoomControl,
            showLegend: item.showLegend,
            findUserLocation: item.showUserLocation,
          }
          if (item.addressSearch !== null) {
            tempMap.searchForAddress = true
            tempMap.zoomToAddress = item.addressSearch.zoomToResult
            tempMap.placeholderText = item.addressSearch.placeholder
            tempMap.addressSearchPopupDataSourceUid = item.addressSearch.autoPopupDataSourceUid || this.$store.getters[`${this.dsNamespace}/allItems`][0]
          } else {
            tempMap.searchForAddress = false
            tempMap.zoomToAddress = false
            tempMap.placeholderText = 'Search for an address...'
            tempMap.addressSearchPopupDataSourceUid = this.$store.getters[`${this.dsNamespace}/allItems`][0]
          }
          this.$store.dispatch(`${this.namespace}/updateMap`, tempMap)
        }
      }
      return true
    },
    loadConfigFromElement (elementId) {
      elementId = elementId || this.config
      if (elementId && typeof elementId === 'string') {
        if (elementId[0] !== '#') {
          return false
        }
        awaitSelector(elementId, document.querySelector('body'), 250).then((items) => {
          this.configElem = items[0]
          this.applyConfig(items[0].value)
        })
      }
      return false
    },
    serializeConfig () {
      if (this.configElem) {
        let data = JSON.stringify(this.configObject)
        this.configElem.value = data
        let event = new Event('input', {
          view: window,
          bubbles: true,
          cancelable: true
        })
        this.configElem.dispatchEvent(event)
      }
    },
  },
}
</script>

<style lang="css" scoped>
</style>
