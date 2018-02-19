<template>
  <div class='uk-panel uk-width-1-1'>
    <ul class='uk-list uk-list-divider'>
      <list-item
        v-for='item in items'
        :key='item.uid'
        :initialItem='item'
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

let maxUID = 0

export default {
  name: 'list-container',
  components: {
    ListItem,
  },
  props: {
    /**
     * An array of items to use in the list
     */
    initialItems: {
      type: Array,
      default () { return [] }
    },
    editor: {
      type: Object,
      required: true
    },
  },
  data () {
    return {
      currentItem: {},
      ModalDialogClass: Vue.extend(ModalDialog),
      EditorClass: null,
      dialogInstance: null,
      items: null,
    }
  },
  methods: {
    getNextUID () {
      maxUID++
      return maxUID
    },
    createItem () {
      this.currentItem = {}
      this.dialogInstance = new this.ModalDialogClass({
        propsData: {
          component: this.editor,
          properties: this.currentItem
        }
      })
      this.dialogInstance.$on('cancel', this.onCancelNewItem)
      this.dialogInstance.$on('save', this.onSaveNewItem)
      this.dialogInstance.show()
    },
    onDeleteItem (key) {
      console.log('onDeleteItem', key)
    },
    onChangeItem (data) {
      this.$emit('list-changed', this.serialize())
    },
    onCancelNewItem () {
      if (this.dialogInstance) {
        delete this.dialogInstance
        this.dialogInstance = null
      }
    },
    onSaveNewItem (data) {
      let newItem = new this.EditorClass({
        propsData: {
          uid: this.getNextUID(),
          dataSourceType: data.type,
          attributes: Object.assign({}, data.attributes),
          icon: data.icon,
          clusterPoints: data.cluster_icons,
          polygonStyle: data.polygon_style,
          popover: data.popover,
        }
      })
      let tempObj = {}
      tempObj[newItem.uid] = newItem
      this.items = Object.assign({}, this.items, tempObj)
      if (this.dialogInstance) {
        delete this.dialogInstance
        this.dialogInstance = null
      }
      this.$emit('list-changed', this.serialized())
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
    for (let item of this.initialItems) {
      if (item.uid > maxUID) {
        maxUID = item.uid
      }
      this.items[item.uid] = item
    }
  },
}
</script>

<style lang="css" scoped>
</style>
