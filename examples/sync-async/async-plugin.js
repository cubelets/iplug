export default async (plugins, config) => {
	const message1 = async (input) => {
		plugins = await plugins
		return plugins('message2', `hello from message1 handler, handling "${input}"`)
	}

	return {
	  message1
	}
}
