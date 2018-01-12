<template>
  <div class="panel-body">
    <h3 v-if='title'>{{ title }}</h3>
    <p v-if='description'>{{ description }}</p>
    <form v-on:submit.prevent>
      <div v-for='field in fields'>
        <component
          v-bind:is='field.schema.type'
          v-bind='field'
          @modelchanged='modelChanged'
        ></component>
      </div>
    </form>
  </div>
</template>

<script>
import queryString from 'query-string'
import textInput from './fields/textInput.vue'
import selectInput from './fields/selectInput.vue'
import group from './fields/group.vue'
import deepmerge from 'deepmerge'
import { isUndefined } from 'lodash'

export default {
  name: 'DataFilter',
  props: {
    /**
     * The Object Array that defines the filters
     */
    form: {
      type: [String, Array],
      default () { return [] }
    },
    /**
     * The prefix to add to the id of each filter
     */
    fieldIdPrefix: {
      type: String,
      default () { return '' }
    },
    /**
     * The tracked values
     */
    model: {
      type: Object,
      default () { return {} }
    },
    /**
     * Default values as a JSON string
     */
    defaults: {
      type: String,
      default () { return '' }
    },
    /**
     * The vizualization ID to include in event triggering
     */
    vizId: {
      type: String,
      default () { return '' }
    },
    /**
     * The description for the whole thing
     */
    description: {
      type: String,
      default () { return '' },
    },
    /**
     * The title of the whole thing
     */
    title: {
      type: String,
      default () { return '' },
    },
  },
  data () {
    return {
      errors: [],  // validation errors
      fields: [],  // Each field configuration
    }
  },
  watch: {
    form: function (form, oldVal) {
      this.updateFields(form)
    },
    defaults: function (defaultConfig, oldVal) {
      this.updateDefaults(defaultConfig)
    },
  },
  created () {
    this.updateFields(this.form)
    if (this.defaults) {
      this.updateDefaults(this.defaults)
    }
    document.addEventListener('setfilter', this.onSetFilter)
    this.$on('modelchanged', this.modelChanged)
  },
  computed: {
  },
  components: {
    'select-input': selectInput,
    'text-input': textInput,
    'group': group,
  },
  methods: {
    onSetFilter: function (event) {
      this.updateFields(event.detail.form)
    },
    onPopstate: function (event) {
      // console.log(event.state)
    },
    modelChanged: function (value, field) {
      document.dispatchEvent(new CustomEvent(`${this.vizId}.filter`, {
        detail: deepmerge.all([{}, this.model])
      }))
      let newurl = new URL(window.location.href)
      newurl.search = queryString.stringify(this.model)
      history.pushState(this.model, null, newurl)
    },
    updateFields: function (form) {
      let tempForm = form
      let newFields = []
      this.fields = []

      if (typeof form === 'string') {
        tempForm = queryString.parse(form)
      }
      for (let field of tempForm) {
        if (isUndefined(this.model[field.model]) && field.default) {
          this.$set(this.model, field.model, field.default)
        }
        newFields.push({
          schema: field,
          fieldIdPrefix: this.fieldIdPrefix,
          model: this.model,
          vizId: this.vizId,
        })
      }
      this.$nextTick(function () {
        this.fields = newFields
      })
    },
    updateDefaults: function (defaultConfig) {
      let config
      if (window.location.search === '') {
        if (typeof defaultConfig === 'string') {
          config = queryString.parse(defaultConfig)
        }
      } else {
        config = queryString.parse(window.location.search)
      }
      for (let fieldName in config) {
        if (isUndefined(this.model[fieldName]) && config[fieldName]) {
          this.$set(this.model, fieldName, config[fieldName])
        }
      }
    },
  }
}

</script>

<style lang='css' scoped>
</style>
