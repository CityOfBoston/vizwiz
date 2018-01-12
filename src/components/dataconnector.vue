<template>
  <form v-on:submit.prevent>
    <div class="sel">
      <label for="id-services" class="sel-l">Available Data Sources</label>
      <div class="sel-c">
        <select id="id-services" v-on:change="onServiceChange" class="sel-f">
          <option v-for="item in services" :value="item.url">{{ item.name }}</option>
        </select>
      </div>
    </div>
    <div class="sel">
      <label for="id-layers" class="sel-l">Available Layers</label>
      <div class="sel-c">
        <select id="id-layers" v-if="layers" v-on:change="onLayerChange" class="sel-f">
          <option v-for="item in layers" :value="item.id">{{ item.name }}</option>
        </select>
        <span v-else>Loading...</span>
      </div>
    </div>
    <table v-if="fields" class="responsive-table responsive-table--horizontal m-v500">
      <thead><tr>
        <th>Field Name</th>
        <th>Label (Alias)</th>
        <th>Visible</th>
        <th>Filter Type</th>
        <th>Values</th>
      </tr></thead>
      <tbody>
        <tr v-for="(field, key) in fields">
          <td>{{ key }} <em>({{ field.type }})</em></td>
          <td><input type="text" :name="field.key + 'label'" v-model="fields[key].label"></td>
          <td><input type="checkbox" :name="field.key + 'visible'" v-model="fields[key].visible"></td>
          <td>
            <select v-model="fields[key].filterType">
              <option v-for="item in field.availableFilterTypes">{{ item }}</option>
            </select>
          </td>
          <td>
            <button v-on:click="getFieldValues(key)">Get Distinct Values</button>
            {{ field.values.join(', ') }}
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>

<script>
import { getServices, ArcGISService } from '../lib/arcgis'
import { debounce } from 'lodash'

export default {
  name: 'DataConnector',
  props: {
    datasource: {
      type: String,
      default () {
        return ''
      },
    }
  },
  computed: {
    tableConfig: function () {
      let config = {columns: [], url: ''}
      if (this.arcGisLayer) {
        config.url = `${this.arcGisLayer.url}/query`
        for (const field in this.fields) {
          if (this.fields[field].visible) {
            config.columns.push({'name': field, 'label': this.fields[field].label})
          }
        }
      }
      return config
    },
    filterConfig: function () {
      let config = {form: []}
      for (const field in this.fields) {
        switch (this.fields[field].filterType) {
          case 'none':
            break
          case 'select-one':
          case 'select-multiple':
            if (this.fields[field].values.length === 0) {
              this.getFieldValues(field)
            }
            config.form.push({
              type: 'select-input',
              model: field,
              values: this.fields[field].values,
              label: this.fields[field].label || field,
              selectAttributes: {
                multiple: this.fields[field].filterType === 'select-multiple',
              }
            })
            break
          case 'group':
            break
          default:
            config.form.push({
              type: 'text-input',
              model: field,
              label: this.fields[field].label,
              inputType: this.fields[field].filterType,
            })
            break
        }
      }
      return config
    },
  },
  data () {
    return {
      baseUrl: '',
      services: [],
      selectedService: '',
      selectdLayer: '',
      layers: [],
      fields: {},
      arcGisLayer: null,
      arcGisService: null,
    }
  },
  watch: {
    fields: {
      handler: debounce(function (val, oldVal) {
        let filterConfig = this.filterConfig
        let tableConfig = this.tableConfig
        document.dispatchEvent(new CustomEvent('setfilter', {
          detail: filterConfig
        }))
        document.dispatchEvent(new CustomEvent('changetable', {
          detail: tableConfig
        }))
      }, 300),
      deep: true,
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
      this.updateLayer(event.target.value)
    },
    updateLayer: function (layerId) {
      this.selectedLayer = layerId
      this.arcGisLayer = this.layers[this.selectedLayer]
      this.arcGisLayer.fields().then(response => {
        this.fields = response
      })
    },
    updateService: function (url) {
      this.selectedService = url
      this.layers = []
      this.fields = []
      this.arcGisService = new ArcGISService(this.selectedService)
      this.arcGisService.layers().then(value => {
        this.layers = value
        this.arcGisLayer = value[0]
        this.updateLayer(0)
      })
    },
    arcgisServices: function () {
      getServices(this.baseUrl).then(response => {
        this.services = response
        this.updateService(response[0].url)
      }, error => {
        console.error(error)
      })
    },
  },
  mounted: function () {
    this.baseUrl = this.datasource
    this.arcgisServices()
  }
}
</script>

<style lang="css" scoped>
</style>
