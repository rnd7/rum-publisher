#!/usr/bin/env node

console.log('@publish-rum')
const spawn = require('child_process').spawn
const execSync = require('child_process').execSync;
const fs = require('fs')
const pkg = JSON.parse(fs.readFileSync('package.json'))
const args = process.argv.slice(2)
let version = 'patch'
let comment = 'rum-publisher commit'
let transpile = false
let branch
let publish = false
let access = 'public'


for (let i = 0; i<args.length; i++) {
  if (args[i] === '-v')  {
    i++
    if (args[i] === 'major') version = 'major'
    else if (args[i] === 'minor') version = 'minor'
    else if (args[i] === 'patch') version = 'patch'
    else console.log('usage: -v major, minor or patch') & process.exit(1)
  } else if (args[i] === '-m') {
    i++
    if (/^".*"$/.test(args[i])) comment = args[i]
    else console.log('usage: -m "your commit message"') & process.exit(1)
  } else if (args[i] === '-t') {
    transpile = (
        pkg.devDependecies
        && Object.keys(pkg.devDependecies).indexOf("@rnd7/rum-maker") > -1
      ) || (
        pkg.dependecies
        && Object.keys(pkg.dependecies).indexOf("@rnd7/rum-maker") > -1
      )
    if (!transpile) console.log("rum-maker not installed skipping transpile")
  } else if (args[i] === '-p') {
    publish = true
  } else if (args[i] === '-b') {
    i++
    if (args[i]) branch = args[i]
    else console.log('usage: -b your-branch') & process.exit(1)
  } else if (args[i] === '-a') {
    i++
    if (args[i] === 'public') access = 'public'
    if (args[i] === 'restricted') access = 'restricted'
    else console.log('usage: -a public or restricted') & process.exit(1)
  }
}

if (publish && !branch) {
  console.log('No branch passed using -b. Trying to get current branch.')
  branch = execSync('git branch',{encoding:'utf8'}).replace(/^\*\s/, '')
  if (branch) {
    console.log("Found branch, using:", branch)
  } else {
    console.log('Could not read current branch. Skipping publish')
    publish = false
  }
}

const queue = [
  ['Add changes', true, 'git', ['add', '--all']],
  ['Commit changes', true, 'git', ['commit', '-m', comment]],
  ['Update Version', true, 'npm', ['version', version]],
  ['Transpile using rum-maker', transpile, 'npx', ['make-rum']],
  ['Add builds', transpile, 'git', ['add', '--all']],
  ['Commit builds', transpile, 'git', ['commit', '-m', function() {
    return JSON.parse(fs.readFileSync('package.json')).version
  }]],
  //['Push to github', publish, 'git', ['push', 'origin', branch]]
  //['Publish on npm', publish, 'npm', ['publish', '--access', access]]
]


function evalArgs(args) {
  for (let i = 0; i<args.length; i++) {
    if (typeof args[i] === 'function') {
      console.log('eval')
      try {
        args[i] = args[i]()
        console.log(args[i])
      } catch (e) {
        console.error(e)
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
  //child.stdout.setEncoding('utf8')
  process.stdin.on('data', (chunk) => {
    child.stdin.write(chunk)
  })
  child.stdout.on('data', (chunk) => {
    process.stdout.write(chunk)
  })
  child.stderr.on('data', (chunk) => {
    console.log('error')
    process.stderr.write(chunk)
    error = true
  })
  child.on('close', (code) => {
    if (error) process.exit(1)
    else next()
  })
}

next()
