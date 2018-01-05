/**
 * Convert the string into a URL-compatible slug
 *
 * @param      {string}  name    The string to slugify
 * @return     {string}  The slugified string
 */
function slugify (name = '') {
  // Return the slugified version of name
  return name
    .toString()
    .trim()
    .toLowerCase()
    // Spaces & underscores to dashes
    .replace(/ |_/g, '-')
    // Multiple dashes to one
    .replace(/-{2,}/g, '-')
    // Remove leading & trailing dashes
    .replace(/^-+|-+$/g, '')
    // Remove anything that isn't a (English/ASCII) letter, number or dash.
    .replace(/([^a-zA-Z0-9-]+)/g, '')
}

/**
 * Provide a form ID string for a field and an optional prefix
 *
 * The result will use the first of the `id`, `inputName`, `label` or
 * `model`.
 *
 * @param      {Object}  schema  The field definition
 * @param      {string}  prefix  Optional. The prefix for the form
 * @return     {string}  The ID to use for the ID
 */
function slugifyFormID (schema, prefix = '') {
  // Try to get a reasonable default id from the schema,
  // then slugify it.
  if (typeof schema.id !== 'undefined') {
    // If an ID's been explicitly set, use it unchanged
    return prefix + schema.id
  } else {
    return slugify(prefix + (schema.inputName || schema.label || schema.model || ''))
  }
}

export { slugify, slugifyFormID }
