import { mockPlug } from '../dist/index.mjs'

import module from './sync-plugin.js'


describe('testing an async plugin', () => {
	describe('on message1', () => {
		it('emits message2', async () => {
			const payload = 'test payload'
			const expected = `hello from message1 handler, handling "${payload}"`

			//let mock = createMock()
			let mock = mockPlug(jest.fn);
			const plugin = await module(mock)
			await plugin['message1'](payload)

			//mock = await mock
			//expect.assertions(1)
			expect(mock.map).toBeCalledWith('message2', expected)
		})
	})
})

