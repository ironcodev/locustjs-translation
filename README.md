# locustjs-translation
This library provides multi-lingual translation of texts based on a key/value design.

# Install
```
npm i @locustjs/translation
```

# Import

CommonJs
```javascript
var someFn = require('@locustjs/translation').someFn;
```

ES6
```javascript
import { someFn } from '@locustjs/translation'
```

# Types
## TranslatorBase
An abstract class that defines structure of all translators. It contains translator functionality. Subclasses do not need to override this functionality in order for all translators to work the same way regarding translation. They just need to specify how they provide language resources.

### Properties

| Property | Description |
|----------|-------------|
| `currentLang` | gets or sets translator's current language. default is 'en'. |
| `resources` | an object containing translation resources whose first-level properties are languages. |

### Methods
| Method | Description |
|----------|-------------|
| `addResource(resource, lang?, path?)` | adds a resource to translator. |
| `getResource(lang)` | returns resources of `lang` language. |
| `removeResource(lang)` | removes `lang` language resource from current translator. |
| `translate(key: string, ...args?)` | translates an abstract message `key` based on the current language and the optional `args` arguments. |
| `t(key, ...args?)` | a shorthand for `translate()` that is easier to call. |

## TranslatorDefault
This is a default implementation for `TranslatorBase`.

# Basic Usage

```javascript
const resources = {
    en: { ... },
    fr: { ... },
    de: { ... },
    es: { ... },
}
const translator = new TranslatorDefault();

translator.addResource(resources);

console.log(translator.translate("some.key"));
```

We can also use the shorter `t()` method.

`./services/translator.js`
```javascript
import { TranslatorDefault } from '@locustjs/translation';

const translator = new TranslatorDefault();

translator.addResource(...);

export default translator;
```

```javascript
import { t } from "./services/translator.js"

...
const btnOk = t(`buttons.ok`);
...
```

This comes in handy in UI files like `React`s `JSX` components.

# Language Resources
## Structure
Language resources are defined as a javascript object or a `.json` file, whose first-level property should be language name. They can be added to a translator through `addResource()` method.

```javascript
const resources = {
    en: {
        ok: "Ok",
        cancel: "Cancel"
    },
    fa: {
        ok: "تایید",
        cancel: "انصراف"
    }
}

const translator = new TranslatorDefault();

translator.addResource(resources);
```


## Content
The content and nesting levels of a resource object is completely arbitrary. Developers are free to choose any structure for their resources. All resources should however follow the same structure.

Example:
```javascript
const resources = {
    en: {
        hello: "Hello",
        messages: {
            greeting: "Hello {0}"
        }
    },
    fr: {
        hello: "Bonjoure",
        messages: {
            greeting: "Bonjoure {0}"
        }
    },
    de: {
        hello: "Hallo",
        messages: {
            greeting: "Hallo {0}"
        }
    },
}
```


## Language Name
We can use either full name or the shortcut 2 letter name for language in a resource. However, in reality, it can be any arbitrary name. We just need to make sure to use the same value for our translator's `currentLang` property.

```javascript
const resourceEnUS = {
    "en-us": {
        color: "Color"
    }
}
const resourceEnUK = {
    "en-uk": {
        color: "Colour"
    }
}

const translator = new TranslatorDefault();

translator.addResource(resourceEnUS);
translator.addResource(resourceEnUK);

translator.currentLang = "en-us";

console.log(translator.translate("color"));

```

## Content Separation
It is possible to define and add each resource separately.

```javascript
const resourceEn = {
    en: {
        ok: "Ok",
        cancel: "Cancel"
    }
}
const resourceFa = {
    fa: {
        ok: "تایید",
        cancel: "انصراف"
    }
}

const translator = new TranslatorDefault();

translator.addResource(resourceEn);
translator.addResource(resourceFa);
```

Even resources of a single language can be defined and added as separate objects.

```javascript
const resourceEnMonths = {
    en: {
        months: {
            jan: "January",
            feb: "February",
            ...
        }
    }
}
const resourceEnDays = {
    en: {
        days: {
            sun: "Sunday",
            mon: "Monday",
            ...
        }
    }
}
```

We just need to make sure not to use `Object.assign` or `destructure operator` upon unifying resources, since they apply shallow-merge.

```javascript
const resourceEnMonths = {
    en: {
        months: {
            jan: "January",
            feb: "February",
            ...
        }
    }
}
const resourceEnDays = {
    en: {
        days: {
            sun: "Sunday",
            mon: "Monday",
            ...
        }
    }
}

let resourcesEn;

resourcesEn = Object.assign(resourceEnMonths, resourceEnDays);    // resourceEnMonths' data is lost.
resourcesEn = { ...resourceEnMonths, ...resourceEnDays };         // resourceEnMonths' data is lost again.

const translator = new TranslatorDefault();

translator.addResource(resourceEn);
```

