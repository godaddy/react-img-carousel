# react-img-carousel

This component renders a carousel with support for lazy loading, autoplay, infinite scrolling, touch events and more.

Usage:
----------------

Render a carousel instance passing the necessary props (Note: In order to load the required CSS file with the below syntax,
you will need to use some kind of module loader/bundler like Webpack or Browserify):

```js
import React from 'react';
import { render } from 'react-dom';
import { Carousel } from 'react-carousel';

require('react-carousel/lib/carousel.css');

render(
  <Carousel viewportWidth="400px" cellPadding={ 5 }>
    <img src='https://placekitten.com/200/300'/>
    <img src='https://placekitten.com/300/300'/>
    <img src='https://placekitten.com/400/300'/>
  </Carousel>,
  document.body
);

```

Running test page:
----------------

Clone the repository, run `npm i` and then run `npm start` and point your browser to
`localhost:8080/webpack-dev-server/`

Available props:
----------------

#### initialSlide
`React.PropTypes.number`

Determines the first visible slide when the carousel loads, defaults to `0`.

#### width
`React.PropTypes.string`

Determines the width of the outermost carousel div. Defaults to `100%`.

#### height
`React.PropTypes.string`

Determines the height of the outermost carousel div. Defaults to `auto`.

#### viewportWidth
`React.PropTypes.string`

Determines the width of the viewport which will show the images. If you don't want the previous/next images to be
visible, this width should match the `slideWidth` prop or the width of the child images. Defaults to `100%`.

#### viewportHeight
`React.PropTypes.string`

Determines the height of the viewport which will show the images. Defaults to `auto`.

#### className
`React.PropTypes.string`

Optional class which will be added to the carousel class.

#### dots
`React.PropTypes.bool`

If `false`, the dots below the carousel will not be rendered.

#### arrows
`React.PropTypes.bool`

If `false`, the arrow buttons will not be rendered.

#### infinite
`React.PropTypes.bool`

If `true`, clicking next/previous when at the end/beginning of the slideshow will wrap around.

#### lazyLoad
`React.PropTypes.bool`

If `false`, the carousel will render all children at mount time and will not attempt to lazy load images. Note that
lazy loading will only work if the slides are `img` tags or if both `slideWidth` and `slideHeight` are specified.

#### imagesToPrefetch
`React.PropTypes.number`

If `lazyLoad` is set to `true`, this value will be used to determine how many images to fetch at mount time. Defaults
to `5`.

#### cellPadding
`React.PropTypes.number`

Number of pixels to render between slides.

#### slideWidth
`React.PropTypes.string`

Used to specify a fixed width for all slides. Without specifying this, slides will simply be the width of their content.

#### slideHeight
`React.PropTypes.string`

Used to specify a fixed height for all slides. Without specifying this, slides will simply be the height of their
content.

#### beforeChange
`React.PropTypes.func`

Optional callback which will be invoked before a slide change occurs. Should have method signature
`function(newIndex, prevIndex)`

#### afterChange
`React.PropTypes.func`

Optional callback which will be invoked after a slide change occurs. Should have method signature
`function(newIndex)`

#### transition
`React.PropTypes.oneOf(['fade', 'slide'])`

The type of transition to use between slides, defaults to `slide`.

#### transitionDuration
`React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string])`

Time for the transition effect between slides, defaults to `500`. If a number is specified, it indicates the number of
milliseconds. Strings are parsed using [ms](https://www.npmjs.com/package/ms).

#### clickToNavigate
`React.PropTypes.bool`

Controls whether or not clicking slides other than the currently selected one should navigate to the clicked slide.
Defaults to `true`.

#### autoplay
`React.PropTypes.bool`

If `true`, the slideshow will automatically advance.

#### autoplaySpeed
`React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string])`

Time to wait before advancing to the next slide when `autoplay` is `true`. Defaults to `4000`. If a number is specified,
it indicates the number of milliseconds. Strings are parsed using [ms](https://www.npmjs.com/package/ms).

#### draggable
`React.PropTypes.bool`

Controls whether mouse/touch swiping is enabled, defaults to `true`.

#### pauseOnHover
`React.PropTypes.bool`

Controls whether autoplay will pause when the user hovers the mouse cursor over the image, defaults to `true`.

#### controls
`React.PropTypes.arrayOf(React.PropTypes.shape({ component: React.PropTypes.func.isRequired, props: React.PropTypes.object, position: PropTypes.oneOf(['top', 'bottom']) }))`

Optional array of controls to be rendered in the carousel container. Each control's component property should be a React
component constructor, and will be passed callback props `nextSlide`, `prevSlide` and `goToSlide` for controlling
navigation, and `numSlides`, `selectedIndex` and `infinite` for rendering the state of the carousel.

Tests:
----------------

```bash
npm install && npm test
```
