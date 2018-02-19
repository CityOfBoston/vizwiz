<template>
  <div>
    <div class="uk-container uk-width-1-2">
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
            <fieldset class="uk-fieldset">
              <legend class="uk-legend">Data</legend>
              <list-container
                v-bind:initial-items="dataSources"
                v-bind:editor="dsEditor"
                @list-changed="serializeConfig"
              ></list-container>
            </fieldset>
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
          </form>
      </div>
    </div>
    <div id='vizwiz-modals'></div>
  </div>
</template>

<script>
import Vue from 'vue'
import ListContainer from './list/listcontainer.vue'
import DataSource from './datasource.vue'
import ModalDialog from './modaldialog.vue'
import MapEditor from './mapeditor.vue'

require('../../node_modules/uikit/dist/css/uikit.min.css')

export default {
  name: 'viz-wiz',
  components: {
    ListContainer,
  },
  props: {
    /**
     * HTML id of the item that contains a JSON config
     */
    config: {
      type: String,
      default () { return '' }
    },
  },
  created () {
    let DataSourceClass = Vue.extend(DataSource)
    if (this.config && typeof this.config === 'string') {
      if (this.config[0] === '#') {
        this.configElem = document.getElementById(this.config.slice(1))
        let conf = JSON.parse(this.configElem.value)
        let uid = 0
        this.vizId = conf.vizId || this.vizId
        this.title = conf.title || this.title
        this.description = conf.description || this.description
        for (let dataSource of conf.data_sources) {
          this.dataSources.push(new DataSourceClass({
            propsData: {
              uid: uid++,
              dataSourceType: dataSource.type,
              attributes: Object.assign({}, dataSource.attributes),
              icon: dataSource.icon,
              clusterPoints: dataSource.cluster_icons,
              polygonStyle: dataSource.polygon_style,
              popover: dataSource.popover,
            }
          }))
        }
        if (conf.maps !== null && conf.maps.length > 0) {
          this.hasMap = true
          for (let item of conf.map) {
            this.maps.push(item)
          }
        }
      }
    }
  },
  data () {
    return {
      configElem: null,
      /**
       * The vizualization ID to include in event triggering
       */
      vizId: '',
      /**
       * The title of the visualization
       */
      title: '',
      /**
       * The description of the visualization
       */
      description: '',
      /**
       * An array of data sources to use in the visualization
       */
      dataSources: [],
      dsEditor: DataSource,
      hasMap: false,
      hasMapPending: false,
      maps: [],
      ModalDialogClass: Vue.extend(ModalDialog),
      dialogInstance: null,
    }
  },
  computed: {
    configObject () {
      let config = {
        vizId: this.vizId,
        title: this.title,
        description: this.description,
        data_sources: [],
        maps: [],
      }
      this.dataSources.forEach(item => {
        config.data_sources.push(item.configObject)
      })
      this.maps.forEach(item => {
        config.maps.push(item)
      })
      return config
    },
  },
  methods: {
    onEditMap () {
      let map = this.maps[0] || {}
      map.dataLayers = {}
      for (let ds of this.dataSources) {
        map.dataLayers[ds.label] = ds.label
      }
      if (this.dialogInstance === null) {
        this.dialogInstance = new this.ModalDialogClass({
          propsData: {
            component: MapEditor,
            properties: map
          }
        })
        this.dialogInstance.$on('cancel', this.onCancelMap)
        this.dialogInstance.$on('save', this.onSaveMap)
      } else {
        this.dialogInstance.properties = map
      }
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
      this.dialogInstance.$el.remove()
      this.dialogInstance = null
    },
    onSaveMap (data) {
      if (this.hasMapPending) {
        this.hasMapPending = false
      }
      this.maps = [Object.assign({}, data)]
      this.serializeConfig()
    },
    serializeConfig () {
      if (this.configElem) {
        this.configElem.value = JSON.stringify(this.configObject)
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
