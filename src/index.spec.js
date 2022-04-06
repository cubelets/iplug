import plug from './index.js'

describe('<<< iPlug >>> the lightest plugin manager/message bus for JavaScript', () => {
	describe('Setup', () => {

		describe('when we pass a plugin', () => {
			it('makes it available for calling', () => {
				const modules = {
					module1: { 'test:message': config => data => `hello` },
				}
				const plugins = plug(modules).init()
				expect(plugins('test:message', '0')).toBe('hello')
			})
		})

		describe('Enabling plugins', () => {
			describe('when we initialise an existing plugin', () => {
				it('loads it as normal', () => {
					const modules = {
						module1: { 'test:message': config => data => `${data}-1` },
					}
					expect(()=>plug(modules).init(['module1'])).not.toThrow()
				})
			})

			describe('when we initialise a non-existant plugin', () => {
				it('throws an error', () => {
					const modules = {
						module1: { 'test:message': config => data => `${data}-1` },
					}
					expect(()=>plug(modules).init(['module2'])).toThrow('plugin module2 is missing')
				})
			})
		})
	})

	describe('Calling plugins', () => {
		describe('when we call plugins in sequence', () => {

			it('returns a single item', () => {
				const modules = {
					module1: { 'test': config => data => 1 },
					module2: { 'test': config => data => 2 },
					module3: { 'test': config => data => 3 },
				}
				const plugins = plug(modules).init()
				expect(plugins.reduce('test')).toEqual(3)
			})

			it('calls them in order', () => {
				const modules = {
					module1: { 'test:message': config => data => `${data}-1` },
					module2: { 'test:message': config => data => `${data}-2` },
				}
				const plugins = plug(modules).init()
				expect(plugins('test:message', '0')).toBe('0-1-2')
				expect(plugins.chain('test:message', '0')).toBe('0-1-2')
			})

		})

		describe('when we call plugins in parallel', () => {

			it('returns an array of results', () => {
				const modules = {
					module1: { 'test': config => data => 1 },
					module2: { 'test': config => data => 2 },
					module3: { 'test': config => data => 3 },
				}
				const plugins = plug(modules).init()
				expect(plugins.map('test')).toEqual([1, 2, 3])
			})

			it('calls them in order', () => {
				const modules = {
					module1: { 'test:message': config => data => `${data}-1` },
					module2: { 'test:message': config => data => `${data}-2` },
				}
				const plugins = plug(modules).init()
				expect(plugins.parallel('test:message', '0')).toEqual(['0-1', '0-2'])
				expect(plugins.map('test:message', '0')).toEqual(['0-1', '0-2'])
			})

		})

	})
})

