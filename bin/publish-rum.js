#!/usr/bin/env node

console.log('@publish-rum')
const spawn = require('child_process').spawn
const fs = require('fs')
const pkg = fs.readFileSync('./package.json')
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
  [true, 'git', ['add', '--all']],
  [true, 'git', ['commit', '-m', comment]],
  [true, 'npm', ['version', version]],
  [build, 'npx make-rum', []],
  [true, 'git', ['add', '--all']],
  [true, 'git', ['commit', '-m', function() {
    return fs.readFileSync('./package.json').version
  }]]
]


function evalArgs(args) {
  for (let i = 0; i<args.length; i++) {
    if (typeof args[i] === 'function') {
      console.log('eval')
      try {
        args[i] = args[i]()
      } catch (e) {
        console.error(e)
        process.exit(1)
      }
    }
  }
}

function next() {
  console.log(next)
  if (!queue.length) return
  const cmd = queue.shift()
  if (!cmd[0]) return console.log("Skipping", cmd[1]) && next()
  cmd.shift()
  evalArgs(cmd[1])
  console.log(cmd[0] + " " + cmd[1].join(' '))
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
