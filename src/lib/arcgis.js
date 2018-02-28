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
 * Returns an Array of Objects with keys name, type and url.
 *
 * @param      {String}  url     The URL to the ArcGIS endpoint
 * @return     {Array} An array of Objects with keys {name, type, url}
 */
async function getServices (url) {
  try {
    const response = await axios.get(url, {params: {f: 'json'}})
    return response.data.services
  } catch (error) {
    console.error(error)
    return []
  }
}

/**
 * An ArcGIS service endpoint with accessors for its parts
 *
 * @type       {class}
 */
var ArcGISService = class ArcGISService {
  /**
   * Requires an url to the root of the service, such as one returned from the
   * `getServices()` call.
   *
   * @param      {String}  url     The url to the REST endpoint
   */
  constructor (url) {
    this.baseUrl = url
  }

  /**
   * Return a list of the layers available
   *
   * @return     {Promise}  Eventually returns a list of `ArcGISLayer` objects
   */
  async layers () {
    try {
      if (this.baseUrl === '') {
        return []
      }
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

/**
 * A layer on an ArcGIS service endpoint
 *
 * @type       {class}
 */
var ArcGISLayer = class ArcGISLayer {
  /**
   * Constructs the object.
   *
   * @param      {String}  baseUrl  The base url for the REST endpoint. NOT the url for this layer.
   * @param      {Integer}  id       The identifier for the layer
   * @param      {String}  name     The name of the layer
   */
  constructor (baseUrl, id, name) {
    this.id = id
    this.name = name
    this.url = `${baseUrl}/${id}`
  }

  /**
   * Returns the fields available on the layer.
   *
   * The return field description object looks like:
   *
   * {<fieldname>: <fieldAttributes>, <fieldname>: <fieldAttributes>}
   *
   * fieldAttributes is an object with the following attributes:
   *
   * label: The human-readable version of the field name. ArcGIS's alias attribute.
   * type: A generalized field type provided by `ArcGISTypeMap`
   * visible: Is this field visible? Used for widgets that want to show only
   *    certain fields. Defaults to `false`
   * availableFilterTypes: An array of filter types that can be used by this field type
   * filterType: The selected filter type. Defaults to `'none'`
   * values: The distinct values of this field. Defaults to an empty array, and meant
   *    to be filled upon request.
   *
   * @return     {Promise}  A Field description object
   */
  async fields () {
    let noneArray = ['none']
    if (this.url === '') {
      return []
    }
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
  /**
   * Gets rows from an ArcGIS service, starting with startRow, and including
   * numRows. It will return an array of records without the geometry.
   *
   * @param      {<type>}   startRow  The starting row to fetch
   * @param      {<type>}   numRows   The number of rows to fetch
   * @return     {Promise}  The rows.
   */
  async getRows (startRow, numRows) {
    try {
      let params = {
        f: 'json',
        where: '1=1',
        outFields: '*',
        resultOffset: startRow,
        resultRecordCount: numRows || 1,
        returnGeometry: false,
      }
      return await axios.get(`${this.url}/query`, {params: params}).then(
        function (response) {
          let values = []
          response.data.features.forEach(function (item) {
            values.push(Object.assign({}, item.attributes))
          })
          return values
        }
      )
    } catch (error) {
      console.error(error)
      return []
    }
  }

  /**
   * Gets the distinct values for a field.
   *
   * This provides a way to query the ArcGIS service to return the distinct values
   * for a specific field. This is needed when you want to provide a `<select>`
   * filter, or are curious what type of data is in the field.
   *
   * @param      {String}   fieldName  The field name
   * @return     {Promise}  The distinct values as an array
   */
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
