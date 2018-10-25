# rum-publisher
Rumbullion version and package management helper. Basically a simple Taskrunner to automate git commits, npm versioning and build using rum-maker.

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

You might also invoke it by pointing node towards the bin js, though it is only recommended for development purposes or to publish the rum-publisher using rum-publisher.

```bash
node bin/publish-rum.js
```

## command line args

Commit message. Pass any string. Defaults to "rum-publisher commit".
```bash
-m "Commit for good sake"
```

NPM Version semver. Pass major, minor or patch. Defaults to patch.
```bash
-v patch
```

Build using optional [rum-maker](https://github.com/rnd7/rum-maker)
```bash
-B
--build
```

Publish to github and npm. Pass true or false. This defaults to true. You can use shortcuts (0,1 or t,f).
```bash
-p false
--publish false
```

git branch. If not set the script will use your current local branch. If this fails publish is skipped.
```bash
-B master
--branch master
```

git remote. If not set the script will use your current remote. If this fails publish is skipped.
```bash
-R origin
--remote origin
```

npm publish access. Use public or restricted. Defaults to public.
```bash
-A public
--access public
```

## License
See the [LICENSE](https://github.com/rnd7/rum-publisher/tree/master/LICENSE.md) file for software license rights and limitations (MIT).
