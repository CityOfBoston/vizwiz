import nanoid from 'nanoid'

const state = {
  /**
   * An map of the managed items, keyed by the uid
   */
  items: {},
  /**
   * UID of each of the items, for ordering
   */
  itemsList: []
}

const getters = {
  allItems: state => {
    return state.itemsList.map(uid => state.items[uid])
  },
  getItem: (state) => (uid) => {
    return state.items[uid]
  },
}

const mutations = {
  /**
   * Delete a managed item by its `uid`
   *
   * This removes the item from both the `items` and `itemsList` stores.
   *
   * @param      {object}  state The state
   * @param      {string}  uid  The uid of the item to delete
   */
  DELETE_ITEM: (state, uid) => {
    const newItems = Object.assign({}, state.items)
    const index = state.itemsList.findIndex(item => item === uid)
    if (index > -1) {
      state.itemsList.splice(index, 1)
    }
    delete newItems[uid]
    state.items = newItems
  },
  /**
   * Add or update an item for management
   *
   * Adds the item to the store for management.
   * If the item does not have a `uid` attribute, it will add one.
   * Adds the item to both the `items` and `itemsList` stores
   *
   * @param      {object}  state    The state
   * @param      {object}  payload  The item to manage
   */
  UPDATE_ITEM: (state, payload) => {
    if (!payload.hasOwnProperty('uid')) {
      payload.uid = nanoid()
    }
    state.items = {...state.items, [payload.uid]: payload}
    if (state.itemsList.indexOf(payload.uid) === -1) {
      state.itemsList.push(payload.uid)
    }
  },
}

const actions = {
  /**
   * Delete a managed item by its `uid`
   *
   * Usage: `this.$store.dispatch('$_<namespace>/deleteItem', uid)
   *
   * @param      {string}    uid      The uid
   */
  deleteItem: ({commit}, uid) => {
    commit('DELETE_ITEM', uid)
  },
  /**
   * Add or update a managed item
   *
   * Usage: `this.$store.dispatch('$_<namespace>/updateItem', item)
   *
   * @param      {object}    item      The item
   */
  updateItem: ({commit}, item) => {
    commit('UPDATE_ITEM', item)
  },
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
}
