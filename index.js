// import { default as plugin1 } from '/path/to/plugin1'
// import { default as plugin2 } from '/path/to/plugin2'
const pluginModules = new Map(Object.entries({
	//plugin1
	//plugin2
})

export function replug(requiredPlugins, env) {
	if(!requiredPlugins && pluginModules) {
		requiredPlugins = [...pluginModules.keys()]
	}

	const merge = (hooks, [pluginName, config]) =>
		// look all hooks up (plugin modules)
		Object.entries(pluginModules.get(pluginName) || {[pluginName]: ()=>{throw new Error(`plugin ${pluginName} not defined`)}})
		// initialise them (they expose a default function for that)
		.map(([hook, init]) => [hook, init({...config, ...env})])
		// and register them for later lookup and use
		.reduce((hooks, [hook, added]) => hooks.set(hook, [].concat(hooks.get(hook) || [], added || [])), hooks)

	const add = (plugins, initial = new Map()) => [].concat(plugins || [])
		// plugins come as a <name>, or a [<name>, {...config}] structure
		.map(plugin => Array.isArray(plugin) ? plugin : [plugin, []])
		.reduce(merge, initial)

	let hooks = add(requiredPlugins)

	const transform = (data, plugin) => plugin(data)
	const fn = (msg, initialData) => (hooks.get(msg) || []).reduce(transform, initialData)
	const register = (name, p) => pluginModules.set(name, p)
	fn.add = (name, p, config) => {
		register(name, p)
		hooks = add(name, hooks)
	}
	fn.reduce = fn
	fn.map = (msg, initialData) => (hooks.get(msg) || []).map(function callPlugin(plugin){return plugin(initialData)})
	fn.hooks = hooks

	return fn
}
