import plug from '../../dist/iplug.mjs'

import module1 from './plugins/module1.js'
import module2 from './plugins/module2.js'
import module3 from './plugins/module3.js'

const modules = {
	module1,
	module2,
	module3,
}

const plugins = plug(modules).init()
const add = (a, b) => a+b

function main() {
	const output = plugins
		.map('test:message')
		.reduce(add, 0)

	console.log(`Adding up numbers from plugins: ${output}`)
}

main()

