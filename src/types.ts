/**
 * A JSON entity
 */
export type JSON = string | number | boolean | null | JSONObject | JSON[];
/**
 * A JSON object
 */
interface JSONObject {
	[property: string]: JSON;
}
;

export type Topic = string & { _Topic: never; };

export type SingleHandler<InputType, OutputType> = (data?: InputType) => OutputType;
export type SerialHandler<InputType, OutputType> = (data?: InputType) => OutputType;
export type ParallelHandler<InputType, OutputType> = (data?: InputType) => OutputType;
export type AnyHandler<InputType, OutputType> = SingleHandler<InputType, OutputType> | SerialHandler<InputType, OutputType> | ParallelHandler<InputType, OutputType>;
export type Handler = AnyHandler<unknown, unknown>;
type SingleCall<InputType, OutputType> = (msg: Topic, initialData: InputType) => OutputType;
type SerialCall<InputType, OutputType> = (msg: Topic, initialData: InputType) => OutputType;
type ParallelCall<InputType, OutputType> = (msg: Topic, seedData: InputType) => OutputType[];
/**
 * A map of topic:handlers managed by a plugin
 */

export type PluginManifest = Record<Topic, Handler>;
export const isPluginManifest = (module: unknown): module is PluginManifest => typeof module == 'object';

export type IPlugMessageBus = SerialCall<unknown, unknown> & {
	init: () => IPlugMessageBus;
	add: (name: PluginName, m: PluginModule) => void;
	one: SingleCall<unknown, unknown>;
	serial: SerialCall<unknown, unknown>;
	reduce: SerialCall<unknown, unknown>;
	parallel: ParallelCall<unknown, unknown>;
	map: ParallelCall<unknown, unknown>;
};
export type iPlug = IPlugMessageBus;
export type PluginModule = PluginManifest | ((plugins: iPlug, config?: IPlugConfig) => Promise<PluginManifest>);
export type PluginName = string & { _PluginName: never; };

export type TopicRegistry = Map<Topic, Handler[]>;

export type ModuleSubConfig = JSONObject;
export type ModuleMainConfig = Record<PluginName, ModuleSubConfig>;
export type ModuleConfig = ModuleMainConfig | (ModuleSubConfig & { _ModuleConfig: never; });
export type IPlugConfig = (Record<PluginName, ModuleConfig> | Record<string, unknown> | string | number | boolean) & { _Config: never; };
