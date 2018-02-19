<template>
  <div uk-modal>
    <div class="uk-modal-dialog uk-modal-body">
      <keep-alive><component
        :is="component"
        v-bind="properties"
        @cancel="onCancel"
        @save="onSave"
      ></component></keep-alive>
    </div>
  </div>
</template>

<script>
import UIKit from 'uikit'

export default {

  name: 'modal-dialog',
  props: {
    component: {
      type: Object,
      required: true,
    },
    properties: {
      type: Object,
      default () { return {} }
    },
  },
  methods: {
    show () {
      this.$mount()
      let modalsElem = document.getElementById('vizwiz-modals')
      modalsElem.appendChild(this.$el)
      UIKit.modal(this.$el, {escClose: false, bgClose: false}).show()
    },
    close () {
      let modal = UIKit.modal(this.$el)
      modal.hide()
    },
    onCancel () {
      this.close()
      this.$emit('cancel')
    },
    onSave (data) {
      this.close()
      this.$emit('save', data)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
