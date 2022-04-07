# iPlug
> The lightest JavaScript plugin system / plugin manager / messagebus for the map/reduce world

## Installation
Using npm:

``` sh
npm install --save iplug
```

## Usage
You want to use plugins to dynamically extend the functionality of your code.

The core part of your application loads your plugins and creates one or more message buses to communicate with them, through a number of topics.
Plugins can register their interest to any number of topics.
When you want to defer control to plugins you emit a message on a topic and all registered plugins will be invoked, sequentially or in parallel.


### Hello World

**`main.js`**
``` js
import iplug from 'iplug'

import module1 from './plugins/module1.js'
import module2 from './plugins/module2.js'

const modules = {
	module1,
	module2,
}

const plugins = iplug(modules).init()

function main() {
	const input = 'test payload'
	const output = plugins.chain('test:message', input)
	console.log(output)
}

main()
```

Each plugin exports an object with the messagebus messages it wants to process.

**`example-plugin.js`**
``` js
export default {
	'category1:message1': config => data => `result for a call to category1:message1 - payload was ${data}`,
	'category2:message2': config => data => `result for a call to category1:message1 - payload was ${data}`,
}
```

### Map, Reduce, Chain, All
There are two ways you can call plugins: in sequence, or in parallel.

#### Sequential processing
Calling plugins in sequence means starting with an optional initial value, and chaining it through each, so the output of one becomes the input of the next, and the final result is the output of the last.
This is useful when your plugins can be somewhat aware of each-other and the output of any may be the final one.

**`main.js`**
``` js
// this returns the output of the last plugin in the chain
plugins.chain(<message> [, initial data])
plugins.reduce(<message> [, initial data])
plugins(<message>, [initial data])
```

`reduce` is an alias for `chain`.
For chained calls you can also omit both the `chain` or `reduce` keywords and just call:

#### Parallel processing
Calling plugins in parallel means passing the same optional initial value, then collecting the results of each together, which come out as an array, perhaps for further processing.
This is useful if you want to run many plugins in parallel, especially async ones, or that need to run in isolation from the input or the output of the other plugins.

**`main.js`**
``` js
// this returns an array of your plugins' output
plugins.map(<message> [, initial data])
plugins.all(<message> [, initial data])
plugins.parallel(<message> [, initial data])
```

`all` is an alias for `map`

### Example: Content Moderation
You want to use plugins to moderate content before rendering it, by passing it through a number of plugins, each of which has to approve the content.

**`module.js`**
``` js
import {moderation} from './moderation.js
const pluginsList = [moderation]
const config = { }
const plugins = iplug(pluginsList, config)

const initialData[] = await fetch('/api/getMessages').then(x=>x.json())
const result = plugins('moderate', data)
```

**`moderation.js`**
``` js
export default {
	'moderate': config => {
		const blackList = await fetch('/word-blacklist').then(x=>x.json())
		return data[] => data.map(str => blackList.forEach(word => str.replace(word, '###redacted###')))
	}
}
```

### Advanced usage: streaming plugins with Observables
You may want each plugin to emit more data over time, effectively exposing an Observable interface back to the main application

**`plugin.js`**
``` js
import { Observable } from 'rxjs'
const sourceStream = Observable(...)

export default {
	'getdata': config => data => sourceStream,
}
```

**`app.js`**
``` js
import { merge } from 'rxjs'

// Get an Observable from each plugin.
const streams = streamingPlugins.map('getdata')
merge(streams)
	.subscribe(doSomething)

```

### Advanced usage: duplex streams via Observables
You can pass an observable to each of your plugins and get one back to enable two-way communication over time

**`echo.js`**
``` js
import { Observable } from 'rxjs'
const sourceStream = Observable(...)

export default {
	'duplex': config => { inputStream } => inputStream.map(inputMessage=>`This is a reply to ${inputMessage}.`,
}
```

**`app.js`**
``` js
import { Subject } from 'rxjs'
import { merge } from 'rxjs'

const outputStream = new Subject()

const streams = streamingPlugins.map('duplex', outputStream)
merge(streams)
	.subscribe(doSomething)

```

## Why should every plugin export a function returning a function?
This extra step allows some plugins to perform some one-time (perhaps slow) initialisation and return a "production" function that's geared-up for high performance repeated executions.
It's often best to perform initialisation in the main handler function to enable multiple instances of the same plugin to be used in different isolated contexts (multiple message buses in the same application).

**`plugin.js`**
``` js
// some global initialisation can go here, but the state will be shared!
// ...

export default {
	'message:handler': config => {
		// perform some more initialisation here when you want more isolation.
		// const slow = slowOperation
		return data => {
			// put your performance-optimised code here, to run multiple times
		}
	}
}
```

**`main.js`**
``` js
// The following two message buses are meant to run independently
const messageBus1 = plugins()
const messageBus2 = plugins()

// The following two calls will be run in isolation from each-other
messageBus1.chain('message:handler')
messageBus2.chain('message:handler')
```

## Unit testing your plugins
Writing unit tests for your plugins should be just as simple as calling the function they export for a particular event/topic.

``` js
import plugin from '/plugins/double-it.js'

describe('plugin1', () => {
	describe('when handling a "test:topic"', () => {

		it('doubles its input', () => {
			const fn = plugin['test:topic']()
			expect(fn(2)).toEqual(4)
		});

	});
});
```

Following is an example unit test for a hypothetical plugin that returns 0, written for Jest, but easily adaptable to other test frameworks.

``` js
import plugin from '/plugins/plugin2.js'
import fixture from '/plugins/plugin2.fixture.js'

describe('plugin2', () => {
	describe('when handling a "test:event"', () => {

		it('returns 0', () => {
			const fn = plugin['test:event']()
			const result = fn(fixture)
			expect(result).toEqual(0)
		});

	});
});
```

## Examples
You can find more [examples](https://github.com/cubelets/iplug/tree/master/examples) in the respective folder

