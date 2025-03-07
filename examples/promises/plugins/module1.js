const runner = payload => new Promise(resolve => {
	setTimeout(()=>resolve(`<div>This is a feature from plugin1 promise, delay=1s</div>`), 1000)
})

export default {
	'html:features': runner,
}

