const { outputArray } = require('../util')
const { getEBApplications } = require('../aws/eb')

module.exports = async () => {
  const applications = await getEBApplications()
  outputArray(applications, 'Applications')
}
