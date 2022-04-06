const fakeFetch = url => new Promise(resolve => setTimeout(resolve, 500))
const lateResponse = payload => new Promise(resolve => {
	setTimeout(()=>resolve(`<div>This is a feature from plugin3 promise: payload=${payload}, delay=500ms</div>`), 1000)
})

export default {
	'html:features': config => {
		//await fakeFetch('/api/a/b/c')
		// Here we can make decide whether we want to register for the given message
		if(config.paidFeatures) {
			// enable the plugin
			return lateResponse
		} else {
			// disable the plugin
			return undefined
		}
	},
}

