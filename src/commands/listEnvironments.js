const { outputArray } = require('../util')
const { getEBEnvironments } = require('../aws/eb')

module.exports = async (argv) => {
  const { application = null } = argv
  const environments = await getEBEnvironments(application)
  outputArray(environments, `Environments${application && ` ${application}`}`)
}
