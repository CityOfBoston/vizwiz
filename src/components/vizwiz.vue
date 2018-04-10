<template>
  <div>
    <div class="uk-container">
        <div class="uk-panel">
          <h2>Add Visualization</h2>

          <form class="uk-form-stacked" action="#" method="post" v-on:submit.prevent>
            <input type="hidden" name="vizid" v-model="vizId">
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
              namespace="$_datasources"
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
import store from './store'
import nanoid from 'nanoid'

require('../../node_modules/uikit/dist/css/uikit.min.css')

export default {
  name: 'viz-wiz',
  components: {
    EditableList
  },
  store,
  props: {
    /**
     * HTML id of the item that contains a JSON config
     */
    config: {
      type: String,
      default () { return '' }
    },
  },
  mounted () {
    const defaultConfig = this.$store.getters.getDefaultConfig
    if (this.config && typeof this.config === 'string') {
      if (this.config[0] === '#') {
        this.configElem = document.getElementById(this.config.slice(1))
        let conf = Object.assign(defaultConfig, JSON.parse(this.configElem.value))
        this.$store.dispatch('setVizId', conf.vizId)
        this.$store.dispatch('setTitle', conf.title)
        this.$store.dispatch('setDescription', conf.description)
        for (let dataSource of conf.dataSources) {
          let tempDataSource = {
            uid: dataSource.uid || nanoid(),
            dataSourceType: dataSource.type,
            attributes: Object.assign({}, dataSource.attributes),
            icon: dataSource.icon,
            clusterPoints: dataSource.clusterIcons,
            polygonStyle: dataSource.polygonStyle.uid || 'default',
            popover: dataSource.popover,
            legendLabel: dataSource.legendLabel
          }
          this.$store.dispatch('$_datasources/updateItem', tempDataSource)
        }
        if (conf.maps !== null && conf.maps.length > 0) {
          this.hasMap = true
          for (let item of conf.maps) {
            let tempMap = {
              latitude: item.latitude || '42.347316',
              longitude: item.longitude || '-71.065227',
              zoom: item.zoom || '12',
              showZoomControl: item.showZoomControl,
              showLegend: item.showLegend,
              findUserLocation: item.findUserLocation,
              searchForAddress: item.searchForAddress,
              zoomToAddress: item.zoomToAddress,
              placeholderText: item.placeholderText,
              addressSearchPopupDataSourceUid: item.addressSearchPopupDataSourceUid || this.$store.getters.allDataSources[0],
            }
            this.$store.dispatch('updateMap', tempMap)
          }
        }
      }
    }
  },
  data () {
    return {
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
      return this.$store.getters.getConfig
    },
    vizId: {
      get () {
        return this.$store.state.vizId
      },
      set (value) {
        this.$store.dispatch('setVizId', value)
      }
    },
    title: {
      get () {
        return this.$store.state.title
      },
      set (value) {
        this.$store.dispatch('setTitle', value)
      }
    },
    description: {
      get () {
        return this.$store.state.description
      },
      set (value) {
        this.$store.dispatch('setDescription', value)
      }
    },
    maps () {
      return this.$store.getters.allMaps
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
      for (let ds in this.dataSources()) {
        let datasource = new this.DataSourceClass({propsData: this.dataSources[ds]})
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
      this.$store.dispatch('updateMap', data)
    },
    onSave () {
      this.serializeConfig()
    },
    onCancel () {

    },
    dataSources () {
      if (this.$store.getters.hasOwnProperty('$_datasources/allItems')) {
        return this.$store.getters['$_datasources/allItems']
      } else {
        return []
      }
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
    }
  }
}
</script>

<style lang="css" scoped>
</style>
