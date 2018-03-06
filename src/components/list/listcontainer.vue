<template>
  <div class='uk-panel uk-width-1-1'>
    <ul class='uk-list uk-list-divider'>
      <list-item
        v-for='item in items'
        :key='item.uid'
        :uid='item.uid'
        :editor='EditorClass'
        @delete-item='onDeleteItem'
        @change-item='onChangeItem'
      ></list-item>
    </ul>
    <div class='uk-panel uk-margin'>
      <button class="uk-button uk-button-primary uk-float-right"
      @click="createItem">Add Item</button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import ListItem from './listitem.vue'
import ModalDialog from '../modaldialog.vue'

export default {
  name: 'list-container',
  components: {
    ListItem,
  },
  props: {
    editor: {
      type: Object,
      required: true
    },
  },
  data () {
    return {
      ModalDialogClass: Vue.extend(ModalDialog),
      EditorClass: null,
      dialogInstance: null,
      items: {},
    }
  },
  methods: {
    createItem () {
      this.dialogInstance = new this.ModalDialogClass({
        propsData: {
          component: this.editor,
          properties: {}
        }
      })
      this.dialogInstance.$on('cancel', this.onCancelNewItem)
      this.dialogInstance.$on('save', this.onSaveNewItem)
      this.dialogInstance.show()
    },
    onDeleteItem (key) {
      let temp = Object.assign({}, this.items)
      delete temp[key]
      this.items = temp
    },
    onChangeItem (data) {
      this.$store.dispatch('updateDataSource', data)
    },
    onCancelNewItem () {
      this.dialogInstance = null
    },
    onSaveNewItem (data) {
      this.$store.dispatch('updateDataSource', data)
      let newItem = new this.EditorClass({
        propsData: {
          uid: data.uid,
          dataSourceType: data.type,
          attributes: Object.assign({}, data.attributes),
          icon: data.icon,
          clusterPoints: data.clusterIcons,
          polygonStyle: data.polygonStyle,
          popover: data.popover,
        }
      })
      let tempObj = {}
      tempObj[newItem.uid] = newItem
      this.items = Object.assign({}, this.items, tempObj)
      this.dialogInstance = null
      this.$emit('list-changed')
    },
    serialize () {
      let serialized = []
      for (let item in this.items) {
        serialized.push(this.items[item].configObject)
      }

      return serialized
    }
  },
  computed: {
  },
  mounted () {
    this.EditorClass = Vue.extend(this.editor)
    this.items = {}
    this.$on('cancel', this.onCancel)
    for (let item of this.$store.getters.allDataSources) {
      this.items[item.uid] = new this.EditorClass({
        propsData: {
          uid: item.uid,
          dataSourceType: item.type,
          attributes: Object.assign({}, item.attributes),
          icon: item.icon,
          clusterPoints: item.clusterIcons,
          polygonStyle: item.polygonStyle,
          popover: item.popover,
        }
      })
    }
  },
}
</script>

<style lang="css" scoped>
</style>
