import iplug from '../../dist/index.mjs'

import module1 from './plugins/module1.js'
import module2 from './plugins/module2.js'
import module3 from './plugins/module3.js'

const modules = {
	module1,
	module2,
	module3,
}

const config = {
	paidFeatures: true,
}

const concat = (a, b) => `${a}\n${b}`

const plugins = await iplug(modules, config)

function main() {
	const jobs = plugins
		.map('html:features', '987654321')

	Promise.all(jobs)
		.then(results => results.reduce(concat, ''))
		.then(output => console.log(`HTML generated from plugins:\n${output}`))
		//.then(result => document.body.innerHTML = output)
}

main()

