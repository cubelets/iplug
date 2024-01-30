export default {
	init: async (plugins, config) => {
		plugins('blah')
		// console.log('config for plugin1', config)
		return {
			'test:message': data => {
				const extra = plugins.serial('extra');
				return [].concat(config, data, `world, ${extra}`);
			},
		}
	},
	'some:message': () => 'some-data',
}