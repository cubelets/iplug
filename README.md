# replug

> A minimalistic plugin manager for the Map/Reduce and the Observable world

## Install

Using npm:

```sh
npm install --save @cubelets/replug
```

## Usage

You are a map/reduce user and you want to use plugins to extend your code.

map: you pass your initial data to your plugins in parallel. Your plugins map, you reduce.
reduce: you feed your data to your plugins for a chained processing. Your plugins reduce.

Given a list of plugins, your application will first initialise and then run them.

## Examples
### Render HTML modules

```
import {login} from './plugins/login.js
import {advert} from './plugins/advert.js

const config = {
	theme: 'dark'
}
const plugins = replug([login, advert], config)
document.getElementById('view').innerHTML = plugins('render', '').join('<br>')
```

Each plugin will then export one or more event handlers.
plugins/login.js
```
export default {
	'render': config => data => `<div class="${config.theme}">
		<input id="user">
		<input id="password" type="password">
	</div>`
}
```
plugins/advert.js
```
export default {
	'render': config => data => `<div class="${config.theme}">
		<div class="mpu">
			your ad here
		</div>
	</div>`
}
```


### Ad Targeting

```
import {module1} from './plugins/module1.js
1mport {module2} from './plugins/module2.js

const config = {
	// optional initial configuration
}
const plugins = replug([module1, module2], config)

const data = {}
const result = plugins.reduce('ads:targeting', data) // 4
```

Each plugin will then export one or more event handlers.
module1.js
```
export default {
	'example:message': config => data => data*2
}
```


### Double

```
import {double} from './double.js

const config = {
	// optional initial configuration
}
const plugins = replug([double], config)

const data = 2
const result = plugins('example:message', data) // 4
```

Each plugin will then export one or more event handlers.
examplePlugin.js
```
export default {
	'example:message': config => data => data*2
}
```

### Content Moderation
You want to use plugins to moderate content before rendering

module.js
```
import {moderation} from './moderation.js
const pluginsList = [moderation]
const config = { }
const plugins = replug(pluginsList, config)

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

