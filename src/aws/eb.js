const AWS = require('aws-sdk')

/**
 * Get an array of EB applications names.
 *
 * @return {Promise<string[]>}
 */
async function getEBApplications () {
  const eb = new AWS.ElasticBeanstalk()
  const { Applications: applications } = await eb.describeApplications().promise()
  return applications.map(({ ApplicationName: name }) => name)
}

/**
 * Get an array of EB environment names for an application.
 *
 * @param {string=} applicationName
 * @return {Promise<string[]>}
 */
async function getEBEnvironments (applicationName = null) {
  /** @type {ElasticBeanstalk} */
  const eb = new AWS.ElasticBeanstalk()
  const params = {}
  if (applicationName) {
    params.ApplicationName = applicationName
  }
  const { Environments: environments } = await eb.describeEnvironments(params).promise()
  return environments.map(({ EnvironmentName: name }) => name)
}

async function lookupEBEnvironment (environmentName) {
  /** @type {ElasticBeanstalk} */
  const eb = new AWS.ElasticBeanstalk()
  const { Environments: environments } = await eb
    .describeEnvironments({EnvironmentNames: [environmentName]})
    .promise()
  return environments
}

async function getEBEnvironmentConfig (applicationName, environmentName) {
  /** @type {ElasticBeanstalk} */
  const eb = new AWS.ElasticBeanstalk()
  const params = { EnvironmentName: environmentName, ApplicationName: applicationName }
  const { ConfigurationSettings: rawConfigs = [] } = await eb
    .describeConfigurationSettings(params)
    .promise()

  const rawConfig = rawConfigs.find(({ DeploymentStatus: status }) => status === 'deployed')

  if (!rawConfig) {
    return null
  }

  return rawConfig.OptionSettings.reduce(
    (config, { Namespace: namespace, OptionName: name, Value: value }) => {
      return ({
        ...config,
        [namespace]: {
          ...(config[namespace] || {}),
          [name]: value
        }
      })
    },
    {}
  )
}

async function getEBEnvironmentResources (environmentName) {
  /** @type {ElasticBeanstalk} */
  const eb = new AWS.ElasticBeanstalk()
  const { EnvironmentResources: resources } = await eb
    .describeEnvironmentResources({ EnvironmentName: environmentName })
    .promise()
  return resources
}

module.exports = {
  getEBApplications,
  getEBEnvironments,
  lookupEBEnvironment,
  getEBEnvironmentConfig,
  getEBEnvironmentResources,
}
