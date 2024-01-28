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
export type PluginModule = PluginManifest | ((plugins: iPlug, config?: Config) => Promise<PluginManifest>);

export type PluginName = string & { _PluginName: never };


export type TopicRegistry = Map<Topic, Handler[]>;
export type _HookRegistry = TopicRegistry | Record<Topic, Handler[]>;

export type ModuleName = string;
export type ModuleConfig = unknown;
export type Config = (Record<ModuleName, ModuleConfig> | unknown) & { _Config: never };

export default async function iPlug(modules: PluginManifest, config: Config): Promise<IPlugMessageBus> {
	const notReady = (): never => {	throw new Error('plugins/messagebus unavailable at') };

	const identity: Handler = x => x;
	const getHooks = (msg: Topic, defaultHooks: Handler[]): Handler[] => (hooks.get(msg) ?? defaultHooks);
	const callPlugin = (data: unknown, plugin: Handler) => plugin(data);
	const serial = (msg: Topic, initialData: unknown) => getHooks(msg, [identity]).reduce(callPlugin, initialData);

	const messagebus = <IPlugMessageBus>serial;
	messagebus.serial = serial;
	messagebus.one = (msg, initialData) => getHooks(msg, [identity]).slice(0, 1).reduce(serial, initialData);
	messagebus.parallel = <I, O>(msg: Topic, seedData: I) => <O>getHooks(msg, <Handler[]>[]).map(function parallel(plugin){return <I>plugin(seedData)});
	messagebus.init = () => messagebus;

	const kvp = <[PluginName, PluginModule][]>Object.entries(modules ?? <PluginModule>{});

	const initModule = (name: PluginName, module: PluginModule): PluginManifest | Promise<PluginManifest> =>
		isPluginManifest(module) ? <PluginManifest>module : module(messagebus, config?.hasOwnProperty(name) ? config[name] : config)

	const initModules = async ([name, module]: [PluginName, PluginModule]): Promise<[PluginName, PluginManifest]> =>
		[name, await initModule(name, module)];

	const _hm = <Handler[]>[];
	const mergeHooks = (handlers?: Handler[], h: Handler): Handler[] => _hm.concat(handlers ?? _hm, h ?? _hm);
	const pluginModules = new Map(await Promise.all(kvp.map(initModules)));
	const missingPlugin = (pluginName: PluginName): PluginManifest => ({[pluginName]: ()=>{throw new Error(`plugin ${pluginName} is missing`)}});

	debugger;
	const _pm = <PluginModule[]>[];
	const hooks: TopicRegistry =
		([...pluginModules.entries()])
		// for each plugin
		.reduce((hooks, [pluginName, pluginManifest]) => Object
			// look all hooks up (plugin modules)
			.entries(pluginManifest ?? missingPlugin(pluginName))
			// and register them for later lookup and use
			.reduce((hooks: TopicRegistry, [topic, next]) => {

				debugger;
				const b = mergeHooks(hooks.get(<Topic>topic), next);
				const a = (hooks.set(<Topic>topic, b), hooks)
				return a
			
			}
				, hooks)
		, <TopicRegistry>new Map())
	;

	messagebus.add = async (name: PluginName, m: PluginModule) => {
		(<[Topic, Handler][]>Object.entries(await initModule(name, m)))
			.forEach(([topic, handler]) => hooks.set(topic, mergeHooks(hooks.get(topic), handler)));
	};

	return messagebus;
}
