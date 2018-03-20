<template>
  <div>
    <h2>{{ editMode }} Data Source</h2>
    <form class="uk-form-stacked" id="data-source-entry" action="#" method="post" v-on:submit.prevent>
      <ul uk-tab>
        <li class="uk-active"><a href="#">Source</a></li>
        <li><a href="#">Style</a></li>
        <li><a href="#">Popover</a></li>
        <li><a href="#">Preview</a></li>
      </ul>
      <ul class="uk-switcher">
        <li>
          <div uk-grid class="uk-grid-match">
            <div class="uk-width-1-2"> <!-- column 1 start -->
              <div class="uk-margin">
                <label class="uk-form-label" for="data-source-type">Type</label>
                <div class="uk-form-controls">
                  <select
                    v-model="dataSourceType"
                    class="uk-select" id="data-source-type"
                  >
                    <option :value="key" :key="key" v-for="(key, val) in dataSourceTypeChoices">{{ val }}</option>
                  </select>
                </div>
              </div>
            </div> <!-- column 1 -->
            <div class="uk-width-1-2"> <!-- column 2 start -->
              <data-connector
                ref="data-connector"
                :type="dataSourceType"
                v-bind="attributes"
                @change="onDataConnectorChange"
              ></data-connector>
            </div> <!-- column 2 -->
          </div> <!-- grid -->
        </li> <!-- source tab container -->
        <li>
          <div uk-grid>
            <div class="uk-width-1-2">
              <div class="uk-margin">
                <label class="uk-form-label" for="data-legend-label">Legend label</label>
                <div class="uk-form-controls">
                  <input
                    type="text"
                    class="uk-input"
                    name="data-legend-label"
                    id="data-legend-label"
                    v-model="legendLabel">
                </div>
              </div> <!-- uk-margin -->

              <div class="uk-margin">
                <label class="uk-form-label" for="data-ploygon-style">Polygon Style</label>
                <div class="uk-form-controls">
                  <select v-model="polygonStyle" class="uk-select" id="data-ploygon-style">
                    <option disabled value="">Please select one</option>
                    <option :value="key" :key="key" v-for="(key, val) in polygonStyleChoices">{{ val }}</option>
                  </select>
                </div>
              </div> <!-- uk-margin -->

            </div> <!-- column 1 -->
            <div class="uk-width-1-2">
              <div class="uk-margin">
                <label class="uk-form-label" for="data-icon">Icon</label>
                <div class="uk-form-controls">
                  <select v-model="icon" class="uk-select" id="data-icon">
                    <option disabled value="">Please select one</option>
                    <option :value="key" :key="key" v-for="(key, val) in iconChoices">{{ val }}</option>
                  </select>
                </div>
              </div> <!-- uk-margin -->
              <div class="uk-margin">
                <label class="uk-form-label" for="data-cluster">
                  <input
                    id="data-cluster"
                    v-model="clusterPoints"
                    class="uk-checkbox"
                    type="checkbox">
                      Cluster Points
                </label>
              </div> <!-- uk-margin -->

            </div> <!-- column 2 -->
          </div>
        </li> <!-- style tab container -->
        <li>
          <div uk-grid>
            <div class="uk-width-1-2">
              <div class="uk-margin">
                <label class="uk-form-label" for="data-popover">Popover Template</label>
                <div class="uk-form-controls">
                  <wysiwyg v-model="popover" ref="data-popover" id="data-popover"></wysiwyg>
                </div>
              </div> <!-- uk-margin -->
            </div> <!-- column 1 -->
            <div class="uk-width-1-2">
              <div class="uk-margin">
                <label class="uk-form-label" for="data-fields">Available Fields</label>
                <div class="uk-form-controls">
                  <div class="uk-overflow-auto uk-height-medium" style="border:1px solid #e5e5e5">
                    <table class="uk-table uk-table-small uk-table-divider uk-table-hover">
                      <tbody>
                        <tr v-for="field in fields">
                          <td class="uk-table-link">
                            <a class="uk-link-reset" href="" @click.stop.prevent @dblclick='onInsertField(field)'>
                              {{ field.label }}
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div> <!-- overflow -->
                </div>
              </div>
            </div> <!-- column 2 -->
          </div>
        </li> <!-- popover tab container -->
        <li>
          <div class="uk-panel uk-width-1-1">
            <div class="leaflet-pane leaflet-popup-pane">
              <div class="leaflet-popup">
                <div class="leaflet-popup-content-wrapper">
                  <div class="leaflet-popup-content" v-html="samplePopover" id="samplePopover">
                  </div>
                </div>
                <div class="leaflet-popup-tip-container">
                  <div class="leaflet-popup-tip"></div>
                </div>
                <a class="leaflet-popup-close-button" @click.stop.prevent href="#close">×</a>
              </div>
            </div>
            <div class="uk-panel uk-text-center">
              <img :src="icon" width="32" height="32">
            </div>
          </div>
        </li> <!-- preview tab container -->
      </ul>

      <div class="uk-panel uk-margin">
        <div class="uk-float-right">
          <button
            type="button"
            class="uk-button uk-button-default"
            @click="onCancel">Cancel</button>
          <button
            type="button"
            class="uk-button uk-button-primary"
            @click="onSave">Save</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import Vue from 'vue'
