<template>
  <li class="uk-list-item">
    <div uk-grid>
      <div class="uk-width-expand">
        <span class="uk-text-middle">{{ item.label }}</span>
      </div>
      <div class='uk-width-auto'>
        <button class="uk-button uk-button-primary uk-button-small" @click="onEditItem">Edit</button>
        <button class="uk-button uk-button-danger uk-button-small" @click="onDeleteItem">Delete</button>
      </div>
    </div>
  </li>
</template>

<script>
import Vue from 'vue'
import ModalDialog from '../modaldialog.vue'

export default {

  name: 'list-item',
  props: {
    itemDescription: {
      type: String,
      default () { return '' }
    },
    initialItem: {
      type: Object
    },
  },
  data () {
    return {
      ModalDialogClass: Vue.extend(ModalDialog),
      dialogInstance: null,
      item: null,
    }
  },
  methods: {
    onEditItem () {
      if (this.dialogInstance === null) {
        this.dialogInstance = new this.ModalDialogClass({
          propsData: {
            component: this.item.$options,
            properties: this.item.$props
          }
        })
        this.dialogInstance.$on('cancel', this.onCancel)
        this.dialogInstance.$on('save', this.onSave)
      }
      this.dialogInstance.show()
    },
    onSave (data) {
      if (this.dialogInstance !== null) {
        this.$set(this, 'dialogInstance', null)
      }
      this.$set(this.item, 'selectedDataSourceType', data.type)
      this.$set(this.item, 'selectedAttributes', Object.assign({}, data.attributes))
      this.$set(this.item, 'selectedIcon', data.icon)
      this.$set(this.item, 'selectedClusterPoints', data.cluster_icons)
      this.$set(this.item, 'selectedPolygonStyle', data.polygon_style)
      this.$set(this.item, 'selectedPopover', data.popover)
      this.$set(this.item, 'selectedLegendLabel', data.layerLabel)
      this.$emit('change-item', data)
    },
    onCancel () {
      // do nothing for now
    },
    onDeleteItem () {
      this.$emit('delete-item', this.uid)
    },
    serialize () {
      return this.item.configObject
    }
  },
  created () {
    this.item = this.initialItem
  }
}
</script>

<style lang="css" scoped>
</style>
