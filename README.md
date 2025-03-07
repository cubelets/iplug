# iPlug
> The lightest JavaScript plugin system for the Map/Reduce World

![iPlug Logo](./iplug-github.png)

## Installation
```sh
npm install --save iplug
```

## Usage
Extend your JavaScript application with declarative plugins

Your application loads your plugins and creates one or more message buses to communicate with them through a number of topics.
Plugins can register their interest to any number of topics within the scope of a message bus. There can be multiple message buses in your application.
When you want to defer control to your plugins you emit a message on a topic/channel and all registered plugins will be invoked, either sequentially or in parallel.

### Example

``` js
// main.js
import iplug from 'iplug'

import module1 from './plugins/module1.js'
import module2 from './plugins/module2.js'

const modules = {
  module1,
  module2,
}

const plugins = iplug(modules)

function main() {
  const input = 'test payload'
  const output = plugins.serial('test:message', input)
  console.log(output)
}

main()
```

Each plugin module can export either:
A "manifest object":
``` js
export default {
  'message': data => doSomethingWith(data),
  // ...
}
```
Or a function that takes (messagebus, config) and returns a manifest object
``` typescript
export default (messagebus: IPlugMessagebus, config: IPlugConfig): PluginManifest => {
  // keep state here for better testability

  return {
    'message': data => doSomethingWith(data),
    // ...
  }
}
```

A manifest object is one whose keys are messagebus topics (typically strings) we want to register to and corresponding handler functions
**`example-plugin.js`**
``` js
export default {
  'category1:message1': data =>
    `result for a call to category1:message1 - payload: ${data}`,

  'category2:message2': data =>
    `result for a call to category1:message1 - payload: ${data}`,
}
```

### Map, Reduce, Chain, All
There are two ways you can call plugins: in sequence, or in parallel.

#### Sequential processing
Calling plugins in sequence means starting with an optional initial value, and chaining it through each, so the output of one becomes the input of the next, and the final result is the output of the last.
This is useful when your plugins can be somewhat aware of each-other and the output of any may be the final one.

``` js
// main.js
// this returns the output of the last plugin in the chain
plugins.serial(<message> [, initial data])
plugins.reduce(<message> [, initial data])
plugins(<message> [, initial data])
```

If no plugins are registered for a topic, emitting a message returns the initial data, if provided, undefined otherwise.
``` js
// main.js
// no plugin handles 'empty topic'
plugins.serial('empty topic', 'default data')

// returns 'default data'
```

#### Parallel processing
You can call plugins in parallel, sync or async ones. Initial data will be passed to each as an argument.

``` js
// main.js
// this returns an array of your plugins' output
plugins.map(<message> [, initial data])
plugins.parallel(<message> [, initial data])
```

#### Singleton processing
Occasionally, you may need to only allow one plugin to handle a topic

``` js
// main.js
// this only runs at most one plugin and returns its output. If more than one are registered, only the first is run, the others are ignored.
// If no handler is registered, the initial data is returned
plugins.one(<message> [, initial data])
```

### Example: Content Moderation
You want to use plugins to moderate content before rendering it, by passing it through a number of plugins, each of which has to approve the content.

``` js
// module.js
import {moderation} from './moderation.js
const config = {
  moderation: { enabled: true },
};

const plugins = await iplug({moderation}, config);

const initialData = await fetch('/api/getMessages').then(x=>x.json());
const result = plugins('moderate', data);
```

``` js
// moderation.js
export default async () => {
  const blackList = await fetch('/word-blacklist')
    .then(x=>x.json());

  return {
    'moderate': data => data.map(str =>
      blackList.forEach(word =>
        str.replace(word, '###redacted###')
      )
    )
  }
};
```

### Advanced usage: streaming plugins with Observables
You may want each plugin to emit more data over time, effectively exposing an Observable interface back to the main application

``` js
// plugin.js
import { Observable } from 'rxjs'
const sourceStream = Observable(...);

export default {
  'getdata': data => sourceStream,
}
```

``` js
// app.js
import { merge } from 'rxjs';

// Get an Observable from each plugin.
const plugins = await iplug({});
const streams = streamingPlugins.map('getdata');
merge(streams).pipe(
  subscribe(doSomething)
);
```

### Advanced usage: duplex streams via Observables
You can pass an observable to each of your plugins and get one back to enable two-way communication over time

``` js
// echo.js
import { map } from 'rxjs'

export default {
  'duplex': ({ inputStream }) => inputStream.pipe(
    map(inputMessage=>`This is a reply to ${inputMessage}.`)
  ),
}
```

``` js
// app.js
import { Subject, merge } from 'rxjs'

const outputStream = new Subject();

const allStreams = merge(streamingPlugins.pipe(
  map('duplex', outputStream)
));

allStreams.subscribe(doSomething);

```

## Unit testing plugins
Writing unit tests for your plugins should be just as simple as calling the function they export for a particular event/topic.

``` js
import module from '/plugins/double-it.js'

describe('plugin1', () => {
  describe('when handling a "test:topic"', () => {

    it('doubles its input', () => {
      const plugin = module();
      const fn = plugin['test:topic']();
      expect(fn(2)).toEqual(4);
    });

  });
});
```

Following is an example unit test for a hypothetical plugin that returns 0, written for Jest, but easily adaptable to other test frameworks.

``` js
import module from '/plugins/plugin2.js'
import fixture from '/plugins/plugin2.fixture.js'

describe('plugin2', () => {
  describe('when handling a "test:event"', () => {

    it('returns 0', () => {
      const plugin = module();
      const fn = plugin['test:event']();
      const result = fn(fixture);
      expect(result).toEqual(0);
    });

  });
});
```

### Using Globals
Global variables, even inside an ES6 module, can pose various challenges to unit testing.
Consider the follwing plugin:

``` js
const globalState = get_some_state();

export default {
  'message:handler': config => data => globalState(data),
}
```

The problem here is sometimes it can be hard for test frameworks to mock or stub `globalState` in order to force a certain behaviour.
What you may experience is the first time a unit test runs, the globalState may be mocked as expected, but at subsequent runs, re-mocking or re-stubbing may just not work, failing the tests.

A solution to this problem is creating a plugin that exports a function, which in turn will return everything else.

``` js
export default function() {
  const globalState = get_some_state();

  return {
    'message:handler': config => data => globalState(data),
  }
}
```

This way, no global state will remain between test runs.

``` js
import initModule from '/plugins/plugin.js'

describe('plugin', () => {
  describe('when handling a "test:event"', () => {

    it('returns 0', () => {
      // Loading the plugin from a test will need this one extra line
      const plugin = initModule();

      const fn = plugin['test:event']();
      const result = fn(fixture);
      expect(result).toEqual(0);
    });

  });
});
```

## Examples
You can find more [examples](./examples) in the respective folder