import DataConnector from './dataconnector.vue'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import nanoid from 'nanoid'
import store from './store'
import templayed from 'templayed'
import { ArcGISLayer } from '../lib/arcgis'
import wysiwyg from 'vue-wysiwyg'

require('vue-wysiwyg/dist/vueWysiwyg.css')

Vue.use(wysiwyg, {
  hideModules: {
    underline: true,
    image: true,
    table: true,
    headings: true,
    code: true,
    removeFormat: true,
    orderedList: true,
    unorderedList: true,
  },
  maxHeight: '300px',
})

export default {
  name: 'data-source',
  mixins: [validationMixin],
  components: {
    DataConnector,
  },
  props: {
    /**
     * The `uid` of the datasource to retrieve from the store.
     *
     * Creates a new `uid` by default.
     */
    uid: {
      type: String,
      default () { return nanoid() },
    },
  },
  data () {
    return {
      /**
       * Are we editing an existing record or adding a new one? Should be
       * `Edit` or `Add New`
       */
      editMode: 'Edit',

      /**
       * The type of data source. Should be one of `dataSourceTypeChoices`
       */
      dataSourceType: '',

      /**
       * Generic attributes returned from the `data-connector` component.
       */
      attributes: {},

      /**
       * The URL of the selected icon. Should be one of `iconChoices`.
       */
      icon: '',

      /**
       * Should maps using this data source cluster points when zoomed out
       */
      clusterPoints: true,

      /**
       * The name of the polygon style configuration. Should be one of `polygonStyleChoices`
       */
      polygonStyle: '',

      /**
       * The text of the popover template.
       */
      popover: '',

      /**
       * The label to use in the legend of a map that uses this data source.
       */
      legendLabel: '',

      /**
       * The fields of the data source. This is populated by the `data-connector`.
       * We use these to make it easier for users to insert the fields into the
       * popover template.
       */
      fields: [],

      /**
       * Which row of the data source are we using to render the sample popover.
       *
       * This is here for allowing the user to navigate through several rows
       * in the sample popover.
       */
      sampleRow: 1,

      /**
       * The component to render for connection attributes. Changes based on
       * the `dataSourceType` choice, and populates `attributes` and `fields`
       */
      datasourceConnector: null,

      /**
       * The latest row retrieved from the source for use when rendering the sample popover
       */
      currentRowCache: {},
    }
  },
  computed: {
    /**
     * Return an representation of this data as an object
     *
     * @return     {Object}  This data has an object
     */
    configObject () {
      return {
        uid: this.uid,
        dataSourceType: this.dataSourceType,
        icon: this.icon,
        clusterPoints: this.clusterPoints,
        polygonStyle: this.polygonStyle,
        popover: this.popover,
        attributes: Object.assign({}, this.attributes),
        legendLabel: this.legendLabel,
      }
    },

    /**
     * Convenience attribute to retrieve the choices of data source types from
     * the global store.
     *
     * @return     {Object}  Data source type choices in the format `{label: value}`
     */
    dataSourceTypeChoices () {
      return store.state.dataSourceTypeChoices
    },

    /**
     * Convenience attribute to retrieve the choices of icons from the global store
     *
     * @return     {object}  Icon choices in the format `{label: value}`
     */
    iconChoices () {
      return store.state.iconChoices
    },

    /**
     * How this item should appear in a listing
     *
     * @return     {string}  A brief label for this item
     */
    label () {
      if (this.legendLabel) {
        return this.legendLabel
      }
      let attrs = []
      if (this.dataSourceType === 'cob-arcgis') {
        let svc = this.attributes.service.split('/')
        attrs.push(`service: ${svc[svc.length - 2]}`)
        attrs.push(`layer: ${this.attributes.layer}`)
      } else {
        for (let prop in this.attributes) {
          attrs.push(`${prop}: ${this.attributes[prop]}`)
        }
      }
      return `${this.dataSourceType}: ${attrs.join(', ')}`
    },

    /**
     * A convenience attribute to retrieve the choices of polygon styles from
     * the global store
     *
     * @return     {object}  Polygon Style choices in the format `{label: value}`
     */
    polygonStyleChoices () { return store.state.polygonStyleChoices },

    /**
     * This renders the popover template with a cached row from the datasource
     *
     * @return     {string}  The rendered popover in HTML
     */
    samplePopover: function () {
      return templayed(this.popover)(this.currentRowCache)
    },
  },
  methods: {
    onInsertField (field) {
      const textArea = this.$refs['data-popover']
      textArea.exec('insertHTML', `{{${field.label}}}`)
    },
    onCancel (event) {
      this.$emit('cancel')
    },
    onSave (event) {
      const isValid = this.isValid()
      if (isValid) {
        this.$emit('save', this.configObject)
      }
    },
    onDataConnectorChange (values) {
      this.datasourceConnector = new ArcGISLayer(values.attributes.service, values.attributes.layer)
      this.attributes = values.attributes
      this.fields = values.fields
      this.datasourceConnector.getRows(this.sampleRow, 1).then(value => {
        let newVal = {}
        for (let prop in value[0]) {
          if (typeof value[0][prop] === 'string') {
            newVal[prop] = value[0][prop].trim()
          } else {
            newVal[prop] = value[0][prop]
          }
        }
        this.currentRowCache = newVal
      }).catch(value => {
        this.currentRowCache = {}
      })
    },
    isValid () {
      this.$v.$reset()
      this.$v.$touch()
      return !this.$v.$error
    },
  },
  created () {
    if (store.getters['$_datasources/allIds'].indexOf(this.uid) !== -1) {
      // This is not a new data source. Populate everything from the store
      const ds = store.getters['$_datasources/getItem'](this.uid)
      this.dataSourceType = ds.dataSourceType
      this.attributes = Object.assign({}, ds.attributes)
      this.icon = ds.icon
      this.clusterPoints = ds.clusterPoints
      this.polygonStyle = ds.polygonStyle
      this.popover = ds.popover
      this.legendLabel = ds.legendLabel
    } else {
      // this is a new data source. Populate everything from defaults
      this.editMode = 'Add New'
      this.dataSourceType = store.state.dataSourceTypeChoices['CoB ArcGIS']
      this.attributes = {}
      this.icon = store.state.iconChoices.default
      this.clusterPoints = true
      this.polygonStyle = 'default'
      this.popover = ''
      this.legendLabel = ''
    }
  },
  validations: {
    dataSourceType: {required},
    icon: {required},
    polygonStyle: {required},
    attributes: {
      isValid (value) {
        this.$refs['data-connector'].$v.$reset()
        this.$refs['data-connector'].$v.$touch()
        return !this.$refs['data-connector'].$v.$invalid
      }
    }
  },
}
</script>

