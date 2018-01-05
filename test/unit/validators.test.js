import { validators } from '../../src/lib/validators'

describe('Validators', () => {
  describe('required', () => {
    describe('When required', () => {
      const fieldSchema = {inputAttributes: {required: true}}
      test('Null is not accepted', () => {
        expect(validators.required(null, fieldSchema, {})).toEqual([validators.resources.fieldIsRequired])
      })
      test('Undefined is not accepted', () => {
        let value
        expect(validators.required(value, fieldSchema, {})).toEqual([validators.resources.fieldIsRequired])
      })
      test('Empty string is not accepted', () => {
        let value = ''
        expect(validators.required(value, fieldSchema, {})).toEqual([validators.resources.fieldIsRequired])
      })
      test('Empty Arrays is not accepted', () => {
        let value = []
        expect(validators.required(value, fieldSchema, {})).toEqual([validators.resources.fieldIsRequired])
      })
      test('Numbers are accepted', () => {
        let value = 1
        expect(validators.required(value, fieldSchema, {})).toEqual([])
      })
      test('Booleans are accepted', () => {
        let value = true
        expect(validators.required(value, fieldSchema, {})).toEqual([])
        value = false
        expect(validators.required(value, fieldSchema, {})).toEqual([])
      })
      test('Arrays are accepted', () => {
        let value = [1]
        expect(validators.required(value, fieldSchema, {})).toEqual([])
      })
      test('Objects are accepted', () => {
        let value = {}
        expect(validators.required(value, fieldSchema, {})).toEqual([])
      })
    }) // validators - required - when required

    describe('When not required', () => {
      const fieldSchema = {inputAttributes: {required: false}}
      test('Null is accepted', () => {
        expect(validators.required(null, fieldSchema, {})).toEqual([])
      })
      test('Undefined is accepted', () => {
        let value
        expect(validators.required(value, fieldSchema, {})).toEqual([])
      })
      test('Empty string is accepted', () => {
        let value = ''
        expect(validators.required(value, fieldSchema, {})).toEqual([])
      })
      test('Empty Arrays are accepted', () => {
        let value = []
        expect(validators.required(value, fieldSchema, {})).toEqual([])
      })
      test('Numbers are accepted', () => {
        let value = 1
        expect(validators.required(value, fieldSchema, {})).toEqual([])
      })
      test('Booleans are accepted', () => {
        let value = true
        expect(validators.required(value, fieldSchema, {})).toEqual([])
        value = false
        expect(validators.required(value, fieldSchema, {})).toEqual([])
      })
      test('Arrays are accepted', () => {
        let value = [1]
        expect(validators.required(value, fieldSchema, {})).toEqual([])
      })
      test('Objects are accepted', () => {
        let value = {}
        expect(validators.required(value, fieldSchema, {})).toEqual([])
      })
    }) // validators - required - When not required
  }) // validators - required

  describe('integer', () => {
    test('Numbers are accepted', () => {
      let value = 5
      let fieldSchema = {inputAttributes: {}}

      expect(validators.integer(value, fieldSchema, {})).toEqual([])
    })
    test('Doubles are not accepted', () => {
      let value = 5.5
      let fieldSchema = {inputAttributes: {}}
      let error = validators.resources.invalidInteger

      expect(validators.integer(value, fieldSchema, {})).toEqual([error])
    })
    test('Strings are not accepted', () => {
      let value = '5'
      let fieldSchema = {inputAttributes: {}}
      let error = [
        validators.resources.invalidNumber,
        validators.resources.invalidInteger
      ]

      expect(validators.integer(value, fieldSchema, {})).toEqual(error)
    })
    test('Min value is honored', () => {
      let value = 5
      let fieldSchema = {min: 4}

      expect(validators.integer(value, fieldSchema, {})).toEqual([])

      fieldSchema = {min: 6}
      let error = validators.resources.numberTooSmall.replace('{0}', '6')
      expect(validators.integer(value, fieldSchema, {})).toEqual([error])
    })
    test('Max value is honored', () => {
      let value = 5
      let fieldSchema = {max: 6}

      expect(validators.integer(value, fieldSchema, {})).toEqual([])

      fieldSchema = {max: 4}
      let error = validators.resources.numberTooBig.replace('{0}', '4')
      expect(validators.integer(value, fieldSchema, {})).toEqual([error])
    })
  }) // validators - integer

  describe('double', () => {
    test('Integers are accepted', () => {
      let value = 5
      let fieldSchema = {max: 6}
      expect(validators.double(value, fieldSchema, {})).toEqual([])
    })
    test('Doubles are accepted', () => {
      let value = 5.5
      let fieldSchema = {max: 6}
      expect(validators.double(value, fieldSchema, {})).toEqual([])
    })
    test('NaN are not accepted', () => {
      let value = NaN
      let fieldSchema = {max: 6}
      let error = validators.resources.invalidNumber

      expect(validators.double(value, fieldSchema, {})).toEqual([error])
    })
  }) // validators - double

  describe('date', () => {
    test('YYYY-MM-DD format is accepted', () => {
      let value = '2007-06-01'
      let fieldSchema = {}

      expect(validators.date(value, fieldSchema, {})).toEqual([])
    })
    test('Bad date format is not accepted', () => {
      let value = 'foo-bar'
      let fieldSchema = {}
      let error = validators.resources.invalidDate

      expect(validators.date(value, fieldSchema, {})).toEqual([error])
    })
    test('min value is honored', () => {
      let value = '2007-06-01'
      let fieldSchema = {min: '2007-05-30'}

      expect(validators.date(value, fieldSchema, {})).toEqual([])

      fieldSchema = {min: '2007-07-30'}
      let error = validators.resources.dateIsEarly.replace('{0}', '6/1/07').replace('{1}', '7/30/07')
      expect(validators.date(value, fieldSchema, {})).toEqual([error])
    })
    test('max value is honored', () => {
      let value = '2007-06-01'
      let fieldSchema = {max: '2007-07-30'}

      expect(validators.date(value, fieldSchema, {})).toEqual([])

      fieldSchema = {max: '2007-05-30'}
      let error = validators.resources.dateIsLate.replace('{0}', '6/1/07').replace('{1}', '5/30/07')
      expect(validators.date(value, fieldSchema, {})).toEqual([error])
    })
    test('Bad max or min value fails silently', () => {
      let value = '2007-06-01'
      let fieldSchema = {max: 'foo', min: 'bar'}

      expect(validators.date(value, fieldSchema, {})).toEqual([])
    })
  }) // validators - date

  describe('string', () => {
    test('minlength value is honored', () => {
      let value = 'foo bar'
      let fieldSchema = {inputAttributes: {minlength: 3}}

      expect(validators.string(value, fieldSchema, {})).toEqual([])

      fieldSchema = {inputAttributes: {minlength: 13}}
      let error = validators.resources.textTooSmall.replace('{0}', '7').replace('{1}', '13')
      expect(validators.string(value, fieldSchema, {})).toEqual([error])
    })
    test('maxlength value is honored', () => {
      let value = 'foo bar'
      let fieldSchema = {inputAttributes: {maxlength: 13}}

      expect(validators.string(value, fieldSchema, {})).toEqual([])

      fieldSchema = {inputAttributes: {maxlength: 3}}
      let error = validators.resources.textTooBig.replace('{0}', '7').replace('{1}', '3')
      expect(validators.string(value, fieldSchema, {})).toEqual([error])
    })
    test('Non-strings are not accepted', () => {
      let value = 12345
      let fieldSchema = {inputAttributes: {maxlength: 13}}

      let error = validators.resources.thisNotText
      expect(validators.string(value, fieldSchema, {})).toEqual([error])
    })
  }) // validators - string

  describe('array', () => {
    test('Non-arrays are not accepted', () => {
      let value = 12345
      let fieldSchema = {inputAttributes: {required: false}}

      let error = validators.resources.thisNotArray
      expect(validators.array(value, fieldSchema, {})).toEqual([error])
    })
    test('Empty arrays are not accepted when required is true', () => {
      let value = []
      let fieldSchema = {inputAttributes: {required: true}}
      let error = validators.resources.fieldIsRequired
      expect(validators.array(value, fieldSchema, {})).toEqual([error])
      value = null
      expect(validators.array(value, fieldSchema, {})).toEqual([error])

      value = ['foo']
      expect(validators.array(value, fieldSchema, {})).toEqual([])
    })
    test('null values work as expected', () => {
      let value = null
      let fieldSchema = {inputAttributes: {required: false}}

      expect(validators.array(value, fieldSchema, {})).toEqual([])
    })
    test('min values are honored', () => {
      let value = ['foo']
      let fieldSchema = {min: 1, inputAttributes: {required: false}}

      expect(validators.array(value, fieldSchema, {})).toEqual([])

      fieldSchema.min = 2
      let error = validators.resources.selectMinItems.replace('{0}', '2')
      expect(validators.array(value, fieldSchema, {})).toEqual([error])
    })
    test('max values are honored', () => {
      let value = ['foo', 'bar', 'baz']
      let fieldSchema = {max: 3, inputAttributes: {required: false}}

      expect(validators.array(value, fieldSchema, {})).toEqual([])

      fieldSchema.max = 2
      let error = validators.resources.selectMaxItems.replace('{0}', '2')
      expect(validators.array(value, fieldSchema, {})).toEqual([error])
    })
  }) // validators - array

  describe('regexp', () => {
    test('No pattern fails silently', () => {
      let value = 12345
      let fieldSchema = {}

      expect(validators.regexp(value, fieldSchema, {})).toEqual([])
    })
    test('Pattern works', () => {
      let value = '12345'
      let fieldSchema = {pattern: '\\d{5}'} // eslint-disable-line no-useless-escape

      expect(validators.regexp(value, fieldSchema, {})).toEqual([])

      value = '123'
      let error = validators.resources.invalidFormat
      expect(validators.regexp(value, fieldSchema, {})).toEqual([error])
    })
  }) // validators - regexp

  describe('email', () => {
    test('Email works', () => {
      let value = 'me@example.com'
      let fieldSchema = {}
      let error = validators.resources.invalidEmail

      expect(validators.email(value, fieldSchema, {})).toEqual([])
      expect(validators.email('', fieldSchema, {})).toEqual([])
      expect(validators.email('foo', fieldSchema, {})).toEqual([error])
    })
  }) // validators - email

  describe('url', () => {
    test('URL works', () => {
      let fieldSchema = {}
      let error = validators.resources.invalidURL

      // expect(validators.url('www.example.com', fieldSchema, {})).toEqual([])
      expect(validators.url('http://www.example.com/', fieldSchema, {})).toEqual([])
      expect(validators.url('https://www.example.com', fieldSchema, {})).toEqual([])
      expect(validators.url('', fieldSchema, {})).toEqual([])
      expect(validators.url('foo', fieldSchema, {})).toEqual([error])
    })
  }) // validators - url

  describe('creditcard', () => {
    test('Validates Credit Cards', () => {
      let valid = [
        '375556917985515',
        '36050234196908',
        '4716461583322103',
        '4716-2210-5188-5662',
        '4929 7226 5379 7141',
        '5398228707871527',
        '6283875070985593',
        '6263892624162870',
        '6234917882863855',
        '6234698580215388',
        '6226050967750613',
        '6246281879460688',
        '2222155765072228',
        '2225855203075256',
        '2720428011723762',
        'prefix6234917882863855',
        '623491788middle2863855',
        '6234917882863855suffix',
      ]
      let invalidFormat = [
        'foo',
        '375556917985515999999993',
        '899999996234917882863855',
        '2220175103860763',
        '2721465526338453',
      ]
      let invalidCard = [
        '4111112222222222',
        '5398228707871528',
        '2718760626256571',
      ]

      valid.forEach(item => {
        expect(validators.creditCard(item, {}, {})).toEqual([])
      })
      invalidFormat.forEach(item => {
        expect(validators.creditCard(item, {}, {})).toEqual([validators.resources.invalidCard])
      })
      invalidCard.forEach(item => {
        expect(validators.creditCard(item, {}, {})).toEqual([validators.resources.invalidCardNumber])
      })
    })
  }) // validators - url

  describe('alpha', () => {
    let error = validators.resources.invalidTextContainNumber

    expect(validators.alpha('abcdef', {}, {})).toEqual([])
    expect(validators.alpha('abc def', {}, {})).toEqual([error])
    expect(validators.alpha('abc1def', {}, {})).toEqual([error])
    expect(validators.alpha('abc-def', {}, {})).toEqual([error])
  }) // validators - alpha

  describe('alphaNumeric', () => {
    let error = validators.resources.invalidTextContainSpec

    expect(validators.alphaNumeric('abcdef', {}, {})).toEqual([])
    expect(validators.alphaNumeric('abc def', {}, {})).toEqual([error])
    expect(validators.alphaNumeric('abc1def', {}, {})).toEqual([])
    expect(validators.alphaNumeric('abc-def', {}, {})).toEqual([error])
  }) // validators - alpha
})
