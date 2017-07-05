function sliceArray(array, begin, end, step) {
  const iStep = step === null ? 1 : step
  if (iStep === 0) throw new Error(`Slice step by 0`)
  const result = []
  if (iStep < 0) {
    const iBegin = begin === null
      ? array.length - 1
      : begin < 0
        ? array.length + begin
        : begin
    const iEnd = end === null
      ? -1
      : end < 1
        ? array.length + end
        : end
    for (let i = iBegin; i > iEnd; i += iStep) {
      result.push(array[i])
    }
    return result
  }
  const iBegin = begin === null
    ? 0
    : begin < 0
      ? array.length + begin
      : begin
  const iEnd = end === null
    ? array.length
    : end < 0
      ? array.length + end
      : end
  for (let i = iBegin; i < iEnd; i += iStep) {
    result.push(array[i])
  }
  return result
}

module.exports = sliceArray
