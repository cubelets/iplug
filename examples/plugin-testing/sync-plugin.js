export default (plugins, config) => {
	const message1 = data => {
		plugins.map('message2', `hello from message1 handler, handling "${data}"`)
	}

	return {
	  message1,
	}
}

export const aaa = 123

