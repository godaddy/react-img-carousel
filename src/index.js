import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import nth from 'lodash.nth';
import merge from 'lodash.merge';
import inRange from 'lodash.inrange';
import ms from 'ms';
import autobind from 'class-autobind';
import classnames from 'classnames';
import { Dots, Arrow } from './controls';
import areChildImagesEqual from './utils/areChildImagesEqual';

const SELECTED_CLASS = 'carousel-slide-selected';

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
      arrows: PropTypes.bool,
      infinite: PropTypes.bool,
      children: PropTypes.any,
      viewportWidth: PropTypes.string,
      viewportHeight: PropTypes.string,
      width: PropTypes.string,
      height: PropTypes.string,
      imagesToPrefetch: PropTypes.number,
      cellPadding: PropTypes.number,
      slideWidth: PropTypes.string,
      slideHeight: PropTypes.string,
      changing: PropTypes.func,
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
      cellPadding: 0,
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
      transitioningFrom: null,
      leftOffset: 0
    };
    autobind(this);
  }

  componentWillReceiveProps(newProps) {
    const { currentSlide } = this.state;
    const numChildren = Children.count(newProps.children);

    if (currentSlide >= numChildren) {
      // The currentSlide index is no longer valid, so move to the last valid index
      this.setState({
        currentSlide: numChildren ? numChildren - 1 : 0
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { children, autoplay, slideWidth, changing } = this.props;
    const { currentSlide, loadedImages, direction, loading } = this.state;
    const oldChildren = prevProps.children;

    if (direction !== prevState.direction ||
        currentSlide !== prevState.currentSlide ||
        loadedImages !== prevState.loadedImages ||
        slideWidth !== prevProps.slideWidth) {
      // Whenever new images are loaded, the current slide index changes, the transition direction changes, or the
      // slide width changes, we need to recalculate the left offset positioning of the slides.
      this.calcLeftOffset();
      changing && changing({currentSlide, direction});
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
    } else if (autoplay) {
      this.startAutoplay();
    }

    this.calcLeftOffset();
    window.addEventListener('resize', this.calcLeftOffset, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.calcLeftOffset, false);
    clearTimeout(this._autoplayTimer);
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
    const { loadedImages, currentSlide, loading } = this.state;
    const slides = Children.toArray(children);
    const imagesToPrefetch = Math.min(this.props.imagesToPrefetch, slides.length);
    const startIndex = currentSlide - Math.floor(imagesToPrefetch / 2);
    const endIndex = startIndex + imagesToPrefetch;
    const pendingImages = [];

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
              loadedImages: merge({}, this.state.loadedImages, {
                [image]: { width: img.width || 'auto', height: img.height || 'auto' }
              })
            });
          }
        };
        img.src = image;
      });
    } else if (loading) {
      this.setState({
        loading: false
      });
    }
  }

  /**
   * Invoked when the carousel is using lazy loading and the currently selected slide's image is first rendered. This
   * method will clear the loading state causing the carousel to render and will calculate the dimensions of the
   * displayed slide to use as a loading shim if an explicit width/height were not specified.
   */
  handleInitialLoad() {
    const { currentSlide } = this.state;
    const { slideWidth, slideHeight } = this.props;
    const slides = this._track.childNodes;
    const newState = {
      loading: false
    };

    if (!slideWidth || !slideHeight) {
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        if (parseInt(slide.getAttribute('data-index'), 10) === currentSlide) {
          newState.slideDimensions = {
            width: slide.offsetWidth,
            height: slide.offsetHeight
          };
          break;
        }
      }
    }

    this.setState(newState);
  }

  /**
   * Navigates to the specified slide index, moving in the specified direction.
   *
   * @param {Number} index - The slide index to move to.
   * @param {String} direction - The direction to transition, should be 'right' or 'left'.
   */
  goToSlide(index, direction) {
    const { beforeChange, transitionDuration, transition } = this.props;
    const { currentSlide } = this.state;
    if (currentSlide === index) {
      return;
    }

    if (this._animating) {
      return;
    }

    this._animating = true;

    beforeChange && beforeChange(index, currentSlide);
    this.setState({
      transitionDuration
    }, () => {
      this.setState({
        currentSlide: index,
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
   */
  nextSlide() {
    const { children } = this.props;
    const { currentSlide } = this.state;
    const newIndex = currentSlide < Children.count(children) - 1 ? currentSlide + 1 : 0;
    this.goToSlide(newIndex, 'right');
  }

  /**
   * Transitions to the previous slide moving from right to left.
   */
  prevSlide() {
    const { children } = this.props;
    const { currentSlide } = this.state;
    const newIndex = currentSlide > 0 ? currentSlide - 1 : Children.count(children) - 1;
    this.goToSlide(newIndex, 'left');
  }

  /**
   * Invoked whenever a slide transition (CSS) completes.
   *
   * @param {Object} e Event object
   */
  slideTransitionEnd(e) {
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
        { component: Arrow, props: { direction: 'left' }},
        { component: Arrow, props: { direction: 'right' }}
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
      children, slideHeight, transition, style, draggable, easing } = this.props;
    const { loading, transitionDuration, dragOffset, currentSlide, leftOffset } = this.state;
    const numSlides = Children.count(children);
    const classes = classnames('carousel', className, {
      loaded: !loading
    });
    const containerStyle = merge({}, style.container || {}, {
      width,
      height
    });
    const innerContainerStyle = merge({}, style.containerInner || {}, {
      width,
      height,
      marginBottom: dots ? '20px' : 0
    });
    const viewportStyle = merge({}, style.viewport || {}, {
      width: viewportWidth,
      height: viewportHeight || slideHeight || 'auto'
    });
    let trackStyle = style.track || {};
    if (transition !== 'fade') {
      const leftPos = leftOffset + dragOffset;
      trackStyle = merge({}, trackStyle, {
        transform: `translateX(${leftPos}px)`,
        transition: transitionDuration ? `transform ${ms('' + transitionDuration)}ms ${easing}` : 'none'
      });
    }
    if (!draggable) {
      trackStyle.touchAction = 'auto';
    }
    const controls = this.getControls();

    return (
      <div className={ classes } style={ containerStyle }>
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
      style, easing } = this.props;
    const { slideDimensions, currentSlide, loading, loadedImages } = this.state;
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

      slideStyle = merge({}, slideStyle, style.slide || {}, index === currentSlide ? style.selectedSlide || {} : {});

      const loadingSlideStyle = merge({}, slideStyle || {}, {
        marginLeft: slideStyle.marginLeft,
        width: slideWidth || slideDimensions.width,
        height: slideHeight || slideDimensions.height
      });

      if (this.shouldRenderSlide(child, index)) {
        // If the slide contains an image, set explicit width/height and add load listener
        if (imgSrc && loadedImages[imgSrc]) {
          if (index === currentSlide && loading) {
            child = cloneElement(child, { onLoad: this.handleInitialLoad });
          }
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
          className={ classnames(slideClasses, 'carousel-slide-loading') }
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
   * If lazy loading is enabled, this method attempts to determine whether the given slide index should be rendered.
   * For img slides with src attributes, we render the slides only if the image has been fetched. For non-img slides,
   * we attempt to determine whether the slide content should be rendered based on the currentSlide index and the
   * transitioningFrom slide index, if set, to provide the best balance between showing the slides as they transition
   * and keeping the DOM light if there are many slides in the carousel.
   *
   * @param {Object} slide The slide component to check.
   * @param {Number} index The index of the specified slide component.
   * @returns {Boolean} True if the slide should be rendered, else False.
   */
  shouldRenderSlide(slide, index) {
    const { currentSlide, loadedImages, transitioningFrom } = this.state;
    const { lazyLoad, children, infinite } = this.props;
    const numSlides = Children.count(children);
    const imgSrc = slide.props.src;

    if (!lazyLoad) {
      return true;
    }

    if (imgSrc) {
      return !!loadedImages[imgSrc];
    }

    // Render at least 5 slides centered around the current slide, or the slide we just transitioned from
    if (inRange(index, currentSlide - 2, currentSlide + 3) ||
        (transitioningFrom !== null && inRange(index, transitioningFrom - 2, transitioningFrom + 3))) {
      return true;
    } else if (infinite) {
      // In infinite mode, we also want to render the adjacent slides if we're at the beginning or the end
      if (currentSlide <= 1 && index >= numSlides - 2 ||
          currentSlide >= numSlides - 2 && index <= 1 ||
          transitioningFrom !== null && (
            transitioningFrom <= 1 && index >= numSlides - 2 ||
            transitioningFrom >= numSlides - 2 && index <= 1
          )) {
        return true;
      }
    }

    return false;
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
   */
  calcLeftOffset() {
    const { loading, direction } = this.state;

    if (loading || !this._track || !this._viewport) {
      clearTimeout(this._retryTimer);
      if (this._isMounted) {
        this._retryTimer = setTimeout(this.calcLeftOffset, 10);
      }
      return;
    }

    const { infinite, children, cellPadding } = this.props;
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
    for (let i = 0; i < slides.length; i++) {
      selectedSlide = slides[i];
      leftOffset -= cellPadding;
      if (parseInt(selectedSlide.getAttribute('data-index'), 10) === currentSlide) {
        break;
      }
      leftOffset -= selectedSlide.offsetWidth;
    }
    const currentSlideWidth = selectedSlide.offsetWidth;
    const viewportWidth = this._viewport.offsetWidth;

    if (currentSlideWidth === 0 &&
        viewportWidth === 0) {
      // Sometimes there is a delay when the carousel is first rendering, so do a few retries
      this._retryCount = this._retryCount || 0;
      if (this._retryCount < 5) {
        this._retryCount++;
        setTimeout(this.calcLeftOffset, 100);
      } else {
        this._retryCount = 0;
      }

      return;
    }

    // Center the current slide within the viewport
    leftOffset += (viewportWidth - currentSlideWidth) / 2;

    if (leftOffset !== this.state.leftOffset) {
      this.setState({ leftOffset });
    }
  }

  /**
   * Invoked when a slide is clicked.
   *
   * @param {Event} e DOM event object.
   */
  handleSlideClick(e) {
    const { clickToNavigate } = this.props;
    const { currentSlide } = this.state;
    const clickedIndex = parseInt(e.currentTarget.getAttribute('data-index'), 10);

    // If the user clicked the current slide or it appears they are dragging, don't process the click
    if (!clickToNavigate || clickedIndex === currentSlide || Math.abs(this._startPos.x - e.clientX) > 0.01) {
      return;
    }
    if (clickedIndex === currentSlide - 1) {
      this.prevSlide();
    } else if (clickedIndex === currentSlide + 1) {
      this.nextSlide();
    } else {
      this.goToSlide(clickedIndex);
    }
  }

  /**
   * Invoked when mousedown occurs on a slide.
   *
   * @param {Event} e DOM event object.
   */
  onMouseDown(e) {
    const { draggable, transition } = this.props;

    e.preventDefault();

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
  onMouseMove(e) {
    e.preventDefault();
    this.setState({
      dragOffset: e.clientX - this._startPos.x
    });
  }

  /**
   * Invoked when the mouse cursor enters over a slide.
   */
  onMouseEnter() {
    document.addEventListener('mousemove', this.handleMovement, false);
  }

  /**
   * Invoked when the mouse cursor moves around a slide.
   */
  handleMovement() {
    this.setHoverState(true);
  }

  /**
   * Invoked when the mouse cursor moves over a slide.
   */
  onMouseOver() {
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
  onMouseLeave() {
    document.removeEventListener('mousemove', this.handleMovement, false);
    this.setHoverState(false);
    !this._animating && this._startPos && this.stopDragging();
  }

  /**
   * Invoked when a touchstart event occurs on a slide.
   *
   * @param {Event} e DOM event object.
   */
  onTouchStart(e) {
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
  onTouchMove(e) {
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
   * Completes a dragging operation, deciding whether to transition to another slide or snap back to the current slide.
   */
  stopDragging() {
    const { dragThreshold, transitionDuration } = this.props;
    const { dragOffset } = this.state;
    const viewportWidth = this._viewport.offsetWidth || 1;
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

    document.removeEventListener('mousemove', this.onMouseMove, { passive: false });
    document.removeEventListener('mouseup', this.stopDragging, false);
    document.removeEventListener('touchmove', this.onTouchMove, { passive: false });
    document.removeEventListener('touchend', this.stopDragging, false);

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
