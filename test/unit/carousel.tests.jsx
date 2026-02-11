/* eslint max-statements: 0, jsx-a11y/alt-text: 0 */
import React from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { flushSync } from 'react-dom';
import Carousel from '../../src/index';
import CustomArrows from '../../src/stories/CustomArrows';
import UpArrow from '../images/test-up-arrow.svg';
import DownArrow from '../images/test-down-arrow.svg';

let imagesFetched;

global.Image = class MyImage {
  set src(val) {
    imagesFetched.push(val);
    this.onload && this.onload();
  }
};

describe('Carousel', () => {
  let container;

  beforeEach(() => {
    imagesFetched = [];
  });

  afterEach(() => {
    container = null;
  });

  it('should render a carousel with the specified index selected', async () => {
    const { container: c } = render(
      <Carousel initialSlide={ 2 } slideWidth='300px' viewportWidth='300px' infinite={ false }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots).toHaveLength(3);
      expect(dots[2].className).toContain('selected');
    });
  });

  it('should navigate to the next slide when the button is clicked', async () => {
    const { container: c } = render(
      <Carousel slideWidth='300px' viewportWidth='300px' infinite={ false }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots).toHaveLength(3);
      expect(dots[0].className).toContain('selected');
    });

    const nextButton = container.querySelector('.carousel-right-arrow');
    expect(nextButton.className).toContain('carousel-arrow-default');

    await userEvent.click(nextButton);

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots[0].className).not.toContain('selected');
      expect(dots[1].className).toContain('selected');
    });
  });

  it('should navigate to the previous slide when the button is clicked', async () => {
    const onSlideTransitionedStub = vi.fn();

    const { container: c } = render(
      <Carousel initialSlide={ 1 }
        slideWidth='300px'
        viewportWidth='300px'
        infinite={ false }
        onSlideTransitioned={ onSlideTransitionedStub }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots).toHaveLength(3);
      expect(dots[1].className).toContain('selected');
    });

    const prevButton = container.querySelector('.carousel-left-arrow');
    expect(prevButton.className).toContain('carousel-arrow-default');

    await userEvent.click(prevButton);

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots[1].className).not.toContain('selected');
      expect(dots[0].className).toContain('selected');
      expect(onSlideTransitionedStub).toHaveBeenCalledWith({
        autoPlay: false,
        index: 0,
        direction: 'left'
      });
    });
  });

  it('should wrap around from the last to first slide if infinite is true and next is clicked', async () => {
    const onSlideTransitionedStub = vi.fn();
    const beforeChangeStub = vi.fn();

    const { container: c } = render(
      <Carousel initialSlide={ 2 }
        slideWidth='300px'
        viewportWidth='300px'
        infinite={ true }
        onSlideTransitioned={ onSlideTransitionedStub }
        beforeChange={ beforeChangeStub }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots).toHaveLength(3);
      expect(dots[2].className).toContain('selected');
    });

    const nextButton = container.querySelector('.carousel-right-arrow');
    await userEvent.click(nextButton);

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots[2].className).not.toContain('selected');
      expect(dots[0].className).toContain('selected');
      expect(onSlideTransitionedStub).toHaveBeenCalledWith({
        autoPlay: false,
        index: 0,
        direction: 'right'
      });
      expect(beforeChangeStub).toHaveBeenCalledWith(0, 2, 'right');
    });
  });

  it('should wrap around from the first to last slide if infinite is true and prev is clicked', async () => {
    const beforeChangeStub = vi.fn();

    const { container: c } = render(
      <Carousel initialSlide={ 0 } slideWidth='300px' viewportWidth='300px' infinite={ true } beforeChange={ beforeChangeStub }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots).toHaveLength(3);
      expect(dots[0].className).toContain('selected');
    });

    const prevButton = container.querySelector('.carousel-left-arrow');
    await userEvent.click(prevButton);

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots[0].className).not.toContain('selected');
      expect(dots[2].className).toContain('selected');
      expect(beforeChangeStub).toHaveBeenCalledWith(2, 0, 'left');
    });
  });

  it('should jump directly to a slide when the dot is clicked', async () => {
    const onSlideTransitionedStub = vi.fn();

    const { container: c } = render(
      <Carousel slideWidth='300px'
        viewportWidth='300px'
        infinite={ false }
        onSlideTransitioned={ onSlideTransitionedStub }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots).toHaveLength(3);
      expect(dots[0].className).toContain('selected');
    });

    const dots = container.querySelectorAll('.carousel-dot');
    await userEvent.click(dots[2]);

    await waitFor(() => {
      const updatedDots = container.querySelectorAll('.carousel-dot');
      expect(updatedDots[0].className).not.toContain('selected');
      expect(updatedDots[2].className).toContain('selected');
      expect(onSlideTransitionedStub).toHaveBeenCalledOnce();
    });
  });

  it('should jump directly to a slide when the slide is clicked', async () => {
    const onSlideTransitionedStub = vi.fn();

    const { container: c } = render(
      <Carousel slideWidth='300px'
        viewportWidth='300px'
        infinite={ false }
        clickToNavigate={ true }
        onSlideTransitioned={ onSlideTransitionedStub }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
        <div id='slide4'/>
        <div id='slide5'/>
        <div id='slide6'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const slides = container.querySelectorAll('.carousel-slide');
      expect(slides).toHaveLength(6);
      expect(slides[0].className).toContain('carousel-slide-selected');
      expect(slides[0].getAttribute('data-index')).toBe('0');
    });

    let slides = container.querySelectorAll('.carousel-slide');

    // Click on slide 2 (third slide)
    fireEvent.mouseDown(slides[2], { clientX: 100, clientY: 100 });
    fireEvent.click(slides[2], { currentTarget: slides[2], clientX: 100, clientY: 100 });

    await waitFor(() => {
      slides = container.querySelectorAll('.carousel-slide');
      expect(onSlideTransitionedStub).toHaveBeenCalled();
      expect(slides[2].className).toContain('carousel-slide-selected');
      expect(slides[2].getAttribute('data-index')).toBe('2');
    });
  });

  it('should not freeze when a selected dot is clicked', async () => {
    const { container: c } = render(
      <Carousel slideWidth='300px' viewportWidth='300px' infinite={ false }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots).toHaveLength(3);
      expect(dots[0].className).toContain('selected');
    });

    let dots = container.querySelectorAll('.carousel-dot');
    await userEvent.click(dots[0]);

    dots = container.querySelectorAll('.carousel-dot');
    await userEvent.click(dots[2]);

    await waitFor(() => {
      dots = container.querySelectorAll('.carousel-dot');
      expect(dots[0].className).not.toContain('selected');
      expect(dots[2].className).toContain('selected');
    });
  });

  it('should prefetch the specified number of images', async () => {
    render(
      <Carousel slideWidth='300px' viewportWidth='300px' infinite={ false } imagesToPrefetch={ 3 }>
        <img src='https://placekitten.com/200/300'/>
        <img src='https://placekitten.com/300/300'/>
        <img src='https://placekitten.com/400/300'/>
        <img src='https://placekitten.com/350/300'/>
        <img src='https://placekitten.com/250/300'/>
        <img src='https://placekitten.com/375/300'/>
        <img src='https://placekitten.com/425/300'/>
        <img src='https://placekitten.com/325/300'/>
      </Carousel>
    );

    await waitFor(() => {
      expect(imagesFetched).toHaveLength(3);
    });
  });

  it('should navigate to the next slide when a swipe event occurs', async () => {
    let carouselRef;
    const { container: c } = render(
      <Carousel slideWidth='300px' viewportWidth='300px' infinite={ false } ref={ ref => { carouselRef = ref; } }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots).toHaveLength(3);
      expect(dots[0].className).toContain('selected');
    });

    act(() => {
      flushSync(() => {
        carouselRef.onMouseDown({ target: { nodeName: 'DIV' }, clientX: 0, clientY: 0 });
      });
      flushSync(() => {
        carouselRef.onMouseMove({ preventDefault: () => {}, clientX: -150 });
      });
      flushSync(() => {
        carouselRef.stopDragging();
      });
    });

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots[0].className).not.toContain('selected');
      expect(dots[1].className).toContain('selected');
    });
  });

  it('should pause when mouse is moving', async () => {
    let carouselRef;
    const { container: c } = render(
      <Carousel slideWidth='300px' viewportWidth='300px' infinite={ false } autoplay={ true } pauseOnHover={ true } ref={ ref => { carouselRef = ref; } }>
        <div id='slide1' />
        <div id='slide2' />
        <div id='slide3' />
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const track = container.querySelector('.carousel-viewport');
      const setHoverState = vi.fn((bool) => {
        expect(bool).toBe(true);
      });
      carouselRef.setHoverState = setHoverState;
      carouselRef.handleMovement(track);
      expect(setHoverState).toHaveBeenCalled();
    });
  });

  it('should navigate to the last slide when a right swipe event occurs on the first slide', async () => {
    let carouselRef;
    const { container: c } = render(
      <Carousel slideWidth='300px' viewportWidth='300px' infinite={ true } ref={ ref => { carouselRef = ref; } }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots).toHaveLength(3);
      expect(dots[0].className).toContain('selected');
    });

    act(() => {
      flushSync(() => {
        carouselRef.onMouseDown({ target: { nodeName: 'DIV' }, clientX: 0, clientY: 0 });
      });
      flushSync(() => {
        carouselRef.onMouseMove({ preventDefault: () => {}, clientX: 150 });
      });
      flushSync(() => {
        carouselRef.stopDragging();
      });
    });

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots[0].className).not.toContain('selected');
      expect(dots[2].className).toContain('selected');
    });
  });

  it('should navigate to the next slide in response to touch events', async () => {
    let carouselRef;
    const { container: c } = render(
      <Carousel slideWidth='300px' viewportWidth='300px' infinite={ false } ref={ ref => { carouselRef = ref; } }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots).toHaveLength(3);
      expect(dots[0].className).toContain('selected');
    });

    act(() => {
      flushSync(() => {
        carouselRef.onTouchStart({ touches: [{ screenX: 0, screenY: 0 }] });
      });
      flushSync(() => {
        carouselRef.onTouchMove({ preventDefault: () => {}, touches: [{ screenX: -150, screenY: 0 }] });
      });
      flushSync(() => {
        carouselRef.stopDragging();
      });
    });

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots[0].className).not.toContain('selected');
      expect(dots[1].className).toContain('selected');
    });
  });

  it('should update the selected index if the selected slide is removed', async () => {
    const { container: c, rerender } = render(
      <Carousel initialSlide={ 2 } slideWidth='300px' viewportWidth='300px' infinite={ false }>
        <div id='slide1' key='slide1' />
        <div id='slide2' key='slide2' />
        <div id='slide3' key='slide3' />
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots).toHaveLength(3);
      expect(dots[2].className).toContain('selected');
    });

    rerender(
      <Carousel initialSlide={ 2 } slideWidth='300px' viewportWidth='300px' infinite={ false }>
        <div id='slide1' key='slide1' />
        <div id='slide2' key='slide2' />
      </Carousel>
    );

    await waitFor(() => {
      const dots = container.querySelectorAll('.carousel-dot');
      expect(dots).toHaveLength(2);
      expect(dots[1].className).toContain('selected');
    });
  });

  it('should apply passed inline styling', async () => {
    const styles = {
      container: {
        opacity: 0.5
      },
      containerInner: {
        opacity: 0.6
      },
      viewport: {
        opacity: 0.7
      },
      track: {
        opacity: 0.8
      },
      slide: {
        opacity: 0.9
      },
      selectedSlide: {
        opacity: 1
      }
    };
    const { container: c } = render(
      <Carousel initialSlide={ 2 } slideWidth='300px' viewportWidth='300px' style={ styles }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const carouselContainer = container.querySelector('.carousel');
      expect(carouselContainer.style.opacity).toBe('0.5');
      const innerContainer = container.querySelector('.carousel-container-inner');
      expect(innerContainer.style.opacity).toBe('0.6');
      const viewport = container.querySelector('.carousel-viewport');
      expect(viewport.style.opacity).toBe('0.7');
      const track = container.querySelector('.carousel-track');
      expect(track.style.opacity).toBe('0.8');
      const slide = container.querySelector('.carousel-slide');
      expect(slide.style.opacity).toBe('0.9');
      const selectedSlide = container.querySelector('.carousel-slide-selected');
      expect(selectedSlide.style.opacity).toBe('1');
    });
  });

  it('should render vertical carousal with default arrows.', async () => {
    const { container: c } = render(
      <Carousel slideWidth='300px'
                viewportWidth='300px'
                lazyLoad={ false }
                infinite={ false }
                isVertical={ true }>
        <div id='slide1' />
        <div id='slide2' />
        <div id='slide3' />
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const topArrow = container.querySelector('.carousel-top-arrow');
      const bottomArrow = container.querySelector('.carousel-bottom-arrow');
      const carouselDiv = container.querySelector('.carousel-container-inner');

      expect(carouselDiv.style.display).toBe('flex');
      expect(topArrow).toBeTruthy();
      expect(topArrow.outerHTML).toBe('<button type="button" disabled="" class="carousel-arrow carousel-top-arrow carousel-arrow-default"></button>');
      expect(bottomArrow).toBeTruthy();
      expect(bottomArrow.outerHTML).toBe('<button type="button" class="carousel-arrow carousel-bottom-arrow carousel-arrow-default"></button>');
    });
  });

  it('should render vertical carousal with custom arrows.', async () => {
    const { container: c } = render(
      <Carousel slideWidth='300px'
                viewportWidth='300px'
                lazyLoad={ false }
                infinite={ false }
                isVertical={ true }
                arrows={ false }
                controls={ [{
                  component: CustomArrows,
                  props: { overrideArrowStyle: { border: 'none', background: 'none' }, topArrowImage: <UpArrow/>, bottomArrowImage: <DownArrow/> }
                }] }>
        <div id='slide1' />
        <div id='slide2' />
        <div id='slide3' />
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const controlComponent = container.querySelector('.custom-arrows-div');
      const topButton = controlComponent.children[0];
      const bottomButton = controlComponent.children[1];

      // Verify top arrow button (disabled, first slide)
      expect(topButton.className).toBe('carousel-custom-arrow');
      expect(topButton.disabled).toBe(true);
      expect(topButton.style.opacity).toBe('0.5');
      expect(topButton.style.cursor).toBe('not-allowed');
      expect(topButton.children).toHaveLength(1);

      // Verify bottom arrow button (enabled)
      expect(bottomButton.className).toBe('carousel-custom-arrow');
      expect(bottomButton.disabled).toBe(false);
      expect(bottomButton.style.opacity).toBe('1');
      expect(bottomButton.style.cursor).toBe('pointer');
      expect(bottomButton.children).toHaveLength(1);
    });
  });

  it('should have transitions with the given duration and easing', async () => {
    let slidingCarousel;

    const { container: c } = render(
      <div>
        <Carousel className='sliding-carousel' slideWidth='300px' viewportWidth='300px' infinite={ false }
          transition='slide' transitionDuration={ 300 } easing='ease-out' ref={ el => { slidingCarousel = el; } }>
          <div id='slide1'/>
          <div id='slide2'/>
          <div id='slide3'/>
        </Carousel>
        <Carousel className='fading-carousel' slideWidth='300px' viewportWidth='300px' infinite={ false }
          transition='fade' transitionDuration={ 700 } easing='linear'>
          <div id='slide4'/>
          <div id='slide5'/>
          <div id='slide6'/>
        </Carousel>
      </div>
    );
    container = c;

    await waitFor(() => {
      act(() => {
        slidingCarousel.goToSlide(1);
      });

      const track = container.querySelector('.sliding-carousel .carousel-track');
      expect(track.style.transition).toBe('transform 300ms ease-out');

      const slide = container.querySelector('.fading-carousel .carousel-slide');
      expect(slide.style.transition).toBe('opacity 700ms linear');
    });
  });

  it('should support passing none for the transition type', async () => {
    let noneCarousel;

    const { container: c } = render(
      <Carousel className='none-carousel' slideWidth='300px' viewportWidth='300px' infinite={ false }
        transition='none' ref={ el => { noneCarousel = el; } }>
        <div id='slide1' />
        <div id='slide2' />
        <div id='slide3' />
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      noneCarousel.goToSlide(1);
      const track = container.querySelector('.none-carousel .carousel-track');
      expect(track.style.transition).toBeFalsy();
    });
  });

  describe('maxRenderedSlides', () => {
    it('should only render the specified maxRenderedSlides', async () => {
      const { container: c } = render(
        <Carousel
          initialSlide={ 2 }
          slideWidth='300px'
          viewportWidth='300px'
          maxRenderedSlides={ 3 }
          infinite={ false }
        >
          <div id='slide1'/>
          <div id='slide2'/>
          <div id='slide3'/>
          <div id='slide4'/>
          <div id='slide5'/>
          <div id='slide6'/>
          <div id='slide7'/>
          <div id='slide8'/>
          <div id='slide9'/>
          <div id='slide10'/>
        </Carousel>
      );
      container = c;

      await waitFor(() => {
        const loadingSlides = container.querySelectorAll('.carousel-slide.carousel-slide-loading');
        expect(loadingSlides).toHaveLength(7);
        expect(container.querySelector('#slide1')).toBeFalsy();
        expect(container.querySelector('#slide2')).toBeTruthy();
        expect(container.querySelector('#slide3')).toBeTruthy();
        expect(container.querySelector('#slide4')).toBeTruthy();
        expect(container.querySelector('#slide5')).toBeFalsy();
        expect(container.querySelector('#slide6')).toBeFalsy();
        expect(container.querySelector('#slide7')).toBeFalsy();
        expect(container.querySelector('#slide8')).toBeFalsy();
        expect(container.querySelector('#slide9')).toBeFalsy();
        expect(container.querySelector('#slide10')).toBeFalsy();
      });
    });

    it('should render the correct slides when infinite is true and the selected slide is near the end', async () => {
      const { container: c } = render(
        <Carousel
          initialSlide={ 0 }
          slideWidth='300px'
          viewportWidth='300px'
          maxRenderedSlides={ 3 }
          infinite={ true }
        >
          <div id='slide1'/>
          <div id='slide2'/>
          <div id='slide3'/>
          <div id='slide4'/>
          <div id='slide5'/>
          <div id='slide6'/>
          <div id='slide7'/>
          <div id='slide8'/>
          <div id='slide9'/>
          <div id='slide10'/>
        </Carousel>
      );
      container = c;

      await waitFor(() => {
        expect(container.querySelector('#slide1')).toBeTruthy();
        expect(container.querySelector('#slide2')).toBeTruthy();
        expect(container.querySelector('#slide3')).toBeFalsy();
        expect(container.querySelector('#slide4')).toBeFalsy();
        expect(container.querySelector('#slide5')).toBeFalsy();
        expect(container.querySelector('#slide6')).toBeFalsy();
        expect(container.querySelector('#slide7')).toBeFalsy();
        expect(container.querySelector('#slide8')).toBeFalsy();
        expect(container.querySelector('#slide9')).toBeFalsy();
        expect(container.querySelector('#slide10')).toBeTruthy();
      });
    });
  });

  it('should render custom arrow', async () => {
    const arrows = {
      className: 'test-custom-arrow',
      left: <span id='custom-left'>Left</span>,
      right: <span id='custom-right'>Right</span>
    };

    const { container: c } = render(
      <Carousel slideWidth='300px'
        viewportWidth='300px'
        infinite={ false }
        arrows={ arrows }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const prevButton = container.querySelector('.carousel-left-arrow');
      const nextButton = container.querySelector('.carousel-right-arrow');
      expect(prevButton.className).toContain('test-custom-arrow');
      expect(nextButton.className).toContain('test-custom-arrow');
      expect(container.querySelector('#custom-left')).toBeTruthy();
      expect(container.querySelector('#custom-right')).toBeTruthy();
    });
  });

  it('should render custom arrow without className', async () => {
    const arrows = {
      left: <span id='custom-left'>Left</span>,
      right: <span id='custom-right'>Right</span>
    };

    const { container: c } = render(
      <Carousel slideWidth='300px'
        viewportWidth='300px'
        infinite={ false }
        arrows={ arrows }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );
    container = c;

    await waitFor(() => {
      const prevButton = container.querySelector('.carousel-left-arrow');
      const nextButton = container.querySelector('.carousel-right-arrow');
      expect(prevButton.className).not.toContain('carousel-arrow-default');
      expect(nextButton.className).not.toContain('carousel-arrow-default');
      expect(container.querySelector('#custom-left')).toBeTruthy();
      expect(container.querySelector('#custom-right')).toBeTruthy();
    });
  });

  it('should call onSlideTransitioned with autoPlay true', async () => {
    const onSlideTransitionedStub = vi.fn();
    let carouselRef;
    const { container: c } = render(
      <Carousel slideWidth='300px'
        viewportWidth='300px'
        lazyLoad={ false }
        infinite={ false }
        autoplay={ true }
        autoplaySpeed={ 10 }
        pauseOnHover={ true }
        onSlideTransitioned={ onSlideTransitionedStub }
        ref={ ref => { carouselRef = ref; } }>
        <div id='slide1' />
        <div id='slide2' />
        <div id='slide3' />
      </Carousel>
    );
    container = c;

    await new Promise(resolve => setTimeout(resolve, 20));

    await waitFor(() => {
      const track = container.querySelector('.carousel-viewport');
      const setHoverState = vi.fn();
      carouselRef.setHoverState = setHoverState;
      carouselRef.handleMovement(track);

      expect(setHoverState).toHaveBeenCalledWith(true);
      expect(onSlideTransitionedStub).toHaveBeenCalledWith(
        expect.objectContaining({
          autoPlay: true,
          direction: 'right'
        })
      );
    });
  });
});
