const AWS = require('aws-sdk')

/**
 * Set the global AWS region used by default in commands based on the user-provided input and env.
 * Defaults to `'us-east-1'`
 *
 * Has side effects.
 *
 * @param {string=} provided The region provided by the user via input.
 * @return {string} The region that was set.
 */
function setGlobalRegion (provided = null) {
  const region = (
    provided ||
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    'us-east-1'
  )
  AWS.config.update({ region })
  return region
}

/**
 * Output and return the AWS SDK caller identity using AWS STS.
 *
 * @return {Promise<{}>}
 */
async function getCallerAndAccountDetails () {
  /** @type {STS} sts */
  const sts = new AWS.STS()
  /** @type {IAM} iam */
  const iam = new AWS.IAM()
  const {
    UserId: userId,
    Account: account,
    Arn: identityArn,
  } = await sts.getCallerIdentity().promise()
  const { AccountAliases: aliases } = await iam.listAccountAliases().promise()
  return {
    account,
    userId,
    identityArn,
    identityArnShort: identityArn.split(':').slice(-1)[0],
    aliases: aliases.join(', ')
  }
}

module.exports = {
  setGlobalRegion,
  getCallerAndAccountDetails,
}
