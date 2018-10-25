#!/usr/bin/env node

console.log('@publish-rum')
const spawn = require('child_process').spawn
const args = process.argv.slice(2)
let version = 'patch'
let comment = 'Automatic Commit'
for (let i = 0; i<args.length; i++) {
  if (args[i] === '-v')  {
    i++
    if (args[i] === 'major') version = 'major'
    else if (args[i] === 'minor') version = 'minor'
    else if (args[i] === 'patch') version = 'patch'
    else console.log('usage: -v major, minor or patch') && process.exit(1)
  } else if (args[i] === '-m') {
    if (/^".*"$/.test(args[i])) comment = args[i]
    else console.log('usage: -m "your commit message"') && process.exit(1)
  }
}
const queue = [
  ['git', ['add', '--all']],
  ['npm', ['version', version, '--force']],
  //['git', ['commit', '-m', comment]]
]

function next() {
  if (!queue.length) return
  const cmd = queue.shift()
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
