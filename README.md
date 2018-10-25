# rum-maker
Rumbullion build tool. Transpiling ES6 for multiple targets. Configured via package.json. Utilizing Rollup and Babel. This tool is not a generic bundler and transpiler. It exactly fits the Rumbullion needs but nothing more. Primary purpose is to get rid of config files and dependecies within a micro package project.

## Install
I prefer installation per package. But you can also install it global to link the make-rum command systemwide.
```
npm i -D @rnd7/rum-maker
```

## Run
Configure it within the package.json file of your project. If present the entry setting in the rum.maker config will define the entry point otherwise it defaults to './src/index.js'. As outputs the package module, main and browser will be used when present. Module transpiles to es, main to cjs, and browser to browser compatible cjs module.

```json
{
  "name": "myPackage",
  "module": "dist/my-package-es.js",
  "main": "dist/my-package-cjs.js",
  "browser": "dist/my-package-browser.js",
  "rum": {
    "maker": {
      "entry": "src/index.js"
    }
  },
  "scripts": {
    "build": "make-rum"
  },
  "devDependencies": {
    "@rnd7/rum-maker": "^1.0.16"
  }
}
```
And afterwards you can run the script using

```bash
npm run build
```

Or execute it via npx from your project root, while it still uses the package.json for configuration

```bash
npx make-rum
```

You might also invoke it by poiting node towards the bin js, though it is only recommended for development purposes or to transpile the rum-maker using rum-maker.

```bash
node bin/make-rum.js
```

## License
See the [LICENSE](https://github.com/rnd7/rum-maker/tree/master/LICENSE.md) file for software license rights and limitations (MIT).
