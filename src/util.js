const chalk = require('chalk')

/**
 * Output an array of strings or string-able things using `console.log`
 * @param {*[]} arr The array of items
 * @param {string=} title An optional title to render before the output
 * @param {function=} out The function to use to output each item.
 */
function outputArray (arr, title = null, out = ((...args) => console.log(...args))) {
  if (title) {
    out(chalk`{blue.bold Environments:}`)
  }
  arr.forEach((item) => out(item))
}

function commandActionWrapper (handler) {
  // Essentially coerce the handler into an async function
  const asyncHandler = async (...args) => handler(...args)
  return (...args) => {
    asyncHandler(...args)
      .catch((err) => {
        console.error('An error occurred when running the requested command:')
        console.error(err)
      })
  }
}

module.exports = {
  outputArray,
  commandActionWrapper,
}
