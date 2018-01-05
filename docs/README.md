# vizwiz

> A data visualization widget library

Vizwiz contains several widgets to help with data vizualization. They are meant to work together, communicating via custom JavaScript events.

## How they work

Widgets are linked together via a common vizualization ID, or `vizId`. Each widget can generate and/or listen to events prefixed with the appropriate `vizId`.

## Events

Events are issued at the `document` level using the [CustomEvent Web API](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent). The `name` of the event is formatted `'<vizId>.<eventType>'`, where `vizId` is the visualization ID, and `eventType` is one of the recognized types of events.

The `detail` key of the event's context is set to different values depending on the type of event.

### `filter` event type

This signals that the user wants to filter the visualization, such as returning all values whose `time` field equals `Breakfast`.

The `detail` of the event is an `Object` with the filter data. For example:

```javascript
{
  detail: {
    time: 'Breakfast',
    day: null
  }
}
```

This indicates that the data should filter only where `time` is equal to `Breakfast`. Since `day` is `null`, we know that no `day` has been specified for the filter.

Filter values can take several forms, depending on the data set. For example, `day` might be a `String` (`'Monday'`) or an `Array` of `String` (`['Monday', 'Wednesday', 'Friday']`). When listening to `filter` events, be generous with the values you allow.

### `select` event type

This signals that the user selected one or more specific records. This differs from a `filter` event, in that there is a known quantity selected.

The `detail` of the event is either an `Array` of `Object`s or a single `Object` with (ideally) all the data for the items selected. For example, one item selected:

```javascript
{
  detail: {
    id: 14,
    time: 'Breakfast',
    day: 'Monday',
    truck: 'Coffee Trike',
    location: 'State Street'
  }
}
```

Or two items selected:

```javascript
{
  detail: [{
    id: 14,
    time: 'Breakfast',
    day: 'Monday',
    truck: 'Coffee Trike',
    location: 'State Street'
  }, {
    id: 268,
    time: 'Breakfast',
    day: 'Tuesday',
    truck: 'Morning Salue',
    location: 'State Street'
  }]
}
```

To indicate that everything has been de-selected, raise a `select` event with a `detail` set to a falsey value (`null`, `[]`, `''`, `false`, or `{}`).

## Build Setup

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:8080
yarn run dev

# build for production with minification
yarn run build

# build for production and view the bundle analyzer report
yarn run build --report

# run all tests
yarn test

# Run the documentation server at localhost:3000
yarn run docs
```

