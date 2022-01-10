# static content evaluation webpack plugin

Minimal, unopinionated static content evaluation powered by webpack.

Power any javascript file in your project with static generation. Easy to use, efficient, and plugs in to almost any environment with minimal setup and straight forward documentation.

## Install

```bash
$ npm install --save-dev static-content-evaluation-webpack-plugin
```

## What it does

This plugin reads your javascript files during build time looking for an exported function to execute at build time. It then takes the return value of that function and inserts it into any references to a predetermined expression. For example if this was your javascript file

```js
export const Static = async () => {
	const name = await yourApiCallHere() // returns string 'world'
	return name
}

export const greet = () => `hello ${__Static__}`
```

this plugin will read your file and detect the exported async function Static and execute it returning the value of the api call. The plugin would then read through the rest of the file looking for a predetermined expression (by default the string '\_\_Static\_\_') and replace that expression with the return value of the function. So assuming the api call returns the string 'world' the exported greet function would have a return value of 'hello world'. The default name of the exported function it looks for and the expression that it replaces can be configured by passed in options.

## Current Limitations

Right now you cannot use the \_\_Static\_\_ value at the top level of a file, as it is not defined when the module is loaded to execute the Static function which causes an error to be thrown.

## Usage

Ensure you have webpack installed, e.g. `npm install -g webpack`

### webpack.config.js

Add static-static-content-valuation-webpack-plugin to your plugins array.

```js
const StaticContentEvaluationWebpackPlugin = require('static-content-evaluation-webpack-plugin');

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

Start exporting Static functions and using the injected expression (by default \_\_Static\_\_) to created statically built apps. It's that easy!

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