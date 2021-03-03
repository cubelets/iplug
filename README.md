# plug

> A lightweight plugin manager.

## Install

Using npm:

```sh
npm install --save plug
```

or using yarn:

```sh
yarn add plug --dev
```

## Usage

You want to use plugins to extend the functionality of your code.
Given a list of plugins, your application will first initialise and then run them.

### Hello World

```
import {examplePlugin} from './examplePlugin.js
const pluginsList = [examplePlugin]
const config = {
	lang: 'en'
}
const plugins = plug(pluginsList, config)

const initialData = 'Hello'
const result = plugins('message', initialData) // 'Hello, world'

Each plugin exports a hash of hooks that can process input and return an output.
examplePlugin.js
```
export default {
	'exampleMessage': config => data => `${data}, world!`
}

### Content Moderation
You want to use plugins to moderate content before rendering

module.js
```
import {moderation} from './moderation.js
const pluginsList = [moderation]
const config = { }
const plugins = plug(pluginsList, config)

const initialData[] = await fetch('/api/getMessages').then(x=>x.json())
const result = plugins('moderate', data)
```

moderation.js
```
export default {
	'moderate': config => {
		const blackList = await fetch('/word-blacklist').then(x=>x.json())
		return data[] => data.map(str => blackList.forEach(word => str.replace(word, '###redacted###')))
	}
}

### HTML Plugins


### Duplex streams via Observables (like a messagebus)

