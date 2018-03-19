<template>
  <fieldset class="uk-fieldset">
    <legend class="uk-legend">{{ title }} <button class="uk-button uk-button-primary uk-button-small"
        @click="createItem">Add Item</button></legend>
    <div class='uk-panel uk-width-1-1'>
      <ul class='uk-list uk-list-divider'>
        <list-item
          v-for='item in items'
          :key='item.uid'
          :item='item'
          @delete-item='onDeleteItem'
          @edit-item='onEditItem'
        ></list-item>
      </ul>
    </div>
  </fieldset>
</template>

<script>
import ListItem from './listitem.vue'

export default {
  name: 'list-container',
  components: {
    ListItem,
  },
  props: {
    items: {
      type: Array,
      default () { return [] },
    },
    /**
     * The headline to use above the items
     */
    title: {
      type: String,
      default () { return 'Items' }
    },
  },
  data () {
    return { }
  },
  methods: {
    createItem () {
      this.$emit('edit-item', null)
    },
    onDeleteItem (key) {
      this.$emit('delete-item', key)
    },
    onEditItem (key) {
      this.$emit('edit-item', key)
    },
  },
}
</script>

<style lang="css" scoped>
</style>
