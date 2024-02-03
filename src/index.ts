import { PluginManifest, IPlugConfig, IPlugMessageBus, Handler, Topic, PluginName, PluginModule, isPluginManifest, ModuleMainConfig, TopicRegistry } from './types';

export { mockPlug } from './mock';

export default async function iPlug(modules: PluginManifest, config?: IPlugConfig): Promise<IPlugMessageBus> {
	const notReady = (): never => {	throw new Error('plugins/messagebus unavailable at') };

	const identity: Handler = x => x;
	const getHooks = (msg: Topic, defaultHooks: Handler[]): Handler[] => (hooks.get(msg) ?? defaultHooks);
	const callPlugin = (data: unknown, plugin: Handler) => plugin(data);
	const serial = (msg: Topic, initialData: unknown) => getHooks(msg, [identity]).reduce(callPlugin, initialData);

	const messagebus = <IPlugMessageBus>serial;
	messagebus.serial = serial;
	messagebus.one = (msg: Topic, initialData: unknown) => getHooks(msg, [identity]).slice(0, 1).reduce(callPlugin, initialData);
	messagebus.parallel = <I, O>(msg: Topic, seedData: I) => <O>getHooks(msg, <Handler[]>[]).map(function parallel(plugin){return <I>plugin(seedData)});
	messagebus.map = messagebus.parallel;
	messagebus.reduce = messagebus.serial;
	messagebus.init = () => messagebus;

	const kvp = <[PluginName, PluginModule][]>Object.entries(modules ?? <PluginModule>{});

	const initModule = (name: PluginName, module: PluginModule): PluginManifest | Promise<PluginManifest> =>
		isPluginManifest(module)
			? <PluginManifest>module
			: module(messagebus, (config?.hasOwnProperty(name) ? <IPlugConfig>(<ModuleMainConfig>config)[name] : config));

	const initModules = async ([name, module]: [PluginName, PluginModule]): Promise<[PluginName, PluginManifest]> =>
		[name, await initModule(name, module)];

	const _h = <Handler[]>[];
	const mergeHooks = (handlers: Handler[] | undefined, h: Handler): Handler[] => _h.concat(handlers ?? _h, h ?? _h);
	const pluginModules = new Map(await Promise.all(kvp.map(initModules)));
	const missingPlugin = (pluginName: PluginName): PluginManifest => ({[pluginName]: ()=>{throw new Error(`plugin ${pluginName} is missing`)}});

	const hooks: TopicRegistry =
		([...pluginModules.entries()])
		// for each plugin
		.reduce((hooks, [pluginName, pluginManifest]) => Object
			// look all hooks up (plugin modules)
			.entries(pluginManifest ?? missingPlugin(pluginName))
			// and register them for later lookup and use
			.reduce((hooks: TopicRegistry, [topic, next]) =>
				(hooks.set(<Topic>topic, mergeHooks(hooks.get(<Topic>topic), next)), hooks)
			, hooks)
		, <TopicRegistry>new Map())
	;

	messagebus.add = async (name: PluginName, m: PluginModule) => {
		(<[Topic, Handler][]>Object.entries(await initModule(name, m)))
			.forEach(([topic, handler]) => hooks.set(topic, mergeHooks(hooks.get(topic), handler)));
	};

	return messagebus;
}
