<template>
  <div>
    <h2>{{ editMode }} Data</h2>
    <form class="uk-form-stacked" ref="data-source-entry" id="data-source-entry" action="#" method="post" v-on:submit.prevent>
      <div uk-grid class="uk-child-width-expand@s uk-grid-match">
        <div>
          <fieldset class="uk-fieldset">
            <legend class="uk-legend">Data Source</legend>
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
            <data-connector
              :validateNow="validateNow"
              :type="selectedDataSourceType"
              v-bind='selectedAttributes'
              @change="onDataConnectorChange"
              @isvalid="onDataConnectorIsValid"
            ></data-connector>
          </fieldset>
        </div> <!-- column -->
        <div>
          <fieldset class="uk-fieldset">
            <legend class="uk-legend">Data Style</legend>
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
              <label class="uk-form-label" for="data-icon">Icon</label>
              <div class="uk-form-controls">
                <select v-model="selectedIcon" class="uk-select" id="data-icon">
                  <option disabled value="">Please select one</option>
                  <option :value="key" :key="key" v-for="(key, val) in iconChoices">{{ val }}</option>
                </select>
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
          </fieldset>
        </div> <!-- column -->
      </div> <!-- grid -->
      <div class="uk-panel uk-margin">
        <label class="uk-form-label" for="data-popover">Popover Template</label>
        <div class="uk-form-controls">
          <textarea v-model="selectedPopover" class="uk-textarea" id="data-popover"></textarea>
        </div>
      </div> <!-- uk-panel uk-margin -->
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
      dataSourceTypeChoices: dataSourceTypeChoices,
      polygonStyleChoices: polygonStyleChoices,
      iconChoices: iconChoices,
      selectedDataSourceType: '',
      selectedAttributes: {},
      selectedIcon: '',
      selectedClusterPoints: true,
      selectedPolygonStyle: '',
      selectedPopover: '',
      selectedLegendLabel: '',
      fields: [],
      validateNow: false,
    }
  },
  computed: {
    configObject () {
      let c = {
        uid: this.uid,
        type: this.selectedDataSourceType,
        icon: this.selectedIcon,
        cluster_icons: this.selectedClusterPoints,
        polygon_style: Object.assign({}, this.selectedPolygonStyle),
        popover: this.selectedPopover,
        attributes: Object.assign({}, this.selectedAttributes),
        legend_label: this.selectedLegendLabel,
      }
      return c
    },
    editMode () { return 'Add' },
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
      this.selectedAttributes = values.attributes
      this.fields = values.fields
    },
    onDataConnectorIsValid (value) {
      this.validateNow = false
      this.$emit('dcisvalid', value)
    },
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
  }
}
</script>

<style lang="css" scoped>
</style>
