<template>
  <div>
    <h2>{{ editMode }} Data Source</h2>
    <form class="uk-form-stacked" ref="data-source-entry" id="data-source-entry" action="#" method="post" v-on:submit.prevent>
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
                    v-model="selectedDataSourceType"
                    class="uk-select" id="data-source-type"
                  >
                    <option :value="key" :key="key" v-for="(key, val) in dataSourceTypeChoices">{{ val }}</option>
                  </select>
                </div>
              </div>
            </div> <!-- column 1 -->
            <div class="uk-width-1-2"> <!-- column 2 start -->
              <data-connector
                :validateNow="validateNow"
                :type="selectedDataSourceType"
                v-bind='selectedAttributes'
                @change="onDataConnectorChange"
                @isvalid="onDataConnectorIsValid"
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
                    v-model="selectedLegendLabel">
                </div>
              </div> <!-- uk-margin -->

              <div class="uk-margin">
                <label class="uk-form-label" for="data-ploygon-style">Polygon Style</label>
                <div class="uk-form-controls">
                  <select v-model="selectedPolygonStyle" class="uk-select" id="data-ploygon-style">
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
                  <select v-model="selectedIcon" class="uk-select" id="data-icon">
                    <option disabled value="">Please select one</option>
                    <option :value="key" :key="key" v-for="(key, val) in iconChoices">{{ val }}</option>
                  </select>
                </div>
              </div> <!-- uk-margin -->
              <div class="uk-margin">
                <label class="uk-form-label" for="data-cluster">
                  <input
                    id="data-cluster"
                    v-model="selectedClusterPoints"
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
                  <textarea v-model="selectedPopover" class="uk-textarea uk-height-medium" id="data-popover"></textarea>
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
              <img :src="selectedIcon" width="32" height="32">
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
import DataConnector from './dataconnector.vue'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import nanoid from 'nanoid'
import store from './store'
import templayed from 'templayed'
import { ArcGISLayer } from '../lib/arcgis'
import { debounce } from 'lodash'

