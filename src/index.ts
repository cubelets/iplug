/**
 * A JSON entity
 */
export type JSON = string | number | boolean | null | JSONObject | JSON[];
/**
 * A JSON object
 */
interface JSONObject {
  [property: string]: JSON;
};

export type Topic = string & { _Topic: never };

export type SingleHandler<InputType, OutputType> = (data: InputType) => OutputType;
export type SerialHandler<InputType, OutputType> = (data: InputType) => OutputType;
export type ParallelHandler<InputType, OutputType> = (data: InputType) => OutputType;
export type AnyHandler<InputType, OutputType> = SingleHandler<InputType, OutputType> | SerialHandler<InputType, OutputType> | ParallelHandler<InputType, OutputType>;
export type Handler = AnyHandler<unknown, unknown>;

type SingleCall<InputType, OutputType> = (msg: Topic, initialData: InputType) => OutputType;
type SerialCall<InputType, OutputType> = (msg: Topic, initialData: InputType) => OutputType;
type ParallelCall<InputType, OutputType> = (msg: Topic, seedData: InputType) => OutputType[];

/**
 * A map of topic:handlers managed by a plugin
 */
export type PluginManifest = Record<Topic, Handler>;
const isPluginManifest = (module: unknown): module is PluginManifest => typeof module == 'object';

export type IPlugMessageBus = SerialCall<unknown, unknown> & {
	init: () => IPlugMessageBus;
	add: (name: PluginName, m: PluginModule) => void;
	one: SingleCall<unknown, unknown>;
	serial: SerialCall<unknown, unknown>;
	parallel: ParallelCall<unknown, unknown>;
};
export type iPlug = IPlugMessageBus;
export type PluginModule = PluginManifest | ((plugins: iPlug, config?: IPlugConfig) => Promise<PluginManifest>);
export type PluginName = string & { _PluginName: never };

export type TopicRegistry = Map<Topic, Handler[]>;

export type ModuleSubConfig = JSONObject;
export type ModuleMainConfig = Record<PluginName, ModuleSubConfig>;
export type ModuleConfig = ModuleMainConfig | ModuleSubConfig & { _ModuleConfig: never };
export type IPlugConfig = (Record<PluginName, ModuleConfig> | Record<string, unknown> | string | number | boolean) & { _Config: never };

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
