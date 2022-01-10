const Dependency = require('webpack/lib/Dependency')

function StaticContentEvaluationWebpackPlugin(options) {
	options = options || {}
	options.staticExpression = options.staticExpression || '__Static__'
	options.staticFunctionName = options.staticFunctionName || 'Static'
	this.options = options
}

class StaticInsertionDependency extends Dependency {
	constructor(ranges, data) {
		super()
		this.ranges = ranges
		this.data = data
	}
}

class StaticInsertionDependencyTemplate {
	apply(dep, source) {
		if (dep.ranges) {
			dep.ranges.forEach(range => {
				source.replace(range[0], range[1] - 1, '(' + JSON.stringify(dep.data) + ')')
			})
		}
	}
}

StaticInsertionDependency.Template = StaticInsertionDependencyTemplate

StaticContentEvaluationWebpackPlugin.prototype.apply = function(compiler) {
	const pluginOptions = this.options
	addThisCompilationHandler(compiler, function(compilation, { normalModuleFactory }) {
		const referencesKeyedByResource = {}
		const detectAllStaticReferences = (parser) => {
			parser.hooks.expression.for(pluginOptions.staticExpression).tap('static-content-evaluation-webpack-plugin', expr => {
				if (referencesKeyedByResource[parser.state.module.resource]) {
					referencesKeyedByResource[parser.state.module.resource].push(expr.range)
				} else {
					referencesKeyedByResource[parser.state.module.resource] = [expr.range]
				}
				return true
			})
		}
		function evaluateAndInsertStaticContent(modules, done) {
			try {
				compilation.dependencyTemplates.set(
					StaticInsertionDependency,
					new StaticInsertionDependency.Template()
				)
				const results = []
				modules.forEach((module) => {
					results.push(new Promise(res => {
						compilation.executeModule(module, {}, (_, result) => {
							if (result.exports && typeof result.exports[pluginOptions.staticFunctionName] === 'function') {
								const startTime = Date.now()
								result.exports[pluginOptions.staticFunctionName]().then((resp) => {
									module.addDependency(
										new StaticInsertionDependency(
											referencesKeyedByResource[module.resource],
											resp
										)
									)
									logEvaluationTime(module, startTime)
									res()
								})
							} else if (results.exports) {
								res(null)
							} else {
								throw new Error(`${module.resource} failed during execution of static functions`)
							}
						})
					}))
				})
				Promise.all(results).then(() => {
					done()
				})
			} catch (err) {
				done()
			}
		}
		addFinishModulesHandler(compilation, evaluateAndInsertStaticContent)
		normalModuleFactory.hooks.parser
			.for('javascript/auto')
			.tap('static-content-evaluation-webpack-plugin', detectAllStaticReferences)
		normalModuleFactory.hooks.parser
			.for('javascript/dynamic')
			.tap('static-content-evaluation-webpack-plugin', detectAllStaticReferences)
		normalModuleFactory.hooks.parser
			.for('javascript/esm')
			.tap('static-content-evaluation-webpack-plugin', detectAllStaticReferences)
	})
}

function logEvaluationTime(module, startTime) {
	console.log(
		'Evaluated static content for resource [\x1b[33m%s\x1b[0m] in \x1b[32m%sms\x1b[0m',
		module.resourceResolveData.relativePath,
		parseInt((Date.now() - startTime)
		)
	)
}

function addThisCompilationHandler(compiler, callback) {
	if(compiler.hooks) {
		compiler.hooks.thisCompilation.tap('static-content-evaluation-webpack-plugin', callback)
	} else {
		compiler.plugin('this-compilation', callback)
	}
}

function addFinishModulesHandler(compilation, callback) {
	if(compilation.hooks) {
		compilation.hooks.finishModules.tapAsync('static-content-evaluation-webpack-plugin',callback)
	} else {
		compilation.plugin('finish-modules', callback)
	}
}

module.exports = StaticContentEvaluationWebpackPlugin