<style lang="css" scoped>
.leaflet-popup-pane {
  cursor:  auto;
  z-index:  700;
}
.leaflet-pane {
}
.leaflet-popup {
  position: relative;
  max-width: 300px;
  min-width: 50px;
  text-align: center;
  margin-bottom: 10px;
  margin-left: auto;
  margin-right:  auto;
  z-index: 701;
}
.leaflet-popup-content-wrapper, .leaflet-popup-tip {
  background: white;
  color: #333;
  box-shadow: 0 3px 14px rgba(0,0,0,0.4);
}
.leaflet-popup-content-wrapper {
  padding: 1px;
  text-align: left;
  border-radius: 12px;
}
.leaflet-popup-tip-container {
    width: 40px;
    height: 20px;
    position: absolute;
    left: 50%;
    margin-left: -20px;
    overflow: hidden;
    pointer-events: none;
}
a.leaflet-popup-close-button {
    position: absolute;
    top: 0;
    right: 0;
    padding: 4px 4px 0 0;
    border: none;
    text-align: center;
    width: 18px;
    height: 14px;
    font: 16px/14px Tahoma, Verdana, sans-serif;
    color: #c3c3c3;
    text-decoration: none;
    font-weight: bold;
    background: transparent;
}
.leaflet-popup-content {
    margin: 13px 19px;
    line-height: 1.4;
}
.leaflet-popup-tip {
    width: 17px;
    height: 17px;
    padding: 1px;
    margin: -10px auto 0;
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
}
</style>
