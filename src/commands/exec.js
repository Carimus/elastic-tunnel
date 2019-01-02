const { outputArray } = require('../util')
const {
  lookupEBEnvironment,
  getEBEnvironmentConfig,
  getEBEnvironmentResources
} = require('../aws/eb')


module.exports = async ({
  environment,
  command: commandArr,
  accessInstance: rawAccessInstance = null,
  privateKey: rawPrivateKey = null,
}) => {
  const environments = await lookupEBEnvironment(environment)

  if (environments.length === 0) {
    throw new Error(`Environment '${environment}' not found in account.`)
  } else if (environments.length > 1) {
    throw new Error(`Environment '${environment}' is too ambiguous and matched multiple environments.`)
  }

  const { ApplicationName: application } = environments[0]

  const environmentConfig = await getEBEnvironmentConfig(application, environment)

  if (!environmentConfig) {
    throw new Error(`Environment '${environment}' had no deployed configuration.`)
  }

  const command = commandArr.join(' ')
  const environmentKey = environmentConfig['aws:autoscaling:launchconfiguration']['EC2KeyName']

  const environmentResources = await getEBEnvironmentResources(environment)

  // const accessInstance = resolveAccessInstance()

  console.log(environmentResources)
}
