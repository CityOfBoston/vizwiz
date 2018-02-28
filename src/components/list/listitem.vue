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
    uid: {
      type: String,
      required: true
    },
    editor: {
      type: Function,
      required: true
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
      this.$set(this, 'dialogInstance', null)
      let tempItem = {
        uid: data.uid,
        dataSourceType: data.type,
        attributes: Object.assign({}, data.attributes),
        icon: data.icon,
        clusterPoints: data.clusterIcons,
        polygonStyle: data.polygonStyle,
        popover: data.popover,
        legendLabel: data.legendLabel,
      }
      this.$store.dispatch('updateDataSource', tempItem)
      this.$emit('change-item', data)
      this.item = new this.EditorClass({
        propsData: this.$store.getters.getDataSourceById(this.uid)
      })
    },
    onCancel () {
      this.$set(this, 'dialogInstance', null)
    },
    onDeleteItem () {
      this.$emit('delete-item', this.uid)
    },
    serialize () {
      return this.item.configObject
    }
  },
  created () {
    this.EditorClass = Vue.extend(this.editor)
    this.item = new this.EditorClass({
      propsData: this.$store.getters.getDataSourceById(this.uid)
    })
  }
}
</script>

<style lang="css" scoped>
</style>
