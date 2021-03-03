// import { default as plugin1 } from '/path/to/plugin1'
// import { default as plugin2 } from '/path/to/plugin2'
const pluginModules = {
	//plugin1
	//plugin2
}


export function replug(requiredPlugins, env) {
	const hooks = []
		([].concat(requiredPlugins || [])) 
		// plugins come as a <name>, or a [<name>, [{config}]] structure
		.map(plugin => Array.isArray(plugin) ? plugin : [plugin, []])
		// for each plugin
		.reduce((hooks, [pluginName, config]) => Object
			// look all hooks up (plugin modules)
			.entries(pluginModules[pluginName] || {[pluginName]: ()=>{throw new Error(`plugin ${pluginName} not defined`)}})
			// initialise them (they expose a default function for that)
			.map(([hook, init]) => [hook, init({...config, ...env})])
			// and register them for later lookup and use
			.reduce((hooks, [hook, added]) => ({...hooks, ...{[hook]: [].concat(hooks[hook] || [], added || [])}}), hooks)
		, {})

	// so that
	return (msg, initialData) =>
		// each registered hook
		// FIXME: hack: added a noop function to
		// return '' if no plugin is defined for the given hook.
		// This is a bit naive, as plugins may not just want to return strings.
		(hooks[msg] || [() => ''])
			// we can call passing some arguments
			//.reduce((data, plugin) => data.then(plugin), Promise.resolve(initialData))
			.reduce((data, plugin) => plugin(data), initialData)
}

