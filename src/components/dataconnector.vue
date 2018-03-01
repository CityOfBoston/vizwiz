<template>
  <div>
    <div class="uk-margin">
      <label for="id-services" :class="['uk-form-label', { 'uk-text-danger': $v.selectedService.$error }]">Available Data Sources</label>
      <div class="uk-form-controls">
        <select
          v-model='selectedService'
          id="id-services"
          v-if='services'
          v-on:change="onServiceChange"
          :class="['uk-select', { 'uk-form-danger': $v.selectedService.$error }]">
            <option disabled value="">Please select one</option>
            <option
              v-for="item in services"
              :value="item.url">{{ item.name }}</option>
        </select>
        <span v-else>Loading&hellip;</span>
        <span class="uk-text-danger" v-if="$v.selectedService.$error">Please select a service.</span>
      </div>
    </div>
    <div class="uk-margin">
      <label for="id-layers" :class="['uk-form-label', { 'uk-text-danger': $v.selectedLayer.$error }]">Available Layers</label>
      <div class="uk-form-controls">
        <select
          v-model="selectedLayer"
          id="id-layers"
          v-if="layers"
          v-on:change="onLayerChange"
          class="uk-select">
            <option disabled value="">Please select one</option>
            <option
              v-for="item in layers"
              :value="item.id">{{ item.name }}</option>
        </select>
        <span v-else>Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getServices, ArcGISService } from '../lib/arcgis'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'data-connector',
  mixins: [validationMixin],
  props: {
    type: {
      type: String,
      default () { return '' }
    },
    service: {
      type: String,
      default () { return '' },
    },
    layer: {
      type: Number,
      default () { return 0 },
    }
  },
  computed: {
  },
  data () {
    return {
      baseUrl: '',
      selectedService: '',
      services: [],
      selectedLayer: 0,
      layers: {},
      fields: {},
      arcGisLayer: null,
      arcGisService: null,
    }
  },
  watch: {
    type: function (val, oldVal) {
      if (val === 'cob-arcgis') {
        this.baseUrl = 'https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services'
        this.selectedLayer = this.layer
        this.selectedService = this.service
        this.fetchArcGisServices()
      }
    },
  },
  methods: {
    getFieldValues: function (fieldName) {
      this.arcGisLayer.getDistinctValues(fieldName).then(response => {
        this.$set(this.fields[fieldName], 'values', response)
      })
    },
    onServiceChange: function (event) {
      this.updateService(event.target.value)
    },
    onLayerChange: function (event) {
      this.updateLayer(parseInt(event.target.value))
    },
    updateLayer: function (layerId) {
      this.selectedLayer = layerId
      if (this.layers.length === 0) {
        return
      }
      this.arcGisLayer = this.layers[layerId]
      this.arcGisLayer.fields().then(response => {
        this.fields = response
        if (!this.$v.invalid) {
          this.$emit('change', {
            attributes: {
              service: this.selectedService,
              layer: this.selectedLayer,
            },
            fields: this.fields,
          })
        }
      })
    },
    updateService: function (url) {
      let initial = (url === this.selectedService)
      this.layers = []
      this.fields = []
      this.arcGisService = new ArcGISService(this.selectedService)
      this.arcGisService.layers().then(value => {
        this.layers = value
        if (initial) {
          this.updateLayer(this.selectedLayer)
        } else {
          this.updateLayer(0)
        }
      })
    },
    fetchArcGisServices: function () {
      getServices(this.baseUrl).then(response => {
        this.services = response
        if (this.selectedService === '') {
          this.updateService(response[0].url)
        } else {
          this.updateService(this.selectedService)
        }
      }, error => {
        console.error(error)
      })
    },
  },
  created: function () {
    if (this.type === 'cob-arcgis') {
      this.baseUrl = 'https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services'
      this.selectedLayer = this.layer
      this.selectedService = this.service
      this.fetchArcGisServices()
    }
  },
  validations: {
    selectedService: {
      required: required,
    },
    selectedLayer: {
      required: required,
    },
  }
}
</script>

<style lang="css" scoped>
</style>
