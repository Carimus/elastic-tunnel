#!/usr/bin/env node

const yargs = require('yargs')
const chalk = require('chalk')
const { commandActionWrapper } = require('./src/util')
const { setGlobalRegion, getCallerAndAccountDetails } = require('./src/aws')
const pkg = require('./package.json')

// All subcomands
const listApplications = require('./src/commands/listApplications')
const listEnvironments = require('./src/commands/listEnvironments')
const exec = require('./src/commands/exec')

function wrapper (fn) {
  return commandActionWrapper(async (argv, ...args) => {
    setGlobalRegion(argv.region || null)
    const {
      account,
      userId,
      aliases,
      identityArn,
    } = await getCallerAndAccountDetails()
    console.log(chalk`{blue.bold Account:} ${account} (${aliases})`)
    console.log(chalk`{blue.bold User:}    ${userId} (${identityArn})`)
    console.log('')
    return fn(argv, ...args)
  })
}

// language=TEXT
const results = yargs
  .version(pkg.version)
  .usage('$0 <cmd>')
  .option('r', {
    alias: 'region',
    describe: 'AWS region. Defaults to environment or us-east-1.',
    type: 'string',
  })
  .command(
    'whoami',
    'Get account details.',
    {},
    wrapper(async () => { /* Do nothing since the wrapper outputs account details. */ })
  )
  .command(
    'list-applications',
    'List all EB applications in the account.',
    {},
    wrapper(listApplications)
  )
  .command(
    'list-environments [application]',
    'List all EB application environments in the account.',
    {},
    wrapper(listEnvironments)
  )
  .command(
    'exec <environment> <command...>',
    'Execute a command on an instance in an EB environment through an SSH access point.',
    (command) => {
      command
        .positional('environment', {
          describe: 'The name of the EB application environment to find an instance in.',
          type: 'string',
        })
        .positional('command', {
          describe: 'The command to run. If it contains flags, it must be wrapped in quotes.',
          type: 'string',
        })
        .option('a', {
          alias: 'access-instance',
          describe:
            'The name, ID, IP address, or hostname of the instance to SSH through. ' +
            'By default, we\'ll try to find an instance that uses the same EC2 keypair as ' +
            'the environment that doesn\'t belong to the environment itself.',
          type: 'string',
        })
        .option('i', {
          alias: 'private-key',
          describe:
            'The path to the private key to SSH into the server with. By default, we\'ll get ' +
            'the name of the keypair used in the EB environment and check for its existence at ' +
            '`~/.ssh/keys/[keyname].pem`.',
          type: 'string',
        })
    },
    wrapper(exec)
  )
  .demandCommand(1, 'Please specify at least one command.')
  .strict(true)
  .help()
  .parse()
