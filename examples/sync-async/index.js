import iplug from '../../src/index.ts'

import module1 from './sync-plugin.js'
import module2 from './async-plugin.js'

const modules = {
	module1,
	module2,
}

const plugins = await iplug(modules)

function main() {
	const input = 'hello'
	const output = plugins.parallel('message1', input)
	console.log(JSON.stringify(output));
}

main()
