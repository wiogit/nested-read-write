const FIRST = 0
const LAST = 1
const NEXT = 0
const VALUE = 1

class ChainBuilder extends Array {
  constructor(first = null) {
    super(first, null)
    this[LAST] = first
  }

  build() {
    return this[FIRST]
  }

  before(node) {
    node[NEXT] = this[FIRST]
    if (this[FIRST] === null) {
      this[LAST] = node
    }
    this[FIRST] = node
    return this
  }

  after(node) {
    if (this[LAST] === null) {
      this[FIRST] = node
    } else {
      this[LAST][NEXT] = node
    }
    this[LAST] = node
    return this
  }
}

class List extends Array {
  constructor() {
    super(null, null)
  }

  before(value) {
    const node = [this[FIRST], value]
    if (this[FIRST] === null) {
      this[LAST] = node
    }
    this[FIRST] = node
    return this
  }

  after(value) {
    const node = [null, value]
    if (this[LAST] === null) {
      this[FIRST] = node
    } else {
      this[LAST][NEXT] = node
    }
    this[LAST] = node
    return this
  }

  [Symbol.iterator]() {
    let node = this[FIRST]
    return {
      next() {
        if (node === null) {
          return {done: true}
        }
        const result = {
          value: node[VALUE],
          done: false
        }
        node = node[NEXT]
        return result
      }
    }
  }
}

class ReadWritePath {
  constructor(root) {
    this.root = root
  }

  read(source) {
    if (this.root === null) {
      return source
    }
    return this.root.read(source)
  }

  write(destination, value) {
    this.root.write(destination, value)
    return destination
  }

  toString() {
    return this.root === null
      ? ''
      : this.root.toString()
  }

  standardize() {
    const Path = this.constructor
    return this.root === null
      ? new Path(this.root)
      : new Path(this.root.standardize(true))
  }
}

class ReadPath extends ReadWritePath {
  constructor(root, readOnlyNodes) {
    super(root)
    this.readOnlyNodes = readOnlyNodes
  }

  write() {
    throw new Error(`This path is read-only`)
  }
}

class WritePath extends ReadWritePath {
  read() {
    throw new Error(`This path is write-only`)
  }
}

module.exports = {
  ChainBuilder,
  List,
  ReadWritePath,
  ReadPath,
  WritePath
}
