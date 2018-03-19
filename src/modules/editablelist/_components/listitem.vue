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
export default {

  name: 'list-item',
  props: {
    /**
     * `item` is the item to render.
     *
     * Must be an object with at least the `uid` and `label` attributes
     */
    item: {
      type: Object,
      required: true
    },
  },
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    onEditItem () {
      this.$emit('edit-item', this.item.uid)
    },
    onDeleteItem () {
      this.$emit('delete-item', this.item.uid)
    },
  },
}
</script>

<style lang="css" scoped>
</style>
