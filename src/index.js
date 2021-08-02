/* eslint
  jsx-a11y/mouse-events-have-key-events: 0,
  jsx-a11y/no-noninteractive-element-interactions: 0,
  jsx-a11y/click-events-have-key-events: 0 */
import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import ms from 'ms';
import classnames from 'classnames';
import { Dots, Arrow } from './controls';
import areChildImagesEqual from './utils/areChildImagesEqual';
import nth from './utils/nth';

const SELECTED_CLASS = 'carousel-slide-selected';
const LOADING_CLASS = 'carousel-slide-loading';
const MAX_LOAD_RETRIES = 500;

/**
 * React component class that renders a carousel, which can contain images or other content.
 *
 * @extends React.Component
 */
export default class Carousel extends Component {

  static get propTypes() {
    return {
      initialSlide: PropTypes.number,
      className: PropTypes.string,
      transition: PropTypes.oneOf(['slide', 'fade']),
      dots: PropTypes.bool,
      arrows: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.shape({
          left: PropTypes.node.isRequired,
          right: PropTypes.node.isRequired,
          className: PropTypes.string
        })
      ]),
      infinite: PropTypes.bool,
      children: PropTypes.any,
      viewportWidth: PropTypes.string,
      viewportHeight: PropTypes.string,
      width: PropTypes.string,
      height: PropTypes.string,
      imagesToPrefetch: PropTypes.number,
      maxRenderedSlides: PropTypes.number,
      cellPadding: PropTypes.number,
      slideWidth: PropTypes.string,
      slideHeight: PropTypes.string,
      slideAlignment: PropTypes.oneOf(['left', 'center', 'right']),
      beforeChange: PropTypes.func,
      afterChange: PropTypes.func,
      transitionDuration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      autoplay: PropTypes.bool,
      autoplaySpeed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      lazyLoad: PropTypes.bool,
      controls: PropTypes.arrayOf(PropTypes.shape({
        component: PropTypes.func.isRequired,
        props: PropTypes.object,
        position: PropTypes.oneOf(['top', 'bottom'])
      })),
      draggable: PropTypes.bool,
      pauseOnHover: PropTypes.bool,
      clickToNavigate: PropTypes.bool,
      dragThreshold: PropTypes.number,
      onSlideTransitioned: PropTypes.func,
      easing: PropTypes.oneOf([
        'ease',
        'linear',
        'ease-in',
        'ease-out',
        'ease-in-out'
      ]),
      style: PropTypes.shape({
        container: PropTypes.object,
        containerInner: PropTypes.object,
        viewport: PropTypes.object,
        track: PropTypes.object,
        slide: PropTypes.object,
        selectedSlide: PropTypes.object
      })
    };
  }

  static get defaultProps() {
    return {
      initialSlide: 0,
      dots: true,
      arrows: true,
      infinite: true,
      viewportWidth: '100%',
      width: '100%',
      height: 'auto',
      imagesToPrefetch: 5,
      maxRenderedSlides: 5,
      cellPadding: 0,
      slideAlignment: 'center',
      transitionDuration: 500,
      autoplay: false,
      autoplaySpeed: 4000,
      lazyLoad: true,
      controls: [],
      draggable: true,
      pauseOnHover: true,
      transition: 'slide',
      dragThreshold: 0.2,
      clickToNavigate: true,
      easing: 'ease-in-out',
      style: {}
    };
  }

  constructor(props) {
    super(...arguments);
    this.state = {
      currentSlide: props.initialSlide,
      loading: props.lazyLoad,
      loadedImages: {},
      slideDimensions: {},
      dragOffset: 0,
      transitionDuration: 0,
      transitioningFrom: null
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { currentSlide } = state;
    const numChildren = Children.count(props.children);

    if (currentSlide >= numChildren) {
      // The currentSlide index is no longer valid, so move to the last valid index
      return {
        currentSlide: numChildren ? numChildren - 1 : 0
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { children, autoplay, slideWidth, slideAlignment } = this.props;
    const { currentSlide, loadedImages, direction, loading, slideDimensions } = this.state;
    const oldChildren = prevProps.children;

    if (direction !== prevState.direction ||
        currentSlide !== prevState.currentSlide ||
        loadedImages !== prevState.loadedImages ||
        slideWidth !== prevProps.slideWidth ||
        slideDimensions.width !== prevState.slideDimensions.width ||
        slideDimensions.height !== prevState.slideDimensions.height ||
        slideAlignment !== prevProps.slideAlignment) {
      // Whenever new images are loaded, the current slide index changes, the transition direction changes, or the
      // slide width changes, we need to recalculate the left offset positioning of the slides.
      this.calcLeftOffset();
    }

    if (!areChildImagesEqual(Children.toArray(children), Children.toArray(oldChildren))) {
      // If the image source or number of images changed, we need to refetch images and force an update
      this._animating = false;
      this.fetchImages();
    }

    if (autoplay && (!loading && prevState.loading || !prevProps.autoplay)) {
      this.startAutoplay();
    }
  }

  componentDidMount() {
    const { lazyLoad, autoplay } = this.props;
    this._isMounted = true;

    if (lazyLoad) {
      this.fetchImages();
    } else {
      if (autoplay) {
        this.startAutoplay();
      }
      this.calcLeftOffset();
    }

    window.addEventListener('resize', this.calcLeftOffset, false);

    if (window.IntersectionObserver) {
      this._observer = new window.IntersectionObserver(entries => {
        if (!this.props.autoplay) {
          return;
        }

        if (entries && entries[0] && entries[0].isIntersecting) {
          this.startAutoplay();
        } else {
          clearTimeout(this._autoplayTimer);
        }
      });
      this._observer.observe(this._containerRef);
    }
  }

  componentWillUnmount() {
    // Remove all event listeners
    this.removeDragListeners();
    window.removeEventListener('resize', this.calcLeftOffset, false);
    document.removeEventListener('mousemove', this.handleMovement, false);
    clearTimeout(this._autoplayTimer);
    clearTimeout(this._retryTimer);
    clearTimeout(this._initialLoadTimer);
    this._observer && this._observer.unobserve(this._containerRef);
    this._isMounted = false;
  }

  /**
   * Starts the autoplay timer if it is not already running.
   */
  startAutoplay() {
    clearTimeout(this._autoplayTimer);
    this._autoplayTimer = setTimeout(() => {
      const { autoplay } = this.props;
      if (autoplay) {
        this.nextSlide();
      }
    }, ms('' + this.props.autoplaySpeed));
  }

  /**
   * Loads images surrounding the specified slide index. The number of images fetched is controlled by the
   * imagesToPrefetch prop.
   */
  fetchImages() {
    const { children } = this.props;
    const { loadedImages, currentSlide } = this.state;
    const slides = Children.toArray(children);
    const imagesToPrefetch = Math.min(this.props.imagesToPrefetch, slides.length);
    const startIndex = currentSlide - Math.floor(imagesToPrefetch / 2);
    const endIndex = startIndex + imagesToPrefetch;
    const pendingImages = [];

    const currentImage = slides[currentSlide].props.src;

    for (let index = startIndex; index < endIndex; index++) {
      const slide = nth(slides, index % slides.length);
      const imageSrc = slide.props.src;
      if (imageSrc && !loadedImages[imageSrc]) {
        pendingImages.push(imageSrc);
      }
    }

    if (pendingImages.length) {
      pendingImages.forEach(image => {
        const img = new Image();
        img.onload = img.onerror = () => {
          if (this._isMounted) {
            this.setState({
              loadedImages: {
                ...this.state.loadedImages,
                [image]: { width: img.width || 'auto', height: img.height || 'auto' }
              }
            }, () => {
              if (image === currentImage) {
                this.handleInitialLoad();
              }
            });
          }
        };
        img.src = image;
      });
    } else {
      this.calcLeftOffset();
    }
  }

  /**
   * Invoked when the carousel is using lazy loading and the currently selected slide's image is first rendered. This
   * method will clear the loading state causing the carousel to render and will calculate the dimensions of the
   * displayed slide to use as a loading shim if an explicit width/height were not specified.
   */
  handleInitialLoad = () => {
    const { currentSlide } = this.state;
    const slides = this._track.childNodes;
    const { slideWidth, slideHeight } = this.props;
    if (!slideWidth || !slideHeight) {
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        if (parseInt(slide.getAttribute('data-index'), 10) === currentSlide) {
          if (!slide.offsetWidth || !slide.offsetHeight) {
            this._initialLoadTimer = setTimeout(this.handleInitialLoad, 10);
            return;
          }
          this.setState({
            slideDimensions: {
              width: slide.offsetWidth,
              height: slide.offsetHeight
            }
          });
          break;
        }
      }
    }
  }

  /**
   * Navigates to the specified slide index, moving in the specified direction.
   *
   * @param {Number} index - The slide index to move to.
   * @param {String} direction - The direction to transition, should be 'right' or 'left'.
   * @param {Boolean} autoSlide - The source of slide transition, should be true for autoPlay and false for user click.
   */
  goToSlide = (index, direction, autoSlide = false) => {
    const { beforeChange, transitionDuration, transition, onSlideTransitioned, children } = this.props;
    const { currentSlide } = this.state;
    const lastIndex = Children.count(children) - 1;

    const newIndex = index < 0 ? lastIndex + index + 1 :
      index <= lastIndex ? index : index - lastIndex - 1;

    direction = direction || (index > currentSlide ? 'right' : 'left');

    if (onSlideTransitioned) {
      onSlideTransitioned({
        autoPlay: autoSlide,
        index: newIndex,
        direction
      });
    }

    if (currentSlide === newIndex) {
      return;
    }

    if (this._animating) {
      return;
    }

    this._animating = true;

    beforeChange && beforeChange(newIndex, currentSlide, direction);
    this.setState({
      transitionDuration
    }, () => {
      this.setState({
        currentSlide: newIndex,
        direction,
        transitioningFrom: currentSlide
      }, () => {
        if (!transitionDuration || transition === 'fade') {
          // We don't actually animate if transitionDuration is 0, so immediately call the transition end callback
          this.slideTransitionEnd();
        }
      });
    });
  }

  /**
   * Transitions to the next slide moving from left to right.
   * @param {Object} e - The event that calls nextSlide, will be undefined for autoPlay.
   */
  nextSlide = (e) => {
    const { currentSlide } = this.state;
    this.goToSlide(currentSlide + 1, 'right', typeof e !== 'object');
  }

  /**
   * Transitions to the previous slide moving from right to left.
   */
  prevSlide = () => {
    const { currentSlide } = this.state;
    this.goToSlide(currentSlide - 1, 'left');
  }

  /**
   * Invoked whenever a slide transition (CSS) completes.
   *
   * @param {Object} e Event object
   */
  slideTransitionEnd = (e) => {
    const { currentSlide } = this.state;
    const { afterChange } = this.props;

    if (!e || e.propertyName === 'transform') {
      this._animating = false;

      this.setState({
        direction: null,
        transitioningFrom: null,
        transitionDuration: 0
      }, () => {
        if (!this._allImagesLoaded) {
          this.fetchImages();
        }
      });

      if (this.props.autoplay) {
        this.startAutoplay();
      }

      afterChange && afterChange(currentSlide);
    }
  }

  /**
   * @returns {Array} Controls to be rendered with the carousel.
   */
  getControls() {
    const { arrows, dots, controls } = this.props;
    let arr = controls.slice(0);

    if (dots) {
      arr.push({ component: Dots });
    }

    if (arrows) {
      arr = arr.concat([
        { component: Arrow, props: { direction: 'left' } },
        { component: Arrow, props: { direction: 'right' } }
      ]);
    }

    return arr;
  }

  /**
   * Renders the carousel.
   *
   * @returns {Object} Component to be rendered.
   */
  render() {
    const { className, viewportWidth, viewportHeight, width, height, dots, infinite,
      children, slideHeight, transition, style, draggable, easing, arrows } = this.props;
    const { loading, transitionDuration, dragOffset, currentSlide, leftOffset } = this.state;
    const numSlides = Children.count(children);
    const classes = classnames('carousel', className, {
      loaded: !loading
    });
    const containerStyle = { ...(style.container || {}),
      width,
      height
    };
    const innerContainerStyle = { ...(style.containerInner || {}),
      width,
      height,
      marginBottom: dots ? '20px' : 0
    };
    const viewportStyle = { ...(style.viewport || {}),
      width: viewportWidth,
      height: viewportHeight || slideHeight || 'auto'
    };
    let trackStyle = { ...style.track };
    if (transition !== 'fade') {
      const leftPos = leftOffset + dragOffset;
      trackStyle = { ...trackStyle,
        transform: `translateX(${leftPos}px)`,
        transition: transitionDuration ? `transform ${ms('' + transitionDuration)}ms ${easing}` : 'none'
      };
    }
    if (!draggable) {
      trackStyle.touchAction = 'auto';
    }
    const controls = this.getControls();

    return (
      <div className={ classes } style={ containerStyle } ref={ c => { this._containerRef = c; } }>
        <div className='carousel-container-inner' style={ innerContainerStyle }>
          {
            controls.filter(Control => {
              return Control.position === 'top';
            }).map((Control, index) => (
              <Control.component
                { ...Control.props }
                key={ `control-${index}` }
                selectedIndex={ currentSlide }
                numSlides={ numSlides }
                nextSlide={ this.nextSlide }
                prevSlide={ this.prevSlide }
                goToSlide={ this.goToSlide }
                infinite={ infinite } />
            ))
          }
          <div className='carousel-viewport' ref={ v => { this._viewport = v; } } style={ viewportStyle }>
            <ul
              className='carousel-track'
              style={ trackStyle }
              ref={ t => { this._track = t; } }
              onTransitionEnd={ this.slideTransitionEnd }
              onMouseDown={ this.onMouseDown }
              onMouseLeave={ this.onMouseLeave }
              onMouseOver={ this.onMouseOver }
              onMouseEnter={ this.onMouseEnter }
              onTouchStart={ this.onTouchStart }
            >
              { this.renderSlides() }
            </ul>
          </div>
          {
            controls.filter(Control => {
              return Control.position !== 'top';
            }).map((Control, index) => (
              <Control.component
                { ...Control.props }
                key={ `control-${index}` }
                selectedIndex={ currentSlide }
                numSlides={ numSlides }
                nextSlide={ this.nextSlide }
                prevSlide={ this.prevSlide }
                goToSlide={ this.goToSlide }
                arrows={ arrows }
                infinite={ infinite } />
            ))
          }
        </div>
      </div>
    );
  }

  /**
   * Renders the slides within the carousel viewport.
   *
   * @returns {Array} Array of slide components to be rendered.
   */
  renderSlides() {
    const { children, infinite, cellPadding, slideWidth, slideHeight, transition, transitionDuration,
      style, easing, lazyLoad } = this.props;
    const { slideDimensions, currentSlide, loadedImages } = this.state;
    this._allImagesLoaded = true;
    let childrenToRender = Children.map(children, (child, index) => {
      const key = `slide-${index}`;
      const imgSrc = child.props.src;
      const slideClasses = classnames(
        'carousel-slide',
        {
          [SELECTED_CLASS]: index === currentSlide,
          'carousel-slide-fade': transition === 'fade'
        }
      );
      let slideStyle = {
        marginLeft: `${cellPadding}px`,
        height: slideHeight,
        width: slideWidth
      };

      if (transition === 'fade') {
        slideStyle.transition = `opacity ${ms('' + transitionDuration)}ms ${easing}`;
      }

      if (slideHeight) {
        slideStyle.overflowY = 'hidden';
        slideStyle.minHeight = slideHeight; // Safari 9 bug
      }

      if (slideWidth) {
        slideStyle.overflowX = 'hidden';
        slideStyle.minWidth = slideWidth; // Safari 9 bug
      }

      slideStyle = { ...slideStyle, ...(style.slide || {}), ...(index === currentSlide ? style.selectedSlide || {} : {}) };

      const loadingSlideStyle = { ...(slideStyle || {}),
        marginLeft: slideStyle.marginLeft,
        width: slideWidth || slideDimensions.width,
        height: slideHeight || slideDimensions.height
      };
      const slidesToRender = this.getIndicesToRender();

      // Only render the actual slide content if lazy loading is disabled, the image is already loaded, or we
      // are within the configured proximity to the selected slide index.
      if (!lazyLoad || (imgSrc ? !!loadedImages[imgSrc] : slidesToRender.indexOf(index) > -1)) {
        // If the slide contains an image, set explicit width/height
        if (imgSrc && loadedImages[imgSrc]) {
          const { width, height } = loadedImages[imgSrc];
          slideStyle.height = slideStyle.height || height;
          slideStyle.width = slideStyle.width || width;
        }

        return (
          <li
            key={ key }
            style={ slideStyle }
            data-index={ index }
            className={ slideClasses }
            onClick={ this.handleSlideClick }
          >
            { child }
          </li>
        );
      }

      if (imgSrc) {
        this._allImagesLoaded = false;
      }

      return (
        <li
          key={ key }
          style={ loadingSlideStyle }
          data-index={ index }
          className={ classnames(slideClasses, LOADING_CLASS) }
          onClick={ this.handleSlideClick }
        ></li>
      );
    });

    if (infinite && transition !== 'fade') {
      // For infinite mode, create 2 clones on each side of the track
      childrenToRender = this.addClones(childrenToRender);
    }

    return childrenToRender;
  }

  /**
   * This method returns the slides indices that should be fully rendered given the current lazyLoad and
   * maxRenderedSlides settings.
   *
   * @returns {Array} Array of slide indices indicating which indices should be fully rendered.
   */
  getIndicesToRender() {
    const { currentSlide, transitioningFrom } = this.state;
    const { children, infinite, maxRenderedSlides } = this.props;
    const numSlides = Children.count(children);

    function genIndices(startIndex, endIndex) {
      const indices = [];
      for (let i = startIndex; i <= endIndex; i++) {
        if (infinite && i < 0) {
          indices.push(numSlides + i);
        } else if (infinite && i >= numSlides) {
          indices.push(i - numSlides);
        } else {
          indices.push(i);
        }
      }
      return indices;
    }

    // Figure out what slide indices need to be rendered
    const maxSlides = Math.max(1, maxRenderedSlides);
    const prevSlidesToRender = Math.floor((maxSlides - 1) / 2);
    const nextSlidesToRender = Math.floor(maxSlides / 2);
    let indices = genIndices(currentSlide - prevSlidesToRender, currentSlide + nextSlidesToRender);

    if (transitioningFrom !== null) {
      // Also render the slides around the previous slide during a transition
      indices = indices.concat(genIndices(transitioningFrom - prevSlidesToRender, transitioningFrom + nextSlidesToRender));
    }

    return indices;
  }

  addClones(originals) {
    const numOriginals = originals.length;
    const originalsToClone = [
      nth(originals, numOriginals - 2),
      nth(originals, numOriginals - 1),
      nth(originals, 0),
      nth(originals, Math.min(1, numOriginals - 1))
    ];
    const prependClones = [
      cloneElement(originalsToClone[0], {
        'key': 'clone-1',
        'data-index': -2,
        'className': originalsToClone[0].props.className.replace(SELECTED_CLASS, '')
      }),
      cloneElement(originalsToClone[1], {
        'key': 'clone-0',
        'data-index': -1,
        'className': originalsToClone[1].props.className.replace(SELECTED_CLASS, '')
      })
    ];
    const appendClones = [
      cloneElement(originalsToClone[2], {
        'key': 'clone-2',
        'data-index': numOriginals,
        'className': originalsToClone[2].props.className.replace(SELECTED_CLASS, '')
      }),
      cloneElement(originalsToClone[3], {
        'key': 'clone-3',
        'data-index': numOriginals + 1,
        'className': originalsToClone[3].props.className.replace(SELECTED_CLASS, '')
      })
    ];

    return prependClones.concat(originals).concat(appendClones);
  }

  /**
   * Updates the component state with the correct left offset position so that the slides will be positioned correctly.
   *
   * @param {Number} retryCount Used when retries are needed due to slow slide loading
   */
  calcLeftOffset = (retryCount = 0) => {
    const { direction, loading } = this.state;
    const viewportWidth = this._viewport && this._viewport.offsetWidth;

    clearTimeout(this._retryTimer);

    if (!this._track || !viewportWidth) {
      this._retryTimer = setTimeout(this.calcLeftOffset, 10);
      return;
    }

    const { infinite, children, cellPadding, slideAlignment } = this.props;
    let { currentSlide } = this.state;
    const slides = this._track.childNodes;
    const numChildren = Children.count(children);

    if (infinite) {
      if (currentSlide === 0 && direction === 'right') {
        currentSlide = numChildren;
      } else if (currentSlide === numChildren - 1 && direction === 'left') {
        currentSlide = -1;
      }
    }

    let leftOffset = 0;
    let selectedSlide;
    let foundZeroWidthSlide = false;
    let isCurrentSlideLoading = false;
    let currentSlideWidth;
    for (let i = 0; i < slides.length; i++) {
      selectedSlide = slides[i];
      leftOffset -= cellPadding;
      isCurrentSlideLoading = selectedSlide.className.indexOf(LOADING_CLASS) !== -1;
      currentSlideWidth = selectedSlide.offsetWidth;
      foundZeroWidthSlide = foundZeroWidthSlide || (!currentSlideWidth && !isCurrentSlideLoading);
      if (parseInt(selectedSlide.getAttribute('data-index'), 10) === currentSlide) {
        break;
      }
      leftOffset -= currentSlideWidth;
    }

    // Adjust the offset to get the correct alignment of current slide within the viewport
    if (slideAlignment === 'center') {
      leftOffset += (viewportWidth - currentSlideWidth) / 2;
    } else if (slideAlignment === 'right') {
      leftOffset += (viewportWidth - currentSlideWidth);
    }

    const shouldRetry = foundZeroWidthSlide && retryCount < MAX_LOAD_RETRIES;

    if (leftOffset !== this.state.leftOffset) {
      this.setState({ leftOffset });
    }

    if (shouldRetry) {
      this._retryTimer = setTimeout(this.calcLeftOffset.bind(this, ++retryCount), 10);
      return;
    }

    if (loading) {
      // We have correctly positioned the slides and are done loading images, so reveal the carousel
      this.setState({ loading: false });
    }
  }

  /**
   * Invoked when a slide is clicked.
   *
   * @param {Event} e DOM event object.
   */
  handleSlideClick = (e) => {
    const { clickToNavigate } = this.props;
    const { currentSlide } = this.state;
    const clickedIndex = parseInt(e.currentTarget.getAttribute('data-index'), 10);

    // If the user clicked the current slide or it appears they are dragging, don't process the click
    if (!clickToNavigate || clickedIndex === currentSlide || Math.abs(this._startPos.x - e.clientX) > 0.01) {
      return;
    }

    this.goToSlide(clickedIndex);
  }

  /**
   * Invoked when mousedown occurs on a slide.
   *
   * @param {Event} e DOM event object.
   */
  onMouseDown = (e) => {
    const { draggable, transition } = this.props;

    if (e.target.nodeName === 'IMG') {
      // Disable native browser select/drag for img elements
      e.preventDefault();
    }


    if (draggable && transition !== 'fade' && !this._animating) {
      if (this._autoplayTimer) {
        clearTimeout(this._autoplayTimer);
      }
      this._startPos = {
        x: e.clientX,
        y: e.clientY,
        startTime: Date.now()
      };
      this.setState({ transitionDuration: 0 });
      document.addEventListener('mousemove', this.onMouseMove, { passive: false });
      document.addEventListener('mouseup', this.stopDragging, false);
    }
  }

  /**
   * Invoked when the mouse is moved over a slide while dragging.
   *
   * @param {Event} e DOM event object.
   */
  onMouseMove = (e) => {
    e.preventDefault();
    this.setState({
      dragOffset: e.clientX - this._startPos.x
    });
  }

  /**
   * Invoked when the mouse cursor enters over a slide.
   */
  onMouseEnter = () => {
    document.addEventListener('mousemove', this.handleMovement, false);
  }

  /**
   * Invoked when the mouse cursor moves around a slide.
   */
  handleMovement = () => {
    this.setHoverState(true);
  }

  /**
   * Invoked when the mouse cursor moves over a slide.
   */
  onMouseOver = () => {
    this.setHoverState(true);
  }

  /**
   * Keeps track of the current hover state.
   *
   * @param {Boolean} hovering Current hover state.
   */
  setHoverState(hovering) {
    const { pauseOnHover, autoplay } = this.props;

    if (pauseOnHover && autoplay) {
      clearTimeout(this._hoverTimer);

      if (hovering) {
        clearTimeout(this._autoplayTimer);
        // If the mouse doesn't move for a few seconds, we want to restart the autoplay
        this._hoverTimer = setTimeout(() => {
          this.setHoverState(false);
        }, 2000);
      } else {
        this.startAutoplay();
      }
    }
  }

  /**
   * Invoked when the mouse cursor leaves a slide.
   */
  onMouseLeave = () => {
    document.removeEventListener('mousemove', this.handleMovement, false);
    this.setHoverState(false);
    !this._animating && this._startPos && this.stopDragging();
  }

  /**
   * Invoked when a touchstart event occurs on a slide.
   *
   * @param {Event} e DOM event object.
   */
  onTouchStart = (e) => {
    const { draggable, transition } = this.props;

    if (draggable && transition !== 'fade' && !this._animating) {
      if (this._autoplayTimer) {
        clearTimeout(this._autoplayTimer);
      }
      if (e.touches.length === 1) {
        this._startPos = {
          x: e.touches[0].screenX,
          y: e.touches[0].screenY,
          startTime: Date.now()
        };
        document.addEventListener('touchmove', this.onTouchMove, { passive: false });
        document.addEventListener('touchend', this.stopDragging, false);
      }
    }
  }

  /**
   * Invoked when a touchmove event occurs on a slide.
   *
   * @param {Event} e DOM event object.
   */
  onTouchMove = (e) => {
    const { x, y } = this._prevPos || this._startPos;
    const { screenX, screenY } = e.touches[0];
    const angle = Math.abs(Math.atan2(screenY - y, screenX - x)) * 180 / Math.PI;

    this._prevPos = { x: screenX, y: screenY };

    if (angle < 20 || angle > 160) {
      e.preventDefault();
      this.setState({
        dragOffset: screenX - this._startPos.x
      });
    }
  }

  /**
   * Removes event listeners that were added when starting a swipe operation
   */
  removeDragListeners() {
    document.removeEventListener('mousemove', this.onMouseMove, { passive: false });
    document.removeEventListener('mouseup', this.stopDragging, false);
    document.removeEventListener('touchmove', this.onTouchMove, { passive: false });
    document.removeEventListener('touchend', this.stopDragging, false);
  }

  /**
   * Completes a dragging operation, deciding whether to transition to another slide or snap back to the current slide.
   */
  stopDragging = () => {
    const { dragThreshold, transitionDuration } = this.props;
    const { dragOffset } = this.state;
    const viewportWidth = (this._viewport && this._viewport.offsetWidth) || 1;
    const percentDragged = Math.abs(dragOffset / viewportWidth);
    const swipeDuration = (Date.now() - this._startPos.startTime) || 1;
    const swipeSpeed = swipeDuration / (percentDragged * viewportWidth);
    const isQuickSwipe = percentDragged > 0.05 && swipeDuration < 250;

    let duration;

    if (isQuickSwipe || percentDragged > dragThreshold) {
      // Calculate the duration based on the speed of the swipe
      duration = Math.min(swipeSpeed * (1 - percentDragged) * viewportWidth, ms('' + transitionDuration) * (1 - percentDragged));
    } else {
      // Just transition back to the center point
      duration = ms('' + transitionDuration) * percentDragged;
    }

    this.removeDragListeners();

    this.setState({
      transitionDuration: duration
    }, () => {
      const { children, infinite } = this.props;
      const { currentSlide } = this.state;
      const numSlides = Children.count(children);
      let newSlideIndex = currentSlide;
      let direction = '';

      if (percentDragged > dragThreshold || isQuickSwipe) {
        if (dragOffset > 0) {
          newSlideIndex--;
          if (newSlideIndex < 0) {
            newSlideIndex = infinite ? numSlides - 1 : currentSlide;
          }
        } else {
          newSlideIndex++;
          if (newSlideIndex === numSlides) {
            newSlideIndex = infinite ? 0 : currentSlide;
          }
        }
        direction = dragOffset > 0 ? 'left' : 'right';
      }

      this.setState({
        dragOffset: 0,
        currentSlide: newSlideIndex,
        direction
      });
    });

    if (this.props.autoplay) {
      this.startAutoplay();
    }
  }
}
