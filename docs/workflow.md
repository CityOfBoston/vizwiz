# Workflow notes

## Requirements

- At least one data source

You need a datasource to visualize. Current supported data sources are:

- ???
- ???
- ???

## Adding a filter

- How does the user pick the fields and methods for filtering?

Ideal:
  - User picks a datasource
  - Something reads the datasource and provides a listing of the fields available for filtering
    - We should have a field-type to available methods for filtering map
    - Don't need to have a character field use a range widget
  - Filter field data needed:
    - Label (display name)
    - Field name (from the data source)
    - Type of filter widget
      - For select types, a method to get all available options is necessary
    - Extra options (Input Attributes)
    - Hierarchical organization of the filters (groupings, etc)
  - Adds optional Title and Description of the filter widget
  - Adds optional defaults
  - Adds `vizId`


## ArcGIS getting info

https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services/food_trucks_schedule/FeatureServer?f=json

get layers from `.layers` id in `id` field

Get fields in layer:
https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services/food_trucks_schedule/FeatureServer/<id>?f=json

get fields from `.fields`
  - field name: `name`
  - type: `type`
  - label: `alias`

Get distinct values for field

https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services/food_trucks_schedule/FeatureServer/<id>/query?f=json&where=1%3D1&outFields=<fieldname>&returnDistinctValues=true&returnGeometry=false

  http "https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services/food_trucks_schedule/FeatureServer/0/query?f=json&where=1%3D1&outFields=Day&returnDistinctValues=true&returnGeometry=false

get values via:
`.attributes.<fieldname>`  for each in `.features`
```javascript
function getValues(fieldName, data) {
    let values = []
    data.features.forEach(function(item) {
      values.push(item.attributes[fieldName])
    });
    return values
}
```

