<template>
  <div class='sel'>
    <label v-if='showLabel' :for='fieldId' class='sel-l sel-l--fw'>
      {{ fieldSchema.label }}
    </label>
    <div class="v-sel-c--fw">
      <vue-select
        :inputId='fieldId'
        :disabled='fieldSchema.selectAttributes.disabled'
        :options='fieldSchema.values'
        :value='valueLabel'
        :multiple='fieldSchema.selectAttributes.multiple'
        :placeholder='fieldSchema.noneSelectedText'
        :label='fieldSchema.labelKey'
        :on-change='modelChanged'
      ></vue-select>
    </div>
  </div>
</template>

<script>
import VueSelect from 'vue-select'
import abstractField from '../../lib/abstractField'
import { isObject, isNil } from 'lodash'

export default {
  name: 'selectInput',
  mixins: [abstractField],
  props: {
    defaultSchema: {
      type: Object,
      default () {
        return {
          help: '',
          hideNoneSelectedText: false,
          hint: '',
          label: '',
          labelKey: 'label',
          model: null,
          noneSelectedText: 'Nothing Selected',
          selectAttributes: {
            autofocus: false,
            disabled: false,
            multiple: false,
            required: false,
          },
          type: 'select-input',
          valueKey: 'value',
          values: []
        }
      }
    },
  },
  data () {
    return {
    }
  },
  computed: {
    showLabel () {
      return (this.fieldSchema.label && this.fieldSchema.inputType !== 'hidden')
    },
    valuesAreObjects () {
      return (this.fieldSchema.values.length > 0 && isObject(this.fieldSchema.values[0]))
    },
    /**
     * Return a mapping of labels => values
     */
    labelValueMap () {
      let resultMap = {}
      if (this.valuesAreObjects) {
        this.fieldSchema.values.forEach(item => {
          resultMap[item[this.fieldSchema.labelKey]] = item
        })
      } else {
        this.fieldSchema.values.forEach(item => {
          resultMap[item] = item
        })
      }
      return resultMap
    },
    /**
     * Return a mapping of values => labels
     */
    valueLabelMap () {
      let resultMap = {}
      if (this.valuesAreObjects) {
        this.fieldSchema.values.forEach(item => {
          resultMap[item[this.fieldSchema.valueKey]] = item
        })
      } else {
        this.fieldSchema.values.forEach(item => {
          resultMap[item] = item
        })
      }
      return resultMap
    },
    /**
     * Return the appropriate label for the value
     */
    valueLabel () {
      if (this.valuesAreObjects) {
        return this.valueLabelMap[this.value]
      } else {
        return this.value
      }
    },
  },
  methods: {
    modelChanged (val) {
      if (!isNil(this)) {
        if (this.valuesAreObjects) {
          this.value = val[this.fieldSchema.valueKey]
        } else {
          this.value = val
        }
      }
    },
  },
  components: {
    'vue-select': VueSelect,
  },
}
</script>

<style lang="scss">
.v-sel-c--fw {
  width: 100%;
  display: inline-block;
  position: relative;
  border: 3px solid #091f2f;
  border-radius: 0;
  height: calc(2 * 1rem + 2 * 3px + 1.5 * 1rem);

  .v-select {
    background-color: #fff;
    display: inline-block;
    font-family: Lora,Georgia,serif;
    font-size: 16px;
    font-size: 1rem;
    line-height: 2;
    padding: 0 85px 0 16px;
    height: 100%;
    margin: 0;
    box-sizing: border-box;
    width: 100%;
    position: default;
    .dropdown-toggle {
      border: 0;
      height: 100%;
    }
    .selected-tag {
      line-height: 3;
      height: 100%;
    }
    .open-indicator {
      &:before {
        background-image: url(//patterns.boston.gov/images/global/icons/chevron-down.svg);
        background-repeat: no-repeat;
        background-position: 50%;
        background-size: 20px;
        border: 0;
        width: 100%;
        height: 100%;
        transform: none;
      }
      position: absolute;
      z-index: 1;
      pointer-events: none;
      top: 0;
      bottom: 0;
      right: 0;
      border-left: 3px solid #091f2f;
      background: #288be4;
      width: 60px;
      height: 100%;
    }
    &.open {
      .open-indicator:before {
        transform: rotate(-180deg);
      }
    }
    input[type=search], input[type=search]:focus {
      font-family: Lora,Georgia,serif;
      height: 100%;
    }
    input[type=search]::-webkit-input-placeholder {
    font-style: italic;
    color: #828282;
    line-height: 3.5
    }

    input[type=search]:-ms-input-placeholder {
        font-style: italic;
        color: #828282;
        line-height: 3.5
    }

    input[type=search]::placeholder {
        font-style: italic;
        color: #828282;
        line-height: 3.5
    }

  }
}
</style>
