import { getServices, ArcGISService } from '../../src/lib/arcgis.js'

describe('ArcGIS API', () => {
  test('Get Services', () => {
    let services = getServices('https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services')
    console.log(services)
    expect(services.length).toBeGreaterThan(1)
  })
  test('ArcGIS Service', () => {
    let service = new ArcGISService('https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services/food_trucks_schedule/FeatureServer')
    let layers = service.layers()
    expect(layers.length).toEqual(1)
  })
  test('ArcGIS Layer', () => {
    let service = new ArcGISService('https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services/food_trucks_schedule/FeatureServer')
    let layers = service.layers()
    let fields = layers.fields()
    expect(fields.length).toEqual(1)
  })
})
