import React, { Fragment } from 'react';
import { render } from 'react-dom';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Simulate } from 'react-dom/test-utils';
import Carousel from '../../src/index';

function renderToJsdom(component) {
  return render(component, window.document.querySelector('#root'));
}

chai.use(sinonChai);
let imagesFetched;

global.Image = class MyImage {
  set src(val) {
    imagesFetched.push(val);
    this.onload && this.onload();
  }
};

describe('Carousel', () => {
  beforeEach(() => {
    imagesFetched = [];
  });

  afterEach(() => {
    renderToJsdom(<div></div>);
  });

  it('should render a carousel with the specified index selected', done => {
    renderToJsdom(
      <Carousel initialSlide={ 2 } slideWidth='300px' viewportWidth='300px' infinite={ false }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );

    setImmediate(() => {
      const dots = document.querySelectorAll('.carousel-dot');
      expect(dots.length).to.equal(3);
      expect(dots[2].className).to.contain('selected');
      done();
    });
  });

  it('should navigate to the next slide when the button is clicked', done => {
    renderToJsdom(
      <Carousel slideWidth='300px' viewportWidth='300px' infinite={ false }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );

    setImmediate(() => {
      const dots = document.querySelectorAll('.carousel-dot');
      expect(dots.length).to.equal(3);
      expect(dots[0].className).to.contain('selected');
      const nextButton = document.querySelector('.carousel-right-arrow');
      expect(nextButton.className).to.contain('carousel-arrow-default');
      Simulate.click(nextButton);
      expect(dots[0].className).to.not.contain('selected');
      expect(dots[1].className).to.contain('selected');
      done();
    });
  });

  it('should navigate to the previous slide when the button is clicked', done => {
    const onSlideTransitionedStub = sinon.stub();

    renderToJsdom(
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

    setImmediate(() => {
      const dots = document.querySelectorAll('.carousel-dot');
      expect(dots.length).to.equal(3);
      expect(dots[1].className).to.contain('selected');
      const prevButton = document.querySelector('.carousel-left-arrow');
      expect(prevButton.className).to.contain('carousel-arrow-default');
      Simulate.click(prevButton);
      expect(dots[1].className).to.not.contain('selected');
      expect(dots[0].className).to.contain('selected');
      expect(onSlideTransitionedStub).to.have.been.calledWith({
        autoPlay: false,
        index: 0,
        direction: 'left'
      });
      done();
    });
  });

  it('should wrap around from the last to first slide if infinite is true and next is clicked', done => {
    const onSlideTransitionedStub = sinon.stub();

    renderToJsdom(
      <Carousel initialSlide={ 2 }
        slideWidth='300px'
        viewportWidth='300px'
        infinite={ true }
        onSlideTransitioned={ onSlideTransitionedStub }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );

    setImmediate(() => {
      const dots = document.querySelectorAll('.carousel-dot');
      expect(dots.length).to.equal(3);
      expect(dots[2].className).to.contain('selected');
      const nextButton = document.querySelector('.carousel-right-arrow');
      Simulate.click(nextButton);
      expect(dots[2].className).to.not.contain('selected');
      expect(dots[0].className).to.contain('selected');
      expect(onSlideTransitionedStub).to.have.been.calledWith({
        autoPlay: false,
        index: 0,
        direction: 'right'
      });
      done();
    });
  });

  it('should wrap around from the first to last slide if infinite is true and prev is clicked', done => {
    renderToJsdom(
      <Carousel initialSlide={ 2 } slideWidth='300px' viewportWidth='300px' infinite={ true }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );

    setImmediate(() => {
      const dots = document.querySelectorAll('.carousel-dot');
      expect(dots.length).to.equal(3);
      expect(dots[2].className).to.contain('selected');
      const nextButton = document.querySelector('.carousel-right-arrow');
      Simulate.click(nextButton);
      expect(dots[2].className).to.not.contain('selected');
      expect(dots[0].className).to.contain('selected');
      done();
    });
  });

  it('should jump directly to a slide when the dot is clicked', done => {
    const onSlideTransitionedStub = sinon.stub();

    renderToJsdom(
      <Carousel slideWidth='300px'
        viewportWidth='300px'
        infinite={ false }
        onSlideTransitioned={ onSlideTransitionedStub }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );

    setImmediate(() => {
      const dots = document.querySelectorAll('.carousel-dot');
      expect(dots.length).to.equal(3);
      expect(dots[0].className).to.contain('selected');
      Simulate.click(dots[2]);
      expect(dots[0].className).to.not.contain('selected');
      expect(dots[2].className).to.contain('selected');
      expect(onSlideTransitionedStub).to.have.been.calledOnce;
      done();
    });
  });

  it('should not freeze when a selected dot is clicked', done => {
    renderToJsdom(
      <Carousel slideWidth='300px' viewportWidth='300px' infinite={ false }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );

    setImmediate(() => {
      const dots = document.querySelectorAll('.carousel-dot');
      expect(dots.length).to.equal(3);
      expect(dots[0].className).to.contain('selected');
      Simulate.click(dots[0]);
      Simulate.click(dots[2]);
      expect(dots[0].className).to.not.contain('selected');
      expect(dots[2].className).to.contain('selected');
      done();
    });
  });

  it('should prefetch the specified number of images', done => {
    renderToJsdom(
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

    setImmediate(() => {
      expect(imagesFetched.length).to.equal(3);
      done();
    });
  });

  it('should navigate to the next slide when a swipe event occurs', done => {
    const carousel = renderToJsdom(
      <Carousel slideWidth='300px' viewportWidth='300px' infinite={ false }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );

    setImmediate(() => {
      const dots = document.querySelectorAll('.carousel-dot');
      const track = document.querySelector('.carousel-track');
      expect(dots.length).to.equal(3);
      expect(dots[0].className).to.contain('selected');
      Simulate.mouseDown(track, { clientX: 0 });
      carousel.onMouseMove({ preventDefault: () => {}, clientX: -150 });
      carousel.stopDragging();
      setImmediate(() => {
        expect(dots[0].className).to.not.contain('selected');
        expect(dots[1].className).to.contain('selected');
        done();
      });
    });
  });

  it('should pause when mouse is moving', done => {
    const carousel = renderToJsdom(
      <Carousel slideWidth='300px' viewportWidth='300px' infinite={ false } autoplay={ true } pauseOnHover={ true }>
        <div id='slide1' />
        <div id='slide2' />
        <div id='slide3' />
      </Carousel>
    );

    setImmediate(() => {
      const track = document.querySelector('.carousel-viewport');
      const setHoverState = (bool) => {
        expect(bool).to.be.true;
        done();
      };
      carousel.setHoverState = setHoverState;
      carousel.handleMovement(track);
    });
  });

  it('should navigate to the last slide when a right swipe event occurs on the first slide', done => {
    const carousel = renderToJsdom(
      <Carousel slideWidth='300px' viewportWidth='300px' infinite={ true }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );

    setImmediate(() => {
      const dots = document.querySelectorAll('.carousel-dot');
      const track = document.querySelector('.carousel-track');
      expect(dots.length).to.equal(3);
      expect(dots[0].className).to.contain('selected');
      Simulate.mouseDown(track, { clientX: 0 });
      carousel.onMouseMove({ preventDefault: () => {}, clientX: 150 });
      carousel.stopDragging();
      setImmediate(() => {
        expect(dots[0].className).to.not.contain('selected');
        expect(dots[2].className).to.contain('selected');
        done();
      });
    });
  });

  it('should navigate to the next slide in response to touch events', done => {
    const carousel = renderToJsdom(
      <Carousel slideWidth='300px' viewportWidth='300px' infinite={ false }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );

    setImmediate(() => {
      const dots = document.querySelectorAll('.carousel-dot');
      const track = document.querySelector('.carousel-track');
      expect(dots.length).to.equal(3);
      expect(dots[0].className).to.contain('selected');
      Simulate.touchStart(track, { touches: [{ screenX: 0, screenY: 0 }] });
      carousel.onTouchMove({ preventDefault: () => {}, touches: [{ screenX: -150, screenY: 0 }] });
      carousel.stopDragging();

      setImmediate(() => {
        expect(dots[0].className).to.not.contain('selected');
        expect(dots[1].className).to.contain('selected');
        done();
      });
    });
  });

  it('should update the selected index if the selected slide is removed', () => {
    renderToJsdom(
      <Carousel initialSlide={ 2 } slideWidth='300px' viewportWidth='300px' infinite={ false }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );

    let dots = document.querySelectorAll('.carousel-dot');
    expect(dots.length).to.equal(3);
    expect(dots[2].className).to.contain('selected');
    renderToJsdom(
      <Carousel initialSlide={ 2 } slideWidth='300px' viewportWidth='300px' infinite={ false }>
        <div id='slide1'/>
        <div id='slide2'/>
      </Carousel>
    );
    dots = document.querySelectorAll('.carousel-dot');
    expect(dots.length).to.equal(2);
    expect(dots[1].className).to.contain('selected');
  });

  it('should apply passed inline styling', () => {
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
    renderToJsdom(
      <Carousel initialSlide={ 2 } slideWidth='300px' viewportWidth='300px' style={ styles }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );

    const container = document.querySelector('.carousel');
    expect(container.style.opacity).to.equal('0.5');
    const innerContainer = document.querySelector('.carousel-container-inner');
    expect(innerContainer.style.opacity).to.equal('0.6');
    const viewport = document.querySelector('.carousel-viewport');
    expect(viewport.style.opacity).to.equal('0.7');
    const track = document.querySelector('.carousel-track');
    expect(track.style.opacity).to.equal('0.8');
    const slide = document.querySelector('.carousel-slide');
    expect(slide.style.opacity).to.equal('0.9');
    const selectedSlide = document.querySelector('.carousel-slide-selected');
    expect(selectedSlide.style.opacity).to.equal('1');
  });

  it('should have transitions with the given duration and easing', done => {
    let slidingCarousel;

    renderToJsdom(
      <Fragment>
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
      </Fragment>
    );

    setImmediate(() => {
      slidingCarousel.goToSlide(1);
      const track = document.querySelector('.sliding-carousel .carousel-track');
      expect(track.style.transition).to.equal('transform 300ms ease-out');

      const slide = document.querySelector('.fading-carousel .carousel-slide');
      expect(slide.style.transition).to.equal('opacity 700ms linear');

      done();
    });
  });

  describe('maxRenderedSlides', () => {
    it('should only render the specified maxRenderedSlides', () => {
      renderToJsdom(
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
      const loadingSlides = document.querySelectorAll('.carousel-slide.carousel-slide-loading');
      expect(loadingSlides.length).to.equal(7);
      expect(document.getElementById('slide1')).to.not.exist;
      expect(document.getElementById('slide2')).to.exist;
      expect(document.getElementById('slide3')).to.exist;
      expect(document.getElementById('slide4')).to.exist;
      expect(document.getElementById('slide5')).to.not.exist;
      expect(document.getElementById('slide6')).to.not.exist;
      expect(document.getElementById('slide7')).to.not.exist;
      expect(document.getElementById('slide8')).to.not.exist;
      expect(document.getElementById('slide9')).to.not.exist;
      expect(document.getElementById('slide10')).to.not.exist;
    });

    it('should render the correct slides when infinite is true and the selected slide is near the end', () => {
      renderToJsdom(
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
      expect(document.getElementById('slide1')).to.exist;
      expect(document.getElementById('slide2')).to.exist;
      expect(document.getElementById('slide3')).to.not.exist;
      expect(document.getElementById('slide4')).to.not.exist;
      expect(document.getElementById('slide5')).to.not.exist;
      expect(document.getElementById('slide6')).to.not.exist;
      expect(document.getElementById('slide7')).to.not.exist;
      expect(document.getElementById('slide8')).to.not.exist;
      expect(document.getElementById('slide9')).to.not.exist;
      expect(document.getElementById('slide10')).to.exist;
    });
  });

  it('should render custom arrow', done => {
    const arrows = {
      className: 'test-custom-arrow',
      left: <span id='custom-left'>Left</span>,
      right: <span id='custom-right'>Right</span>
    };

    renderToJsdom(
      <Carousel slideWidth='300px'
        viewportWidth='300px'
        infinite={ false }
        arrows={ arrows }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );

    setImmediate(() => {
      const prevButton = document.querySelector('.carousel-left-arrow');
      const nextButton = document.querySelector('.carousel-right-arrow');
      expect(prevButton.className).to.contain('test-custom-arrow');
      expect(nextButton.className).to.contain('test-custom-arrow');
      expect(document.getElementById('custom-left')).to.exist;
      expect(document.getElementById('custom-right')).to.exist;
      done();
    });
  });

  it('should render custom arrow without className', done => {
    const arrows = {
      left: <span id='custom-left'>Left</span>,
      right: <span id='custom-right'>Right</span>
    };

    renderToJsdom(
      <Carousel slideWidth='300px'
        viewportWidth='300px'
        infinite={ false }
        arrows={ arrows }>
        <div id='slide1'/>
        <div id='slide2'/>
        <div id='slide3'/>
      </Carousel>
    );

    setImmediate(() => {
      const prevButton = document.querySelector('.carousel-left-arrow');
      const nextButton = document.querySelector('.carousel-right-arrow');
      expect(prevButton.className).to.not.contain('carousel-arrow-default');
      expect(nextButton.className).to.not.contain('carousel-arrow-default');
      expect(document.getElementById('custom-left')).to.exist;
      expect(document.getElementById('custom-right')).to.exist;
      done();
    });
  });

  it('should call onSlideTransitioned with autoPlay true', done => {
    const onSlideTransitionedStub = sinon.stub();
    const carousel = renderToJsdom(
      <Carousel slideWidth='300px'
        viewportWidth='300px'
        infinite={ false }
        autoplay={ true }
        pauseOnHover={ true }
        onSlideTransitioned={ onSlideTransitionedStub }>
        <div id='slide1' />
        <div id='slide2' />
        <div id='slide3' />
      </Carousel>
    );

    setImmediate(() => {
      const track = document.querySelector('.carousel-viewport');
      const setHoverState = (bool) => {
        expect(bool).to.be.true;
        done();
      };
      carousel.setHoverState = setHoverState;
      carousel.handleMovement(track);
      expect(onSlideTransitionedStub).to.have.been.calledWith({
        autoPlay: true,
        direction: 'right'
      });
    });
  });
});
