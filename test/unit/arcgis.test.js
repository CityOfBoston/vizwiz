import { getServices, ArcGISService } from '../../src/lib/arcgis.js'

describe('ArcGIS API', () => {
  test('Get Services', () => {
    getServices('https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services').then(services => {
      expect(services.length).toBeGreaterThan(1)
    })
  })
  test('ArcGIS Service', () => {
    const service = new ArcGISService('https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services/food_trucks_schedule/FeatureServer')
    service.layers().then(layers => {
      expect(layers.length).toEqual(1)
    })
  })
  test('ArcGIS Layer', () => {
    const service = new ArcGISService('https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services/food_trucks_schedule/FeatureServer')
    service.layers().then(layers => {
      layers[0].fields().then(fields => {
        expect(fields.length).toEqual(1)
      })
    })
  })
})
