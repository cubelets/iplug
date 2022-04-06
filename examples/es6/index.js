import iplug from '../../dist/iplug.mjs'

import module1 from './plugins/module1.js'
import module2 from './plugins/module2.js'

const modules = {
	module1,
	module2,
}

const plugins = iplug(modules).init()

function main() {
	const input = 'test payload'
	const output = plugins.map('test:message', input)
	console.log(output)
}

main()

