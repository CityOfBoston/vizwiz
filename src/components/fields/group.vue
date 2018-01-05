<template>
  <fieldset v-bind='fieldSchema.groupAttributes'>
    <legend v-if='fieldSchema.legend'>{{ fieldSchema.legend }}</legend>
    <div v-for='field in fields'>
      <component
        v-bind:is='field.schema.type'
        v-bind='field'
      ></component>
    </div>
  </fieldset>
</template>

<script>
import abstractField from '../../lib/abstractField'
import textInput from './textInput.vue'
import selectInput from './selectInput.vue'
import { isUndefined } from 'lodash'

export default {
  name: 'group',
  mixins: [abstractField],
  props: {
    defaultSchema: {
      type: Object,
      default () {
        return {
          legend: '',
          groupAttributes: {
            autofocus: false,
            disabled: false,
            multiple: false,
            required: false,
          },
          type: 'group',
          fields: []
        }
      }
    },
  },
  data () {
    return {
      errors: [],  // validation errors
      fields: [],
    }
  },
  created () {
    for (let field of this.fieldSchema.fields) {
      if (isUndefined(this.model[field.model]) && field.default) {
        this.$set(this.model, field.model, field.default)
      }
      this.fields.push({
        schema: field,
        fieldIdPrefix: this.fieldIdPrefix,
        model: this.model,
        vizId: this.vizId,
      })
    }
    this.$on('modelchanged', this.modelChanged)
  },
  components: {
    'select-input': selectInput,
    'text-input': textInput,
  },
}
</script>

<style lang="css" scoped>
</style>