export default {
  name: 'data-source',
  mixins: [validationMixin],
  components: {
    DataConnector,
  },
  props: {
    uid: {
      type: String,
      default () { return nanoid() },
    },
    dataSourceType: {
      type: String,
      default () { return store.state.dataSourceTypeChoices['CoB ArcGIS'] }
    },
    dataSourceTypeChoices: {
      type: Object,
      // default () { return {'CoB ArcGIS': 'cob-arcgis'} }
      default () {
        return store.state.dataSourceTypeChoices
      }
    },
    attributes: {
      type: Object,
      default () { return {} }
    },
    icon: {
      type: String,
      // default () { return this.iconChoices.default }
      default () { return store.state.iconChoices.default }
    },
    iconChoices: {
      type: Object,
      default () {
        return store.state.iconChoices
      }
    },
    clusterPoints: {
      type: Boolean,
      default () { return true },
    },
    polygonStyle: {
      type: String,
      default () { return 'default' }
    },
    polygonStyleChoices: {
      type: Object,
      default () { return store.state.polygonStyleChoices }
    },
    popover: {
      type: String,
      default () { return '' }
    },
    legendLabel: {
      type: String,
      default () { return '' }
    },
  },
  data () {
    return {
      selectedDataSourceType: '',
      selectedAttributes: {},
      selectedIcon: '',
      selectedClusterPoints: true,
      selectedPolygonStyle: '',
      selectedPopover: '',
      selectedLegendLabel: '',
      fields: [],
      validateNow: false,
      sampleRow: 1,
      datasourceConnector: null,
      currentRowCache: {},
      // samplePopover: '',
    }
  },
  computed: {
    samplePopover: function () {
      return templayed(this.selectedPopover)(this.currentRowCache)
    },
    configObject () {
      let c = {
        uid: this.uid,
        type: this.selectedDataSourceType,
        icon: this.selectedIcon,
        clusterIcons: this.selectedClusterPoints,
        polygonStyle: this.selectedPolygonStyle,
        popover: this.selectedPopover,
        attributes: Object.assign({}, this.selectedAttributes),
        legendLabel: this.selectedLegendLabel,
      }
      return c
    },
    editMode () { return 'Edit' },
    label () {
      if (this.selectedLegendLabel) {
        return this.selectedLegendLabel
      }
      let attrs = []
      if (this.selectedDataSourceType === 'cob-arcgis') {
        let svc = this.selectedAttributes.service.split('/')
        attrs.push(`service: ${svc[svc.length - 2]}`)
        attrs.push(`layer: ${this.selectedAttributes.layer}`)
      } else {
        for (let prop in this.selectedAttributes) {
          attrs.push(`${prop}: ${this.selectedAttributes[prop]}`)
        }
      }
      return `${this.selectedDataSourceType}: ${attrs.join(', ')}`
    }
  },
  methods: {
    onInsertField (field) {
      let textArea = document.getElementById('data-popover')
      let selStart = textArea.selectionStart
      let selEnd = textArea.selectionEnd
      let oldText = this.selectedPopover
      let before = oldText.substring(0, selStart)
      let after = oldText.substring(selEnd, this.selectedPopover.length)
      let newstuff = `${before}{{${field.label}}}${after}`
      let newEnd = selStart + field.label.length + 4
      this.selectedPopover = newstuff

      // Wait for the next DOM update to set the selection range
      this.$nextTick(function () {
        textArea.setSelectionRange(newEnd, newEnd)
        textArea.focus()
      })
    },
    onDataSourceTypeChange (event) {
      console.log('onDataSourceTypeChange')
    },
    onCancel (event) {
      this.$emit('cancel')
    },
    async onSave (event) {
      const isValid = await this.isValid()
      if (isValid) {
        this.$emit('save', this.configObject)
      }
    },
    onDataConnectorChange (values) {
      this.datasourceConnector = new ArcGISLayer(values.attributes.service, values.attributes.layer)
      this.selectedAttributes = values.attributes
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
      })
    },
    onDataConnectorIsValid (value) {
      this.validateNow = false
      this.$emit('dcisvalid', value)
    },
    samplePopoverGenerator: debounce(function () {
      return templayed(this.selectedPopover)(this.currentRowCache)
    }),
    waitForValidation () {
      return new Promise(resolve => {
        if (this.$v.$error || !this.$v.$pending) {
          return resolve()
        }
        let poll = setInterval(() => {
          if (!this.$v.$pending) {
            clearInterval(poll)
            resolve()
          }
        }, 200)
      })
    },
    async isValid () {
      this.$v.$reset()
      this.$v.$touch()
      await this.waitForValidation()
      return Promise.resolve(!this.$v.$error)
    },
    validateDataConnector () {
      return new Promise((resolve, reject) => {
        this.$once('dcisvalid', function (value) {
          resolve(value)
        })
        this.validateNow = true
      })
    }
  },
  created () {
    this.selectedDataSourceType = this.dataSourceType
    this.selectedAttributes = Object.assign({}, this.attributes)
    this.selectedIcon = this.icon
    this.selectedClusterPoints = this.clusterPoints
    this.selectedPolygonStyle = this.polygonStyle
    this.selectedPopover = this.popover
    this.selectedLegendLabel = this.legendLabel
  },
  validations: {
    selectedDataSourceType: {required},
    selectedIcon: {required},
    selectedPolygonStyle: {required},
    selectedAttributes: {
      async isValid (value) {
        const valid = await this.validateDataConnector()
        return valid
      }
    },
  },
}
</script>

<style lang="css" scoped>
.leaflet-popup-pane {
  cursor:  auto;
  z-index:  700;
}
.leaflet-pane {
/*  position: absolute;
  left: 0;
  top: 0;
  */
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
