export default function iPlug(modules) {
	const pluginModules = new Map(
		Object
			.entries(modules || {})
			.map(([name, module]) => [name, typeof module == 'function' ? module() : module])
	)

	return {
		init: function iPlugInit(requiredPlugins, env) {
			const hooks = new Map(
				([].concat(requiredPlugins || [...pluginModules.keys()])) 
				// plugins come as a <name>, or a [<name>, [{config}]] structure
				.map(plugin => Array.isArray(plugin) ? plugin : [plugin, []])
				// for each plugin
				.reduce((hooks, [pluginName, config]) => Object
					// look all hooks up (plugin modules)
					.entries(pluginModules.get(pluginName) || {[pluginName]: ()=>{throw new Error(`plugin ${pluginName} is missing`)}})
					// initialise them (they expose a default function for that)
					.map(([hook, init]) => init && [hook, init({...config, ...env})])
					// filter out plugins that didn't want to register
					.filter(x=>x)
					// and register them for later lookup and use
					.reduce((hooks, [hook, added]) => (hooks.set(hook, [].concat(hooks.get(hook) || [], added || [])), hooks), hooks)
				, new Map())
			)

			const fn = (msg, initialData) => (hooks.get(msg) || [x => x]).reduce((data, plugin) => plugin(data), initialData)
			fn.reduce = fn.chain = fn.series = fn
			fn.map = fn.parallel = fn.all = (msg, initialData) => (hooks.get(msg) || []).map(function callPlugin(plugin){return plugin(initialData)})

			return fn
		}
	}
}

