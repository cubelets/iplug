import iplug from '../../dist/index.mjs'

import module1 from './plugins/module1.js'
import module2 from './plugins/module2.js'

const modules = {
	module1,
	module2,
}

const config = {
	key1: 'value1',
	key2: 'value2',
}

const plugins = await iplug(modules, config)

function main() {
	const input = 'hello'
	const output = plugins.parallel('test:message', input)
	output.forEach(x=>console.log(JSON.stringify(x)));
}

main()
