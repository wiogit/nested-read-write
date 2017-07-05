const expect = require('chai').expect
const parser = require('../src/parser')
const testData = require('./test-data')

function stripWhiteSpace(string) {
  return string.replace(/\s/g, '')
}

describe('.read()', function() {
  describe('Equality tests', function() {
    for (let {path, source, expected} of testData.read.equality) {
      const rPath = parser.parse(path)
      it(`Path ${JSON.stringify(path)}`, function() {
        let actual = rPath.read(source)
        expect(actual).to.deep.equal(expected)
      })
    }
  })
  describe('Exception tests', function() {
    for (let {path} of testData.read.exception) {
      const rPath = parser.parse(path)
      it(`Path ${JSON.stringify(path)}`, function() {
        let exception = null
        try {
          let actual = rPath.read()
        } catch(e) {
          exception = e
        }
        expect(exception, "Reading with write-only path should throw an error")
          .not.to.be.null
        expect(exception.message).to.equal("This path is write-only")
      })
    }
  })
})

describe('.write()', function() {
  describe('Equality tests', function() {
    for (let {path, destination, value, expected} of testData.write.equality) {
      const wPath = parser.parse(path)
      it(`Path ${JSON.stringify(path)}`, function() {
        let actual = wPath.write(destination, value)
        expect(actual).to.deep.equal(expected)
      })
    }
  })
  describe('Exception tests', function() {
    for (let {path} of testData.write.exception) {
      const wPath = parser.parse(path)
      it(`Path ${JSON.stringify(path)}`, function() {
        let exception = null
        try {
          let actual = wPath.write()
        } catch(e) {
          exception = e
        }
        expect(exception, "Writing with read-only path should throw an error")
          .not.to.be.null
        expect(exception.message).to.equal("This path is read-only")
      })
    }
  })
})

describe('.toString()', function() {
  const allTestPaths = parser
      .parse('|[read.equality[].path,write.equality[].path]')
      .read(testData)
  for (let path of allTestPaths) {
    it(`Path ${JSON.stringify(path)}`, function() {
      let actual = parser.parse(path).toString()
      expect(actual).to.equal(stripWhiteSpace(path))
    })
  }
})

describe('.standardize()', function() {
  for (let {path, standard} of testData.standardize) {
    it(`Path ${JSON.stringify(path)}`, function() {
      let actual = parser.parse(path).standardize().toString()
      expect(actual).to.equal(standard)
    })
  }
})
