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

		describe('when we force calling an existing plugin', () => {
			it('loads it as normal', () => {
				const modules = {
					module1: { 'test:message': config => data => `${data}-1` },
				}
				expect(()=>plug(modules).init(['module1'])).not.toThrow()
			})
		})

		describe('when we force calling a non-existing plugin', () => {
			it('throws an error', () => {
				const modules = {
					module1: { 'test:message': config => data => `${data}-1` },
				}
				expect(()=>plug(modules).init(['module2'])).toThrow('plugin module2 is missing')
			})
		})
	})

	describe('Calling plugins', () => {
		describe('when we call plugins in sequence', () => {
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

