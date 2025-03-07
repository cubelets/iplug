import { mockPlug } from '../dist/index.mjs'

import module from './sync-plugin.js'

const spyFn = returnValue => jest.fn().mockReturnValue(returnValue)

describe('testing a sync plugin', () => {
	describe('on message1', () => {
		it('emits message2', async () => {
			const payload = 'test payload'
			const expected = `hello from message1 handler, handling "${payload}"`

			let mock = mockPlug(spyFn)

			console.log('mock', mock)

			const plugin = await module(mock)
			await plugin['message1'](payload)

			//mock = await mock
			//expect.assertions(1)
			expect(mock.map).toBeCalledWith('message2', expected)
		})
	})
})

