import { slugify, slugifyFormID } from '../../src/lib/slugify'

describe('Slugify', () => {
  test('Handles nothing passed to it', () => {
    expect(slugify()).toEqual('')
  })
  test('Converts to a string', () => {
    expect(slugify(1)).toEqual('1')
  })
  test('Trims white space', () => {
    expect(slugify('  foo  ')).toEqual('foo')
  })
  test('Converts everything to lower case', () => {
    expect(slugify('FoO')).toEqual('foo')
  })
  test('Replaces underscores and spaces with dashes', () => {
    expect(slugify('foo fighters_band')).toEqual('foo-fighters-band')
  })
  test('Removes leading and trailing dashes', () => {
    expect(slugify('-foo-')).toEqual('foo')
  })
  test('Replaces multiple dashes to one', () => {
    expect(slugify('foo--fighters-------band')).toEqual('foo-fighters-band')
  })
  test('Removes anything that isn\'t an ASCII letter, number or dash', () => {
    expect(slugify('fooé')).toEqual('foo')
  })
})

describe('SlugifyFormID', () => {
  test('Handles no prefix', () => {
    expect(slugifyFormID({id: 'fighters'})).toEqual('fighters')
  })
  test('Handles schema.id', () => {
    expect(slugifyFormID({id: 'fighters'}, 'foo')).toEqual('foofighters')
  })
  test('Handles schema.inputName', () => {
    let schema = {inputName: 'inputname', label: 'label', model: 'model'}
    expect(slugifyFormID(schema, 'foo')).toEqual('fooinputname')
  })
  test('Handles schema.label', () => {
    let schema = {inputName: '', label: 'label', model: 'model'}
    expect(slugifyFormID(schema, 'foo')).toEqual('foolabel')
  })
  test('Handles schema.inputName', () => {
    let schema = {inputName: '', label: '', model: 'model'}
    expect(slugifyFormID(schema, 'foo')).toEqual('foomodel')
  })
  test('Handles when nothing is there', () => {
    let schema = {inputName: '', label: '', model: ''}
    expect(slugifyFormID(schema, 'foo')).toEqual('foo')
  })
})