In both cases (using `Object.assign` and `destructure operator`), the content of the `resourceEnMonths` object is lost (since its `en` prop is overwritten by the smae prop in `resourceEnDays`).

We need to perform a ***deep-merge*** in order to fix the problem. We can use the [`merge()`](https://github.com/ironcodev/locustjs-extensions-object#mergeobj-obj1-obj2-) function in [@locustjs/extensions-object](https://github.com/ironcodev/locustjs-extensions-object) package to this aim.

```javascript
...
resourcesEn = merge({}, resourceEnMonths, resourceEnDays);    // works
```

Fortunately, theres is no need to do this manual job. `TranslatorBase` performs a deep-merge in its `addResource()` method.

```javascript
const resourceEnMonths = {
    en: {
        months: {
            jan: "January",
            feb: "February",
            ...
        }
    }
}
const resourceEnDays = {
    en: {
        days: {
            sun: "Sunday",
            mon: "Monday",
            ...
        }
    }
}

const translator = new TranslatorDefault();

translator.addResource(resourceEnMonths);   // ok
translator.addResource(resourceEnDays);     // ok
```

## Specifying lang, path
The `addResource()` method, has two optional parameters named `lang` and `path` that simplifies defining resources.

Example:
```javascript
const monthsEn = {
    jan: "January",
    feb: "February",
    ...
}
const daysEn = {
    sun: "Sunday",
    mon: "Monday",
    ...
}

const translator = new TranslatorDefault();

translator.addResource(monthsEn, "en", "months");
translator.addResource(daysEn, "en", "days");
```

As it is seen above, there is no need to define an `en` prop, define and a `months` object in it and put the months texs inside that.

The `path` parameter supports nesting as well.

```javascript
const loginMessages = {
    success: "Welcome!",
    failed: "Login failed",
    error: "Login is not possible now."
};

translator.addResource(loginMessages, "en", "messages.account.login");

/* the end-esult will be as below:
{
    en: {
        messages: {
            account: {
                login: {
                    success: "Welcome!",
                    failed: "Login failed",
                    error: "Login is not possible now."
                }
            }
        }
    }
}
*/
```


## json file
Resources can be put into `.json` files.

en.json
```json
{
    "en": {
        "hello": "Hello",
        "messages": {
            "greeting": "Hello {0}"
        }
    }
}
```
fr.json
```json
{
    "fr": {
        "hello": "Bonjoure",
        "messages": {
            "greeting": "Bonjoure {0}"
        }
    }
}
```
de.json
```json
{
    "de": {
        "hello": "Hallo",
        "messages": {
            "greeting": "Hallo {0}"
        }
    }
}
```

```javascript
import en from 'en.json';
import fr from 'fr.json';
import de from 'de.json';

const translator = new TranslatorDefault();

translator.addResource(en);
translator.addResource(fr);
translator.addResource(de);
```

`.json` files could be defined in any form, as long as they follow the same structure in order for a translator to return a value for a key.

en.json
```json
{
    "hello": "Hello",
    "messages": {
        "greeting": "Hello {0}"
    }
}
```
fr.json
```json
{
    "hello": "Bonjoure",
    "messages": {
        "greeting": "Bonjoure {0}"
    }
}
```
de.json
```json
{
    "hello": "Hallo",
    "messages": {
        "greeting": "Hallo {0}"
    }
}
```

```javascript
import en from 'en.json';
import fr from 'fr.json';
import de from 'de.json';

const translator = new TranslatorDefault({ en, fr, de })
```

Importing `.json` files resuls in adding them to the final bundle. In case our `.json` files are heavy, we can put them in a website and load them using `TranslatorRemote`. This is shown later.

## Organization
It is better to have an organization for the resources, since resources could be lengthy. We are better to split each language resource into multiple parts, put parts into distinct json files and add them all to our translator, instead of having a long lengthy single json file.

For example, instead of a lengthy single `.json` file for a language:

```json
{
    "numbers": {
        "one": ...,
        "two": ...,
        ...
    },
    "months": {
        "january": ...,
        "february": ...,
        ...
    },
    "days": {
        "sunday": ...,
        "monday": ...,
        ...
    }
}
```

We can split it into multiple files:

`numbers.json`
```json
{
    "one": ...,
    "two": ...,
    ...
}
```
`months.json`
```json
{
    "january": ...,
    "february": ...,
    ...
}
```
`days.json`
```json
{
    "sunday": ...,
    "monday": ...,
    ...
}
```

We can then create an `index.js` file that imports the parts and returns them.

```
/resources
    /en
        numbers.json
        months.json
        days.json
        index.js
    /fr
        numbers.json
        months.json
        days.json
        index.js
    /de
        numbers.json
        months.json
        days.json
        index.js
    index.js
```

`/resources/en/index.js`
```javascript
import numbers from './numbers.json'
import months from './months.json'
import days from './days.json'

export {
    numbers,
    months,
    days
}
```

Finally, the toppest `index.js` file imports all language resources, merges them and return the final resource.

`/resources/index.js`
```javascript
import en from './en'
import fr from './fr'
import de from './de'

export {
    en, fr, de
}
```

The result can then be passed to `addResource()`.

```javascript
import { TranslatorDefault } from '@locustjs/translation';
import resources from './resources';

const translator = new TranslatorDefault();

translator.addResource(resources);
```

## Add multiple resources
We can add multiple resources using the `addResources()` method.

```javascript
const en = { ... }
const fr = { ... }
const de = { ... }

translator.addResources(en, fr, de);
```

The `addResources()` supports `lang` and `path` for the first two parameters as well. If it sees, the first two parameters are not object, it treats them as `lang` and `path`.

Example 1:
```javascript
const en1 = {   // no need to define a 'en' prop
    months: { ... },
    days: { ... },
    seasons: { ... }
    ...
}
const en2 = {   // no need to define a 'en' prop
    messages: { ... }
    ...
}
const en3 = {   // no need to define a 'en' prop
    components: { ... }
    ...
}

translator.addResources('en', en1, en2, en3);
```

Example 2:
```javascript
// suppose these are the messages of a service named Account that has 3 methods register(), login(), forgotPassword().

const register = {   // no need to define en: { account: { }} object
    no_username: 'Please specify a username for yourself.',
    no_password: 'Please specify a password for yourself.',
    invalid_username: 'Invalid username.'
    invalid_password: 'Password must have between {min} and {max} characters.',
    succeeded: 'Registration succeeded.',
    failed: 'Registration failed.'
}
const login = {
    no_username: 'Please enter your username.',
    no_password: 'Please enter your password.',
    succeeded: 'Welcome {name}',
    failed: 'Username/password is incorrect.'
}
const forgotPassword = {
    no_username: 'Please enter your username.',
    succeeded: 'A password reset link was sent to your email. Please check your mailbox and click the link.',
    failed: 'Sending password reset link failed. Please try again later.'
}

translator.addResources('en', 'services.account', register, login, forgotPassword);
```

# Parametric translation
The second parameter in `translate(key, ...args)` method is a list of parameters that can be embeded inside translated texts.

We can define parameters for a value in a resource using `{}` notation.

`translate()` uses [`format()`](https://github.com/ironcodev/locustjs-extensions-string?tab=readme-ov-file#formatstr-args) function under the hood from [`@locustjs/extensions-string`](https://github.com/ironcodev/locustjs-extensions-string) library in order to embed the arguments. So, defining parameters and passing values follows what `format()` provides in this regard.

```javascript
const resources = {
    en: {
        hello: "Hello",
        messages: {
            greeting: "Hello {0}"
        }
    },
    fr: {
        hello: "Bonjoure",
        messages: {
            greeting: "Bonjoure {0}"
        }
    },
    de: {
        hello: "Hallo",
        messages: {
            greeting: "Hallo {0}"
        }
    },
}

const translator = new TranslatorDefault()

translator.addResource(resources);

console.log(translator.translate('hello', 'John Doe')); // Hello John Doe

translator.currentLang = 'fr';

console.log(translator.translate('hello', 'John Doe')); // Bonjoure John Doe
```

## TranslatorRemote
`TranslatorRemote` is a translator that is able to fetch language resources by their URL and add them to its resources.

| Property | Description |
|----------|-------------|
| `loadResource(url, lang?, path)?` | fetches a resource at given `url` and adds it to current translator's resources. |
| `loadResources(...urls)?` | fetches an array of url resources and adds it to current translator's resources. |
| `loadLanguageResources(lang, ...urls)?` | fetches an array of url resources for the given `lang` and adds them to current translator's resources. |
| `loadLanguagePathResources(lang, path, ...urls)?` | fetches an array of url resources for the given `lang` and `path` and adds them to current translator's resources. |

```javascript
/*
/locales/en.json
{
    "en": {
        "some": {
            "key": "Some Value"
        }
    }
}

/locales/de.json
{
    "de": {
        "some": {
            "key": "ein gewisser Wert"
        }
    }
}
*/
const translator = new TranslatorRemote();

await translator.loadResource("/locales/en.json");
await translator.loadResource("/locales/de.json");

// or

await translator.loadResources("/locales/en.json", "/locales/fr.json", "/locales/de.json");
```

All the load resources methods in `TranslatorRemote` return `ServiceResponse`.
