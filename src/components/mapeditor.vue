<template>
  <div>
    <h2>Edit Map</h2>
    <form class="uk-form-stacked" ref="data-source-entry" id="data-source-entry" action="#" method="post" v-on:submit.prevent>
      <div class="uk-margin">
        <label class="uk-form-label" for="data-find-user-location">
          <input
            id="data-find-user-location"
            v-model="findUserLocation"
            class="uk-checkbox"
            type="checkbox"
          >
          &ensp;Find user location when map loads
        </label>
      </div> <!-- uk-margin -->

      <div class="uk-margin">
        <label class="uk-form-label" for="data-show-zoom-control">
          <input
            id="data-show-zoom-control"
            v-model="showZoomControl"
            class="uk-checkbox"
            type="checkbox"
          >
          &ensp;Show zoom control
        </label>
      </div> <!-- uk-margin -->

      <div class="uk-margin">
        <label class="uk-form-label" for="data-show-legend">
          <input
            id="data-show-legend"
            v-model="showLegend"
            class="uk-checkbox"
            type="checkbox"
          >
          &ensp;Show legend
        </label>
      </div> <!-- uk-margin -->

      <fieldset class="uk-fieldset">
        <legend class="uk-legend">Address Search</legend>
        <div class="uk-margin">
          <label class="uk-form-label" for="data-search-for-address">
            <input
              id="data-search-for-address"
              v-model="searchForAddress"
              class="uk-checkbox"
              type="checkbox"
            >
            &ensp;Search for an address
          </label>
        </div> <!-- uk-margin -->

        <div class="uk-margin">
          <label class="uk-form-label" for="data-zoom-to-address">
            <input
              id="data-zoom-to-address"
              v-model="zoomToAddress"
              class="uk-checkbox"
              type="checkbox"
              :disabled="!searchForAddress"
            >
            &ensp;Zoom to address
          </label>
        </div> <!-- uk-margin -->

        <div class="uk-margin">
          <label class="uk-form-label" for="data-placeholder-text">Placeholder text</label>
          <div class="uk-form-controls">
            <input
              v-model="placeholderText"
              class="uk-input"
              id="data-placeholder-text"
              :disabled="!searchForAddress"
            >
          </div>
        </div> <!-- uk-margin -->

        <div class="uk-margin">
          <label class="uk-form-label" for="data-show-layer">Show data from layer</label>
          <div class="uk-form-controls">
            <select
              v-model="addressSearchPopupDataSourceUid"
              class="uk-select"
              id="data-show-layer"
              :disabled="!searchForAddress"
            >
              <option disabled value="">Please select one</option>
              <option :value="key" :key="key" v-for="(val, key) in dataLayers">{{ val }}</option>
            </select>
          </div>
        </div> <!-- uk-margin -->
      </fieldset>

      <div class="uk-panel">
        <div class="uk-float-right">
          <button
            class="uk-button uk-button-default"
            type="button"
            @click="onCancel">Cancel</button>
          <button
            class="uk-button uk-button-primary"
            type="button"
            @click="onSave">Save</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import nanoid from 'nanoid'

export default {

  name: 'map-editor',
  props: {
    uid: {
      type: String,
      default () { return nanoid() },
    },
    initialFindUserLocation: {
      type: Boolean,
      default () { return false },
    },
    initialSearchForAddress: {
      type: Boolean,
      default () { return false },
    },
    initialZoomToAddress: {
      type: Boolean,
      default () { return false },
    },
    initialShowZoomControl: {
      type: Boolean,
      default () { return true },
    },
    initialShowLegend: {
      type: Boolean,
      default () { return true },
    },
    initialPlaceholderText: {
      type: String,
      default () { return 'Search for an address...' },
    },
    dataLayers: {
      type: Object,
      required: true,
    },
    initialShowDataLayer: {
      type: String,
      default () { return '' },
    }
  },
  data () {
    return {
      findUserLocation: false,
      searchForAddress: false,
      zoomToAddress: false,
      placeholderText: 'Search for an address...',
      addressSearchPopupDataSourceUid: '',
      showZoomControl: false,
      showLegend: false,
    }
  },
  created () {
    this.findUserLocation = this.initialFindUserLocation
    this.searchForAddress = this.initialSearchForAddress
    this.zoomToAddress = this.initialZoomToAddress
    this.placeholderText = this.initialPlaceholderText
    this.addressSearchPopupDataSourceUid = this.initialShowDataLayer
    this.showZoomControl = this.initialShowZoomControl
    this.showLegend = this.initialShowLegend
    if (this.addressSearchPopupDataSourceUid === '') {
      this.addressSearchPopupDataSourceUid = Object.keys(this.dataLayers)[0]
    }
  },
  methods: {
    serialize () {
      return {
        uid: this.uid,
        latitude: '42.347316',
        longitude: '-71.065227',
        zoom: '12',
        showZoomControl: this.showZoomControl,
        showLegend: this.showLegend,
        findUserLocation: this.findUserLocation,
        searchForAddress: this.searchForAddress,
        zoomToAddress: this.zoomToAddress,
        placeholderText: this.placeholderText,
        addressSearchPopupDataSourceUid: this.addressSearchPopupDataSourceUid,
      }
    },
    onSave (data) {
      this.$emit('save', this.serialize())
    },
    onCancel () {
      this.findUserLocation = this.initialFindUserLocation
      this.searchForAddress = this.initialSearchForAddress
      this.zoomToAddress = this.initialZoomToAddress
      this.placeholderText = this.initialPlaceholderText
      this.addressSearchPopupDataSourceUid = this.initialShowDataLayer
      this.showZoomControl = this.initialShowZoomControl
      this.showLegend = this.initialShowLegend
      if (this.addressSearchPopupDataSourceUid === '') {
        this.addressSearchPopupDataSourceUid = Object.keys(this.dataLayers)[0]
      }
      this.$emit('cancel')
    },
  },
}
</script>

<style lang="css" scoped>
</style>
