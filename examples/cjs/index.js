const iplug = require('../../dist/iplug.cjs')

const module1 = require('./plugins/module1.js')
const module2 = require('./plugins/module2.js')

const modules = {
	module1,
	module2,
}

const plugins = iplug(modules).init()

function main() {
	const input = 'test payload'
	console.log(input)
	const output = plugins.map('test:message', input)
	console.log(output)
}

main()

