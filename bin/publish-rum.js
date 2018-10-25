#!/usr/bin/env node

console.log('@publish-rum')
const spawn = require('child_process').spawn
const fs = require('fs')
const pkg = JSON.parse(fs.readFileSync('package.json'))
const args = process.argv.slice(2)
let version = 'patch'
let comment = 'Automatic Commit'
let build = false

for (let i = 0; i<args.length; i++) {
  if (args[i] === '-v')  {
    i++
    if (args[i] === 'major') version = 'major'
    else if (args[i] === 'minor') version = 'minor'
    else if (args[i] === 'patch') version = 'patch'
    else console.log('usage: -v major, minor or patch') && process.exit(1)
  } else if (args[i] === '-m') {
    i++
    if (/^".*"$/.test(args[i])) comment = args[i]
    else console.log('usage: -m "your commit message"') && process.exit(1)
  } else if (args[i] === '-b') {
    build = Object.keys(pkg.devDependecies).indexOf("@rnd7/rum-maker") > -1
      || Object.keys(pkg.dependecies).indexOf("@rnd7/rum-maker") > -1
  }
}

const queue = [
  ['Add changes', true, 'git', ['add', '--all']],
  ['Commit changes', true, 'git', ['commit', '-m', comment]],
  ['Update Version', true, 'npm', ['version', version]],
  ['Build using rum-maker', build, 'npx', ['make-rum']],
  ['Add builds', build, 'git', ['add', '--all']],
  ['Commit builds', build, 'git', ['commit', '-m', function() {
    return JSON.parse(fs.readFileSync('package.json')).version
  }]]
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
  if (!queue.length) return process.exit(0)
  const cmd = queue.shift()
  const name = cmd.shift()
  const skip = !cmd.shift()
  if (skip) {
    console.log("Skipping:", name)
    return next()
  }
  console.log("Running:", name)

  evalArgs(cmd[1])
  console.log(fmtCmd(cmd))
  const child = spawn.apply(null, cmd)
  let error
  child.stdout.setEncoding('utf8')
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


/*


git add --all
git commit -m "comment"
npm version patch

*/
