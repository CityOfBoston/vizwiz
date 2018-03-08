<template>
  <div uk-modal>
    <div class="uk-modal-dialog uk-modal-body">
      <component
        :is="component"
        v-bind="properties"
        @keyup.esc="onCancel"
        @keyup.enter="onSave"
        @cancel="onCancel"
        @save="onSave"
      ></component>
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
      let htmlElem = document.getElementsByTagName('html')[0]
      modal.hide()
      // For some reason this class is getting left behind. It might be a bug
      // in UIKit or the way I'm doing closing it. This removes the class.
      htmlElem.className = htmlElem.className.replace(/(?:^|\s)uk-modal-page(?!\S)/g, '')
    },
    onCancel () {
      this.close()
      this.$emit('cancel')
      this.$el.remove()
    },
    onSave (data) {
      this.close()
      this.$emit('save', data)
      this.$el.remove()
    }
  }
}
</script>

<style lang="css" scoped>
</style>
