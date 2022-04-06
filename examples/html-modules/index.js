import plug from '../../dist/iplug.mjs'

import module1 from './plugins/module1.js'
import module2 from './plugins/module2.js'
import module3 from './plugins/module3.js'

const modules = {
	module1,
	module2,
	module3,
}

const config = {
	paidFeatures: false,
}


const plugins = plug(modules).init(null, config)

function main() {
	const output = plugins
		.map('html:features', '987654321')
		.reduce((a, b) => `${a}\n${b}`, '')

	// document.body.innerHTML = output
	console.log(`HTML generated from plugins:\n${output}`)
}

main()

