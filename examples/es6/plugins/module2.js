export default (plugins) => {

	return {
		'extra': () => 'extra-data',
		'test:message': data => {
			return [].concat(data, 'hello from module2')
		},
	}
}
