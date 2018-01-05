<template>
  <div class='fs-c m-b300'>
    <div class='txt'>
      <label v-if='showLabel' :for='fieldId' class='txt-l txt-l--mt000'>
        {{ fieldSchema.label }}
      </label>
      <input :class='getFieldClass("txt-f")'
        :id='fieldId'
        :type='fieldSchema.inputType.toLowerCase()'
        v-bind='fieldSchema.inputAttributes'
        :value='value'
        @input='onInput'
        @blur='onBlur'
      />
      <div v-if='fieldSchema.help' class='t--subinfo m-t100'>{{ fieldSchema.help }}</div>
      <div v-if='errors'>
        <div v-for='error in errors' class='t--subinfo t--err m-t100'>
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import abstractField from '../../lib/abstractField'
import { debounce, isFunction, isNumber, isString, isArray, merge } from 'lodash'
import fecha from 'fecha'

const DATETIME_FORMATS = {
  'date': 'YYYY-MM-DD',
  'datetime': 'YYYY-MM-DD HH:mm:ss',
  'datetime-local': 'YYYY-MM-DDTHH:mm:ss',
}

const DEBOUNCE_FORMAT_MS = 500

export default {
  name: 'textInput',
  mixins: [abstractField],
  props: {
    defaultSchema: {
      type: Object,
      default () {
        return {
          help: '',
          hint: '',
          label: '',
          model: null,
          inputAttributes: {
            autofocus: false,
            disabled: false,
            readonly: false,
            required: false,
          },
          type: 'text-input',
          visible: true,
        }
      }
    },
  },
  computed: {
    showLabel () {
      return (this.fieldSchema.label && this.fieldSchema.inputType !== 'hidden')
    },
  },
  methods: {
    formatValueToModel (value) {
      if (value != null) {
        switch (this.schema.inputType.toLowerCase()) {
          case 'date':
          case 'datetime':
          case 'datetime-local':
          case 'number':
          case 'range':
            // debounce
            return (newValue, oldValue) => {
              this.debouncedFormatFunc(value, oldValue)
            }
        }
      }

      return value
    },
    formatDatetimeToModel (newValue, oldValue) {
      let defaultFormat = DATETIME_FORMATS[this.schema.inputType.toLowerCase()]
      let m = fecha.parse(newValue, defaultFormat)
      if (m !== false) {
        if (this.schema.format) {
          newValue = fecha.format(m, this.schema.format)
        } else {
          newValue = m.valueOf()
        }
      }
      this.updateModelValue(newValue, oldValue)
    },
    formatNumberToModel (newValue, oldValue) {
      if (!isNumber(newValue)) {
        newValue = NaN
      }
      this.updateModelValue(newValue, oldValue)
    },
    onInput: debounce(function ($event) {
      let value = $event.target.value
      switch (this.schema.inputType.toLowerCase()) {
        case 'number':
        case 'range':
          if ($event.target.valueAsNumber) {
            value = $event.target.valueAsNumber
          }
          break
      }
      this.value = value
    }, DEBOUNCE_FORMAT_MS),
    onBlur () {
      if (isFunction(this.debouncedFormatFunc)) {
        this.debouncedFormatFunc.flush()
      }
    }
  },

  mounted () {
    switch (this.schema.inputType.toLowerCase()) {
      case 'number':
      case 'range':
        this.debouncedFormatFunc = debounce((newValue, oldValue) => {
          this.formatNumberToModel(newValue, oldValue)
        }
        , DEBOUNCE_FORMAT_MS, {
          trailing: true,
          leading: false
        })
        break
      case 'date':
      case 'datetime':
      case 'datetime-local':
        // wait 1s before calling 'formatDatetimeToModel' to allow user to input data
        this.debouncedFormatFunc = debounce((newValue, oldValue) => {
          this.formatDatetimeToModel(newValue, oldValue)
        }
        , DEBOUNCE_FORMAT_MS, {
          trailing: true,
          leading: false
        })
        break
    }
  },

  created () {
    let additionalValidators = []
    let requestedValidators = []

    if (this.fieldSchema.inputAttributes.required) {
      additionalValidators.push('required')
    }
    switch (this.schema.inputType.toLowerCase()) {
      case 'email':
        additionalValidators.push('email')
        break
      case 'date':
      case 'datetime':
      case 'datetime-local':
        additionalValidators.push('date')
        break
      case 'url':
        additionalValidators.push('url')
        break
    }

    if (isString(this.schema.validator)) {
      requestedValidators.push(this.schema.validator)
    } else if (isArray(this.schema.validator)) {
      requestedValidators = this.schema.validator
    }
    this.fieldSchema.validator = merge(requestedValidators, additionalValidators)
  }
}

</script>

<style lang='scss' scoped>
  .vue-form-generator .field-input {
    .wrapper {
      width: 100%
    }
    input[type='radio'] {
      width: 100%
    }
    input[type='color'] {
      width: 60px
    }
    input[type='range'] {
      padding: 0
    }

    .helper {
      margin: auto 0.5em
    }
  }
</style>
