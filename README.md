<h1 align="center">Aurelia Swipeout</h1>
<p align="center">A custom element for iOS style swipeout actions, backed by <a href="http://hammerjs.github.io/">Hammer.js</a></p>
<p align="center"><a href="https://michaelbull.github.io/aurelia-swipeout/">Demo</a></p>
<p align="center">
  <a href="#readme">
    <img src="https://github.com/michaelbull/aurelia-swipeout/blob/master/example/preview.gif?raw=true" alt="Preview" width="450" height="410" />
  </a>
</p>
<br/>

## Installation

Install the package via [npm][npm]:

```bash
npm install --save aurelia-swipeout
```

Install the plugin in your [Aurelia][aurelia] project:

```typescript
export function configure(aurelia: Aurelia): void {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-swipeout'));
}
```

Import the [Sass][sass] stylesheet:

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

  <div slot="content">
    Hello World
  </div>
</swipeout>
```

Which results in the following:

![Example](https://github.com/michaelbull/aurelia-swipeout/blob/master/example/simple.gif?raw=true)

## Contributing

Bug reports and pull requests are welcome on [GitHub][github].

## License

This project is available under the terms of the ISC license. See the
[`LICENSE`](LICENSE) file for the copyright information and licensing terms.

[npm]: https://www.npmjs.com/package/aurelia-swipeout
[aurelia]: http://aurelia.io/
[sass]: http://sass-lang.com/
[example]: https://github.com/michaelbull/aurelia-swipeout/blob/master/example/app.html#L24
[github]: https://github.com/michaelbull/aurelia-swipeout
