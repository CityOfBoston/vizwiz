# VizWiz configuration

## Filter object

| Property | Default | Accepted values | Description |
| -------- | ------- | --------------- | ----------- |
| `description` | none | `String` | A description to add at the top of the data filter |
| `fieldIdPrefix` | none | `String` | Prefix to add to every field's id. Will be prepended to ids explicity set in the schema, as well as auto-generated ones. |
| `form`   | *required* | `Array` | An array of [form items](#form-items) |
| `model`  | `{}`       | `Object` | The starting values for the form, and the object that gets modified when a change happens. |
| `title` | none | `String` | The title for this data filter |
| `vizId`  | *required* | `String` | The visualization ID to target when emitting change events. |


## Form items

Each form item *must* include the key `type` that is one of `text-input`, `select-input`, or `group`. Additional peroperties are required or used depending on the `type`. See [`input` reference](#form-item-type-input), [`select-input` reference](#form-item-type-select-input), and [`group` reference](#form-item-type-group) for more information.

## Form item type `text-input`

This is a form input widget whose widget may change based on the `inputType` value.

### `text-input` properties:

| Property    | Default | Accepted values | Description |
| ----------- | ------- | --------------- | ----------- |
| `help`      | none  | `String`  | show this help if mouse hover the question icon before the caption of field. You can use HTML elements too. |
| `hint`      | none  | `String`  | show this hint below the field |
| `inputAttributes` | `{}` | `Object` | Attributes to add to the `input`. See the table of available attributes to `inputType` |
| `inputType` | `'text'` | `String` | The type of input to expect. This may affect the widget. Accepted values are: `text`, `color`, `date`, `datetime-local`, `email`, `hidden`, `month`, `number`, `range`, `search`, `tel`, `time`, `url`, `week` |
| `label`     | none | `String` | Label of field |
| `model`     | none | `String` | Name of property in the model |
| `type`      | *required* | `String` | `text-input` |
| `validator` | none  | `String` or `String[]` | Validator for value. See [Input Validators](#input-validators) for detailed information |
| `visible`   | `true` | `Boolean` or `Function` | If false, field will be hidden. Equivalent to the `inputType` set to `hidden` |

### `inputAttributes` properties:

| Property | Default | Accepted values | Description |
| -------- | ------- | --------------- | ----------- |
| `accesskey` | none | `String` | Defines a keyboard shortcut to activate or add focus to the element. |
| `autocomplete` | none | `String` | Indicates whether the value of the control can be automatically completed by the browser. See [the WHATWG spec](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill) for a full list of values |
| `autofocus` | `false` | `Boolean` | Specify that a form control should have input focus when the page loads |
| `class` | none | `String` | Often used with CSS to style elements with common properties. |
| `disabled` | `false` | `Boolean` or `Function` | If true, field will be disabled. |
| `id`       | auto-generated | `String` | The id of the field. If not set, will be auto-generated from the slugified version of either: `schema.inputAttributes.Name`, `schema.label` or `schema.model`, in that order. If the `fieldIdPrefix` option is set, its value will be prepended to both manual & auto-generated ids. |
| `max`      | none | `Number` or `Datetime` | For inputTypes `date`, `datetime-local`, `month`, `number`, `range`, `time` or `week`, the maximum value for this item, which must not be less than its minimum (`min` attribute) value. |
| `maxlength` | none | `Number` | For `inputTypes` of `text`, `email`, `search`, `tel`, or `url`, this attribute specifies the maximum number of characters that the user can enter |
| `min`      | none | `Number` or `Datetime` | For `inputTypes` of `date`, `datetime-local`, `month`, `number`, `range`, `time` or `week`, the minimum value for this item, which must not be greater than its maximum (`max` attribute) value. |
| `minlength` | none | `Number` | For `inputTypes` of `text`, `email`, `search`, `tel`, or `url`, this attribute specifies the minimum number of characters that the user can enter. |
| `name`     | none  | `String`  | set name attribute to input field. |
| `pattern`  | none | `String` | For `inputTypes` of `text`, `search`, `tel`, `url`, or `email`, a regular expression that the control's value is checked against. The pattern must match the entire value, not just some subset. See [the RexExp definition](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) for more information. |
| `placeholder` | none | `String` | A hint to the user of what can be entered in the control . The placeholder text must not contain carriage returns or line-feeds. |
| `readonly` | `false` | `Boolean` | If `true`, this attribute indicates that the user cannot modify the value of the control. |
| `required` | `false` | `Boolean` | If true, this field must be filled (need to use validator). |
| `size` | none | `Number` | For `inputType` of `text`, `search`, `tel`, `url`, or `email`, this is initial size of the control in characters. Must be a positive integer. |
| `spellcheck` | none | `Boolean` or `default` | Setting the value of this attribute to true indicates that the element needs to have its spelling and grammar checked. The value default indicates that the element is to act according to a default behavior, possibly based on the parent element's own spellcheck value. The value false indicates that the element should not be checked. |
| `step` | none | `Number` or `any` | Works with the `min` and `max` attributes to limit the increments at which a numeric or date-time value can be set. It can be the string `any` or a positive floating point number. If this attribute is not set to `any`, the control accepts only values at multiples of the step value greater than the minimum. |
| `style` | none | 'String' | Defines CSS styles which will override styles previously set. |
| `tabindex` | none | `Number` | The position of the element in the tabbing navigation order for the current document. |
| `title` | none | `String` | Text to be displayed in a tooltip when hovering over the element. |

## Input Validators

There are several built-in validators. You can use one or more to validate your fields.

| Filter Name | Description            |
| ----------- | ---------------------- |
| `required`  | Raises an error if the field is empty. Automatically added if the field's `inputAttributes.required` is `true`. |
| `number`    | Raises an error if the field is not a valid number, or if the number is not within the range set by the field's `inputAttributes.min` or `inputAttributes.max`. |
| `integer`   | Raises the same errors as `number`, and an error if the field is not an integer. |
| `double`    | Raises the same errors as `number`, and an error if the field cannot be converted into a floating-point number. |
| `string`    | Raises an error if the field is not a valid string, or if the length of the string is not within the range set by the field's `inputAttributes.minlength` or `inputAttributes.maxlength`. |
| `date`      | Raises an error if the field is not a valid date, or if the date is not within the range set by the field's `inputAttributes.min` or `inputAttributes.max`. |
| `regexp`    | Raises an error if the field doesn't pass a regular expression. You _must_ add an additional `pattern` key to the field's `inputAttributes` object with the regular expression pattern. |
| `email`     | Raises an error if the field isn't formatted like an email address. |
| `url`       | Raises an error if the field isn't formatted like a URL. |
| `creditCard` | Raises an error if the field value doesn't pass a basic checksum validation. |
| `alpha`     | Raises an error if the field contains anything other than alphabetic characters. (No numbers, punctuation, spaces or other special characters) |
| `alphaNumeric` | Raises an error if the field contains anything other than alphabetic or numeric characters. (No punctuation, spaces or other special characters) |

## Form item type `select-input`

This formats a widget that allows the user to select from multiple options.

### `select-input` properties:

| Property | Default | Accepted values | Description |
| -------- | ------- | --------------- | ----------- |
| `help`     | none  | `String`  | show this help if mouse hover the question icon before the caption of field. You can use HTML elements too. |
| `hideNoneSelectedText` | `false` | `Boolean` | If `true`, hide the `noneSelectedText` when nothing is selected. |
| `hint`     | none  | `String`  | show this hint below the field |
| `label`    | none | `String` | Label of field |
| `labelKey` | 'label' | `String` | the property in each `values` item to use as the item's display label. |
| `model`    | none | `String` | Name of property in the model |
| `noneSelectedText` | `'Nothing Selected'` | `String` | The text to display when nothing is selected. |
| `selectAttributes` | `{}` | `Object` | Attributes to add to the `select-input`. See the table of available attributes to `inputType` |
| `type`   | *required* | `String` | `select-input` |
| `valueKey` | `value` | `String` | The property in each `values` item to use as the selected value. |
| `values` | `[]` | `Object[]`, `String[]` or `Function` | List of selectable items. If it is a  `Function`, it must return an array of `Object`s or `String`s. By default each object should contain at least `value` and `label` properties. `valueKey` and `labelKey` allow you to override the defaults. |

### `selectAttributes` properties:

| Property | Default | Accepted values | Description |
| -------- | ------- | --------------- | ----------- |
| `accesskey` | none | `String` | Defines a keyboard shortcut to activate or add focus to the element. |
| `autofocus` | `false` | `Boolean` | Specify that a form control should have input focus when the page loads |
| `class` | none | `String` | Often used with CSS to style elements with common properties. |
| `disabled` | `false` | `Boolean` or `Function` | If true, field will be disabled. |
| `id`       | auto-generated | `String` | The id of the field. If not set, will be auto-generated from the slugified version of either: `schema.inputAttributes.Name`, `schema.label` or `schema.model`, in that order. If the `fieldIdPrefix` option is set, its value will be prepended to both manual & auto-generated ids. |
| `multiple` | `false` | `Boolean` | If `true`,  indicates that multiple options can be selected in the list. |
| `name`     | none  | `String`  | set name attribute to input field. |
| `required` | `false` | `Boolean` | If true, this field must be filled. |
| `size` | none | `Number` | The number of items to show at a time. Must be a positive integer. |
| `style` | none | 'String' | Defines CSS styles which will override styles previously set. |
| `tabindex` | none | `Number` | The position of the element in the tabbing navigation order for the current document. |
| `title` | none | `String` | Text to be displayed in a tooltip when hovering over the element. |

## Form item type `group`

This group several fields together in an HTML `<fieldset>`.

### `group` properties:

| Property | Default | Accepted values | Description |
| -------- | ------- | --------------- | ----------- |
| `legend` | none | `String` | The caption for the content of this group |
| `fields` | `[]` | `Array` | An `Array` of form items with type `input` or `select-input`. You can not nest groups. |
| `groupAttributes` | `{}` | `Object` | Attributes for the `fieldset` tag. |

### `groupAttributes` properties:

| Property | Default | Accepted values | Description |
| -------- | ------- | --------------- | ----------- |
| `accesskey` | none | `String` | Defines a keyboard shortcut to activate or add focus to the element. |
| `autofocus` | `false` | `Boolean` | Specify that a form control should have input focus when the page loads |
| `class` | none | `String` | Often used with CSS to style elements with common properties. |
| `disabled` | `false` | `Boolean` or `Function` | If true, field will be disabled. |
| `id`       | none | `String` | The id of the fieldset. |
| `name`     | none  | `String`  | set name attribute to input field. |
| `style` | none | 'String' | Defines CSS styles which will override styles previously set. |
| `tabindex` | none | `Number` | The position of the element in the tabbing navigation order for the current document. |
| `title` | none | `String` | Text to be displayed in a tooltip when hovering over the element. |

