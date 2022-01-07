# static content evaluation webpack plugin

Minimal, unopinionated static content evaluation powered by webpack.

Power any javascript file in your project with static generation. Easy to use, efficient, and plugs in to almost any environment with minimal setup and straight forward documentation.

## Install

```bash
$ npm install --save-dev static-content-evaluation-webpack-plugin
```

## Usage

Ensure you have webpack installed, e.g. `npm install -g webpack`

### webpack.config.js

```js
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');

module.exports = {

  entry: './index.js',

  output: {
    filename: 'index.js',
    path: 'dist',
  },

  plugins: [
		new StaticContentEvaluationWebpackPlugin(),
	]

};
```

### index.js

```js
// By default any file that exports a function named 'Static' will executed at build time
// and its return value will be put in place of any references to the variable __Static__
export const Static = () => {
	return new Promise((res) => {
		setTimeout(() => {res('we did (not do) it')}, 5000)
	})
}

export default (): string => {
	const x = __Static__
	console.log(x) // This will log 'we did (not do) it'
}
```

## Options

| Syntax | Description |
| ----------- | ----------- |
| ``` staticExpression: string ``` | This will allow you to rename the expression that gets replaced with the return value of the statically evaluated function |
| ``` staticFunctionName: string ``` | This property allows you to replace the name which is used to identify the function which will be statically evaluated |

## License
https://isaac-welch.mit-license.org/