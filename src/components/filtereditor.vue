<template>
  <div class="uk-panel">
    <h2>Edit Filter</h2>
    <div class="uk-margin">
      <label for="id-services" :class="['uk-form-label', { 'uk-text-danger': $v.dataSource.$error }]">Available Data Sources</label>
      <div class="uk-form-controls">
        <select
          v-model='dataSource'
          id="id-data-source"
          v-on:change="onDataSourceChange"
          :class="['uk-select', { 'uk-form-danger': $v.dataSource.$error }]">
            <option disabled value="">Please select one</option>
            <option
              v-for="item in dataSources"
              :value="item.uid">{{ item.label }}</option>
        </select>
        <span class="uk-text-danger" v-if="$v.dataSource.$error">Please select a data source.</span>
      </div>
    </div>
    <table v-if="fields" class="uk-table uk-table-striped">
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
    <div class="uk-panel">
      <div class="uk-float-right">
        <button
          class="uk-button uk-button-default"
          type="button"
          @click="onCancel">Cancel</button>
        <button
          class="uk-button uk-button-primary"
          type="button"
          @click="onSave">Save</button>
      </div>
    </div>

  </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import nanoid from 'nanoid'

export default {

  name: 'filter-editor',
  mixins: [validationMixin],
  props: {
    dataSources: {
      type: [Object, Array],
      required: true,
    },
    uid: {
      type: String,
      default () { return nanoid() }
    },
  },
  data () {
    return {
      dataSource: null,
      dataSourceEditor: null,
      fields: [],
      title: '',
      description: '',
      initialValues: {},
      form: [],
      fieldIdPrefix: '',
    }
  },
  methods: {
    onCancel () {
      this.$emit('cancel')
    },
    onDataSourceChange () {
      for (let i in this.dataSources) {
        console.log(i)
        if (this.dataSources[i].uid === this.dataSource) {
          this.dataSourceEditor = this.dataSources[i]
          break
        }
      }
      console.log(this.dataSourceEditor)
    },
    onSave (data) {
      this.$emit('save', this.serialize())
    },
    serialize () {
      return {}
    },
  },
  validations: {
    dataSource: {
      required: required,
    },
  }
}
</script>

<style lang="css" scoped>
</style>
