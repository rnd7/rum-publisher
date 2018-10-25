# rum-publisher
Rumbullion version and package management tool. Basically a simple Taskrunner to automate git commits, npm versioning and build using rum-maker.

## Install
I prefer installation per package. But you can also install it global to link the make-rum command systemwide.
```
npm i -D @rnd7/rum-publisher
```

## Run
You run this command using npx when not installed globally
```bash
npx publish-rum
```

## command line args

Commit message. Pass any string.
```bash
-m "Commit for good sake"
```

NPM Version semver. Pass major, minor or patch. It defaults to patch.
```bash
-v patch
```

## License
See the [LICENSE](https://github.com/rnd7/rum-maker/tree/master/LICENSE.md) file for software license rights and limitations (MIT).
