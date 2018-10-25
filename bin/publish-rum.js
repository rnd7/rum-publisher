#!/usr/bin/env node

console.log('@publish-rum')
const spawn = require('child_process').spawn
const execSync = require('child_process').execSync;
const fs = require('fs')
const pkg = JSON.parse(fs.readFileSync('./package.json'))
const args = process.argv.slice(2)
let version = 'patch'
let message = 'rum-publisher commit'
let build = false
let branch
let publish = true
let access = 'public'
let remote


for (let i = 0; i<args.length; i++) {
  if (args[i] === '-v' || args[i] === '--version')  {
    i++
    if (args[i] === 'major') version = 'major'
    else if (args[i] === 'minor') version = 'minor'
    else if (args[i] === 'patch') version = 'patch'
    else console.log('usage: -v major, minor or patch') & process.exit(1)
  } else if (args[i] === '-m' || args[i] === '--message') {
    i++
    if (args[i]) message = args[i]
    else console.log('usage: -m "your commit message"') & process.exit(1)
  } else if (args[i] === '-b' || args[i] === '--build') {
    build = (
        pkg.devDependecies
        && Object.keys(pkg.devDependecies).indexOf("@rnd7/rum-maker") > -1
      ) || (
        pkg.dependecies
        && Object.keys(pkg.dependecies).indexOf("@rnd7/rum-maker") > -1
      )
    if (!build) console.log("rum-maker not installed skipping build")
  } else if (args[i] === '-p' || args[i] === '--publish') {
    publish = /^true|t|1|yes|y$/i.test(args[i])
  } else if (args[i] === '-B' || args[i] === '--branch') {
    i++
    if (args[i]) branch = args[i]
    else console.log('usage: -B your-branch') & process.exit(1)
  } else if (args[i] === '-R' || args[i] === '--remote') {
    i++
    if (args[i]) branch = args[i]
    else console.log('usage: -R remote') & process.exit(1)
  } else if (args[i] === '-A' || args[i] === '--access') {
    i++
    if (args[i] === 'public') access = 'public'
    if (args[i] === 'restricted') access = 'restricted'
    else console.log('usage: -a public or restricted') & process.exit(1)
  }
}

if (publish && !remote) {
  console.log('No remote passed using -R. Trying to get current remote.')
  remote = execSync(
    'git remote',
    {encoding:'utf8'}
  ).replace(/\n|\r/gm,'')
  if (remote) {
    console.log("Found remote, using:", remote)
  } else {
    console.log('Could not read current remote. Skipping publish')
    console.log('Add a remote using following command.')
    console.log('git remote add origin https://github.com/you/repo.git')
    publish = false
  }
}

if (publish && !branch) {
  console.log('No branch passed using -B. Trying to get current branch.')
  branch = execSync(
    'git branch',
    {encoding:'utf8'}
  ).replace(/\n|\r/gm,'').replace(/^\*\s/, '')
  if (branch) {
    console.log("Found branch, using:", branch)
  } else {
    console.log('Could not read current branch. Skipping publish.')
    publish = false
  }
}

const queue = [
  ['Add changes', true, 'git', ['add', '--all']],
  ['Commit changes', true, 'git', ['commit', '-m', message]],
  ['Update Version', true, 'npm', ['version', version]],
  ['Transpile using rum-maker', build, 'npx', ['make-rum']],
  ['Add builds', build, 'git', ['add', '--all']],
  ['Commit builds', build, 'git', ['commit', '-m', function() {
    return JSON.parse(fs.readFileSync('./package.json')).version
  }]],
  ['Push to github', publish, 'git', ['push', remote, branch]],
  ['Publish on npm', publish, 'npm', ['publish', '--access', access]],
]

function evalArgs(args) {
  for (let i = 0; i<args.length; i++) {
    if (typeof args[i] === 'function') {
      try {
        args[i] = args[i]()
      } catch (e) {
        process.exit(1)
      }
    }
  }
}

function fmtCmd(cmd) {
  return cmd[0] + " " + cmd[1].join(' ')
}

function next() {
  if (!queue.length) {
    return console.log("---") & console.log("done") & process.exit(0)
  }
  const cmd = queue.shift()
  const name = cmd.shift()
  const skip = !cmd.shift()
  console.log("---")
  if (skip) return console.log("Skipping:", name) & next()
  console.log("Running:", name)

  evalArgs(cmd[1])
  console.log(fmtCmd(cmd))
  const child = spawn.apply(null, cmd)
  let error
  process.stdin.pipe(child.stdin)
  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
  child.on('close', (code) => {
    if (code) process.exit(code)
    else next()
  })
}

next()
