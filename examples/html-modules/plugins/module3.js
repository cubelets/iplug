export default {
	'html:features': config => {
		if(config.paidFeatures) {
			return payload => `
				<div>This is a feature from plugin3: payload=${payload}, paidFeatures=${config.paidFeatures}</div>
			`
		} else {
			return undefined
		}
	},
}

