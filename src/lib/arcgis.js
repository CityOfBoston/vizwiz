import axios from 'axios'

/**
 * Map from ESRI field types to generic field types
 *
 * @type       {Map}
 */
const ArcGISTypeMap = new Map([
  ['esriFieldTypeSmallInteger', 'Integer'],
  ['esriFieldTypeInteger', 'Integer'],
  ['esriFieldTypeString', 'String'],
  ['esriFieldTypeOID', 'Integer'],
  ['esriFieldTypeSingle', 'Float'],
  ['esriFieldTypeDouble', 'Float'],
  ['esriFieldTypeDate', 'Date'],
  ['esriFieldTypeGeometry', 'Geometry'],
  ['esriFieldTypeBlob', 'Object'],
  ['esriFieldTypeRaster', 'Image'],
  ['esriFieldTypeGUID', 'String'],
  ['esriFieldTypeGlobalID', 'String'],
])

/**
 * Map from datatypes to filter types
 *
 * All available filter types are:
 * text, color, date, datetime-local, email, hidden, month, number, range,
 * search, tel, time, url, week
 *
 * @type       {Map}
 */
const AvailableFilterTypeMap = new Map([
  ['Integer', ['select-one', 'select-multiple', 'number', 'range', 'datetime-local']],
  ['Float', ['select-one', 'select-multiple', 'number', 'range']],
  ['Geometry', []],
  ['Object', []],
  ['Date', ['datetime-local', 'date', 'date-range']],
  ['String', ['select-one', 'select-multiple', 'text', 'color', 'email', 'number', 'tel', 'url', 'datetime-local', 'month', 'time', 'week']],
])

/**
 * Gets the services from an ArcGIS endpoint
 *
 * The callback gets an Array of Objects with keys name, type and url.
 *
 * @param      {String}  url     The URL to the ArcGIS endpoint
 * @return     {Array} An array of Objects with keys {name, type, url}
 */
async function getServices (url) {
  try {
    console.log('getServices', url)
    const response = await axios.get(url, {params: {f: 'json'}})
    return response.data.services
  } catch (error) {
    console.error(error)
    return []
  }
}

var ArcGISService = class ArcGISService {
  constructor (url) {
    this.baseUrl = url
  }

  async layers () {
    try {
      let baseUrl = this.baseUrl
      return await axios.get(this.baseUrl, {params: {f: 'json'}}).then(
        function (response) {
          let layerArray = []
          response.data.layers.forEach(item => {
            layerArray.push(new ArcGISLayer(baseUrl, item.id, item.name))
          })
          return layerArray
        })
    } catch (error) {
      console.error(error)
      return []
    }
  }
}

var ArcGISLayer = class ArcGISLayer {
  constructor (baseUrl, id, name) {
    this.id = id
    this.name = name
    this.url = `${baseUrl}/${id}`
  }

  async fields () {
    let noneArray = ['none']
    try {
      return await axios.get(this.url, {params: {f: 'json'}}).then(
        function (response) {
          let fieldObj = {}
          response.data.fields.forEach(item => {
            fieldObj[item.name] = {
              label: item.alias,
              type: ArcGISTypeMap.get(item.type) || 'Unknown',
              visible: false,
              availableFilterTypes: noneArray.concat(AvailableFilterTypeMap.get(ArcGISTypeMap.get(item.type)) || []),
              filterType: 'none',
              values: [],
            }
          })
          return fieldObj
        })
    } catch (error) {
      console.error(error)
      return []
    }
  }

  async getDistinctValues (fieldName) {
    try {
      let params = {
        f: 'json',
        where: '1=1',
        outFields: fieldName,
        returnDistinctValues: true,
        returnGeometry: false,
      }
      return await axios.get(`${this.url}/query`, {params: params}).then(
        function (response) {
          let values = []
          response.data.features.forEach(function (item) {
            values.push(item.attributes[fieldName])
          })
          return values
        }
      )
    } catch (error) {
      console.error(error)
      return []
    }
  }
}

export { getServices, ArcGISService, ArcGISLayer }
