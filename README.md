# Aurelia Swipeout

A custom element for iOS style swipeout actions, backed by Hammer.js

[Demo][demo].


<p align="center">
  <a href="#readme">
    <img src="https://github.com/michaelbull/aurelia-swipeout/blob/master/preview.gif?raw=true" alt="Preview" />
  </a>
</p>

## Installation

Install the package via [npm][npm]:

```
npm install --save aurelia-swipeout
```

Install the plugin in your Aurelia project:

```typescript
export function configure(aurelia: Aurelia): void {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-swipeout'));
}
```

Import the the [Sass][sass] stylesheet:

```sass
@import '~aurelia-swipeout/style/swipeout';
```

## Usage

A full example can be found [here][example].

Below is a simplified usage example:

```html
<swipeout>
  <div slot="left">
    <div class="swipeout__action">
      <button class="swipeout__button">
        My Left Action
      </button>
    </div>
  </div>

  <div slot="right">
    <div class="swipeout__action">
      <a class="swipeout__button">
        My Right Action
      </a>
    </div>
  </div>

  <div slot="overlay">
    Hello world
  </div>
</swipeout>
```

Which results in the following:

![Example][https://github.com/michaelbull/aurelia-swipeout/blob/master/example.gif?raw=true]


[hammerjs]: http://hammerjs.github.io/
[demo]: https://michaelbull.github.io/aurelia-swipeout/
[npm]: https://www.npmjs.com/package/aurelia-swipeout
[sass]: http://sass-lang.com/
[example]: https://github.com/michaelbull/aurelia-swipeout/blob/master/example/app.html#L24
