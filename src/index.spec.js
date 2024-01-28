import plug from './index.js'

describe('<<< iPlug >>> the lightest plugin manager/message bus for JavaScript', () => {
	describe('Setup', () => {

		describe('when we pass a plugin', () => {
			it('makes it available for calling', async () => {
				debugger;
				const modules = {
					module1: () => ({ 'test:message': data => `hello ${data}` }),
				}
				const plugins = await plug(modules)
				expect(plugins.serial('test:message', 'world')).toBe('hello world')
			})

			describe('if it\'s exported as a function that returns a manifest object', () => {
				it('executes it', async () => {
					const modules = {
						module1: () => ({ 'test:message': data => `hello` }),
					}
					const plugins = await plug(modules)
					expect(plugins('test:message', '0')).toBe('hello')
				})

				it('passes a moduleConfig parameter', async () => {
					const moduleConfig = 'xxx123'
					const modules = {
						module1: { 'test:message': () => moduleConfig },
					}
					const plugins = await plug(modules, moduleConfig)
					expect(plugins('test:message', '0')).toBe(moduleConfig)
				})
			})
		})

		describe('Enabling plugins', () => {
			describe('when we initialise an existing plugin', () => {
				it('loads it as normal', async () => {
					const modules = {
						module1: { 'test:message': data => `${data}-1` },
					}
					expect(()=>plug(modules)).not.toThrow()
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
				const initialData = 'initial-data'
				const output1 = 'hello from module1'
				const output2 = 'hello from module2'
				const modules = {
					module1: { 'test:message': config => data => `${data}${output1}` },
					module2: { 'test:message': config => data => `${data}${output2}` },
				}
				const plugins = plug(modules).init()
				expect(plugins('test:message', initialData)).toBe(`${initialData}${output1}${output2}`)
			})

			describe('When no plugin is actually defined', () => {
				it('returns the initial data, unchanged', () => {
					const modules = {
					}
					const initialData = 'initial-data'
					const plugins = plug(modules).init()

					expect(plugins.reduce('test', initialData)).toEqual(initialData)
				})
			})

			describe('When no plugin is actually called/interested', () => {
				it('returns the initial data, unchanged', () => {
					const modules = {
						module1: { 'other:topic': config => data => 'other-stuff' },
						module2: { 'other:topic': config => data => 'other-stuff' },
					}
					const initialData = 'initial-data'
					const plugins = plug(modules).init()

					expect(plugins.chain('test', initialData)).toEqual(initialData)
				})
			})

			describe('When a plugin doesn`t register for an event', () => {
				it('it`s treated as if didn`t exist', () => {
					const output1 = 'hello from module1'
					const output3 = 'hello from module3'
					const modules = {
						interested1: { 'test:message': config => data => `${data}-interested1` },
						notInterested1: { 'test:message': config => undefined },
						interested2: { 'test:message': config => data => `${data}-interested2`},
						notInterested2: { 'test:message': config => undefined },
						notInterested3: { 'test:message': config => undefined },
					}
					const plugins = plug(modules).init()
					const result = plugins
						.chain('test:message', 'initial')

					expect(result).toEqual('initial-interested1-interested2')
				})
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

			describe('When no plugin is defined', () => {
				it('returns an empty array', () => {
					const modules = {
					}
					const initialData = 'xxx12345'
					const plugins = plug(modules).init()

					expect(plugins.map('test', initialData)).toEqual([])
				})
			})

			describe('When no plugin is actually called', () => {
				it('returns an empty array', () => {
					const modules = {
						module1: { 'no:matching:message': config => data => 99999 },
						module2: { 'no:matching:message': config => data => 99999 },
					}
					const initialData = 'xxx12345'
					const plugins = plug(modules).init()

					expect(plugins.map('test', initialData)).toEqual([])
				})
			})

			describe('When a plugin doesn`t register for an event', () => {
				it('it`s treated as if didn`t exist', () => {
					const output1 = 'hello from module1'
					const output3 = 'hello from module3'
					const modules = {
						module1: { 'test:message': config => data => output1 },
						module2: { 'test:message': config => undefined },
						module3: { 'test:message': config => data => output3},
					}
					const plugins = plug(modules).init()

					expect(plugins.map('test:message')).toEqual([output1, output3])
				})
			})

		})

	})
})

