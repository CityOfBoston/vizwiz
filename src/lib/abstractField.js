import { get as objGet, isFunction, isNil, debounce, isArray, isString } from 'lodash'
import deepmerge from 'deepmerge'
import { validators } from './validators'
import { slugifyFormID } from './slugify'

function convertValidator (validator) {
  if (isString(validator)) {
    if (validators[validator] != null) {
      return validators[validator]
    } else {
      console.warn(`'${validator}' is not a validator function!`)
      return null // caller needs to handle null
    }
  }
  return validator
}

const DEBOUNCE_TIME = 500

export default {
  props: {
    schema: {
      type: Object,
      required: true,
    },
    fieldIdPrefix: {
      type: String,
      default () { return '' }
    },
    model: {
      type: Object,
      default () { return {} }
    },
    vizId: {
      type: String,
      default () { return '' }
    },
    defaultSchema: {
      type: Object,
      default () { return {} }
    }
  },

  data () {
    return {
      fieldSchema: {},
      errors: [],
      debouncedValidateFunc: null,
      debouncedFormatFunction: null,
    }
  },

  computed: {
    fieldId () {
      return slugifyFormID(this.fieldSchema, this.fieldIdPrefix)
    },
    value: {
      cache: false,
      get () {
        let val
        if (isFunction(this.fieldSchema.get)) {
          val = this.fieldSchema.get(this.model)
        } else if (this.model && this.fieldSchema.model) {
          val = objGet(this.model, this.fieldSchema.model)
        }
        if (isNil(val)) {
          if (this.fieldSchema.default) {
            val = this.fieldSchema.default
          } else {
            val = ''
          }
        }
        return this.formatValueToField(val)
      },

      set (newValue) {
        let oldValue = this.value
        newValue = this.formatValueToModel(newValue)

        if (isFunction(newValue)) {
          newValue(newValue, oldValue)
        } else {
          this.updateModelValue(newValue, oldValue)
        }
      }
    }
  },
  created () {
    this.fieldSchema = deepmerge.all([this.defaultSchema, this.schema])
  },
  methods: {
    /**
     * This is a way to merge classes with the requested classes from the schema
     */
    getFieldClass (...newClasses) {
      let askedForClasses = this.fieldSchema.inputAttributes.class || []
      if (this.errors.length > 0) {
        askedForClasses.push('txt-f--err')
      }
      return newClasses.concat(askedForClasses).join(' ')
    },
    validate (calledParent) {
      this.clearValidationErrors()
      let validateAsync = false

      let results = []

      if (this.fieldSchema.validator && this.fieldSchema.inputAttributes.readonly !== true && this.fieldSchema.inputAttributes.disabled !== true) {
        let validators = []
        if (!isArray(this.fieldSchema.validator)) {
          validators.push(convertValidator(this.fieldSchema.validator).bind(this))
        } else {
          this.fieldSchema.validator.forEach((validator) => {
            validators.push(convertValidator(validator).bind(this))
          })
        }

        validators.forEach((validator) => {
          if (validateAsync) {
            results.push(validator(this.value, this.fieldSchema, this.model))
          } else {
            let result = validator(this.value, this.fieldSchema, this.model)
            if (result && isFunction(result.then)) {
              result.then((err) => {
                if (err) {
                  this.errors = this.errors.concat(err)
                }
                let isValid = this.errors.length === 0
                this.$emit(this.vizId + '.validated', isValid, this.errors, this)
              })
            } else if (result) {
              results = results.concat(result)
            }
          }
        })
      }

      let handleErrors = (errors) => {
        let fieldErrors = []
        errors.forEach((err) => {
          if (isArray(err) && err.length > 0) {
            fieldErrors = fieldErrors.concat(err)
          } else if (isString(err)) {
            fieldErrors.push(err)
          }
        })
        if (isFunction(this.fieldSchema.onValidated)) {
          this.fieldSchema.onValidated.call(this, this.model, fieldErrors, this.fieldSchema)
        }

        let isValid = fieldErrors.length === 0
        if (!calledParent) {
          this.$emit(this.vizId + 'validated', isValid, fieldErrors, this)
        }
        this.errors = fieldErrors
        return fieldErrors
      }

      if (!validateAsync) {
        return handleErrors(results)
      }

      return Promise.all(results).then(handleErrors)
    },

    debouncedValidate () {
      if (!isFunction(this.debouncedValidateFunc)) {
        this.debouncedValidateFunc = debounce(this.validate.bind(this), DEBOUNCE_TIME)
      }
      this.debouncedValidateFunc()
    },

    updateModelValue (newValue, oldValue) {
      this.debouncedValidate()

      let changed = false
      if (isFunction(this.fieldSchema.set)) {
        this.fieldSchema.set(this.model, newValue)
        changed = true
      } else if (this.fieldSchema.model) {
        this.setModelValueByPath(this.fieldSchema.model, newValue)
        changed = true
      }

      if (changed) {
        this.$emit('modelchanged', newValue, this.fieldSchema.model)
      }
    },

    clearValidationErrors () {
      this.errors.splice(0)
    },

    setModelValueByPath (path, value) {
      // convert array indexes to properties
      let s = path.replace(/\[(\w+)\]/g, '.$1')

      // strip a leading dot
      s = s.replace(/^\./, '')

      let o = this.model
      const a = s.split('.')
      let i = 0
      const n = a.length
      while (i < n) {
        let k = a[i]
        if (i < n - 1) {
          if (o[k] !== undefined) {
            // Found parent property. Step in
            o = o[k]
          } else {
            // Create missing property (new level)
            this.$root.$set(o, k, {})
            o = o[k]
          }
        } else {
          // Set final property value
          this.$root.$set(o, k, value)
          return
        }

        ++i
      }
    },

    formatValueToField (value) {
      return value
    },

    formatValueToModel (value) {
      return value
    }
  }
}
