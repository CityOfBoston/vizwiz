<template>
    <list-container
      :items="displayItems"
      :title="title"
      @delete-item="onDeleteItem"
      @edit-item="onEditItem"
    />
</template>

<script>
/**
 * The editable-list-module manages the CRUD of a list of complex objects.
 *
 * It maintains its own namespaced store to make this process easier.
 *
 * The inspiriation of the structure of this is from:
 * https://medium.com/3yourmind/large-scale-vuex-application-structures-651e44863e2f
 */

import Vue from 'vue'
import ListContainer from './_components/listcontainer.vue'
import store from './_store'
import ModalDialog from 'components/modaldialog.vue'

export default {
  name: 'editable-list-module',
  components: {
    ListContainer,
  },
  props: {
    /**
     * The namespace to use in the app's store. Defaults to `$_list`.
     */
    namespace: {
      type: String,
      default () { return '$_list' },
    },

    /**
     * The initial items to populate the list with. Expecting an array of objects.
     */
    defaultItems: {
      type: Array,
      default () { return [] },
    },

    /**
     * The Vue component for editing the data within the list. Renders this
     * component in a modal for editing, and uses a `label` attribute for rendering
     * the item in the list.
     */
    editor: {
      type: Object,
      required: true
    },

    /**
     * The headline to use above the items
     */
    title: {
      type: String,
      default () { return 'Items' }
    },
  },
  computed: {
    /**
     * Return all the items in the store
     *
     * @return     {[Object]}  An array of objects from the store
     */
    items () {
      return this.$store.getters[`${this.namespace}/allItems`]
    },

    /**
     * Returns an array for rendering in the children components
     *
     * @returns [{uid: '', label: ''}]
     */
    displayItems () {
      let returnArray = []
      this.items.forEach((item) => {
        item.namespace = this.namespace
        let editor = new this.EditorClass({
          propsData: item
        })
        editor.namespace = this.namespace
        returnArray.push({uid: item.uid, label: editor.label})
      })

      return returnArray
    },
  },
  data () {
    return {
      ModalDialogClass: Vue.extend(ModalDialog),
      dialogInstance: null,

      /**
       * This contains the Class to edit the items. It is also used to get the
       * `label` attribute for display.
       *
       * It is set on the `created()` method.
       */
      EditorClass: null,
    }
  },
  methods: {
    /**
     * Gets the item with key `uid` from the store.
     *
     * @param      {string}  uid     The uid of the object to retreive
     * @return     {object}  The item from the store.
     */
    getItem (uid) {
      return this.$store.getters[`${this.namespace}/getItem`](uid)
    },

    /**
     * Delete the item with key `uid` from the store
     *
     * @param      {string}  uid     The uid of the object to delete
     */
    deleteItem (uid) {
      this.$store.dispatch(`${this.namespace}/deleteItem`, uid)
    },

    /**
     * Add or update an item in the store.
     *
     * If the object has a `uid` attribute the object with that `uid` is
     * replaced with the data passed.
     *
     * If the object does not have a `uid` attribute, once is added with a
     * random `uid` and the item is added to the store.
     *
     * @param      {object}  data    The data to add or replace
     */
    updateItem (data) {
      this.$store.dispatch(`${this.namespace}/updateItem`, data)
    },

    /**
     * Show the edit/create dialog.
     *
     * Load the item `uid` if it is not null to populate the fields.
     *
     * @param      {string}  uid     The uid
     */
    editItem (uid) {
      let props = {namespace: this.namespace}
      if (uid !== null) {
        props = this.getItem(uid)
      }
      this.dialogInstance = new this.ModalDialogClass({
        propsData: {
          component: this.editor,
          properties: props
        }
      })
      this.dialogInstance.$on('cancel', this.onCancelEditItem)
      this.dialogInstance.$on('save', this.onSaveItem)
      this.dialogInstance.show()
    },

    /**
     * Cleanup anything after the dialog for editing an item was cancelled
     */
    onCancelEditItem () {
      this.dialogInstance = null
    },

    /**
     * Delete the item with `uid` from the store
     *
     * @param      {string}  uid     The uid
     */
    onDeleteItem (uid) {
      this.deleteItem(uid)
    },

    /**
     * Edit (or add) an item with `uid` from the store.
     *
     * If `uid` is null, a new item with a random `uid` is created and edited
     * If `uid` doesn't exist, a new item with that `uid` is created and edited
     *
     * @param      {string}  uid     The uid
     */
    onEditItem (uid) {
      this.editItem(uid)
    },

    /**
     * The save button was clicked on the edit/create dialog.
     *
     * @param      {Object}  data    The data to store.
     */
    onSaveItem (data) {
      this.updateItem(data)
      this.dialogInstance = null
    },
  },
  created () {
    this.EditorClass = Vue.extend(this.editor)
    this.$store.registerModule(this.namespace, store)
    this.defaultItems.forEach(item => {
      this.updateItem(item)
    })
  },
}
</script>

<style lang="css" scoped>
</style>
