import React from 'react';
import { render } from 'react-dom';
import { expect } from 'chai';
import { Simulate } from 'react-addons-test-utils';
import Carousel from '../../src/index';

function renderToJsdom(component) {
  return render(component, window.document.querySelector('#root'));
}

let imagesFetched;

global.Image = class MyImage {
  set src (val) {
    imagesFetched.push(val);
    this.onload && this.onload();
  }
}

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
      Simulate.click(nextButton);
      expect(dots[0].className).to.not.contain('selected');
      expect(dots[1].className).to.contain('selected');
      done();
    });
  });

  it('should navigate to the previous slide when the button is clicked', done => {
    renderToJsdom(
      <Carousel initialSlide={ 1 } slideWidth='300px' viewportWidth='300px' infinite={ false }>
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
      Simulate.click(prevButton);
      expect(dots[1].className).to.not.contain('selected');
      expect(dots[0].className).to.contain('selected');
      done();
    });
  });

  it('should wrap around from the last to first slide if infinite is true and next is clicked', done => {
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
    renderToJsdom(
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
      Simulate.mouseMove(track, { clientX: -150 });
      Simulate.mouseUp(track);
      setImmediate(() => {
        expect(dots[0].className).to.not.contain('selected');
        expect(dots[1].className).to.contain('selected');
        done();
      });
    });
  });

  it('should navigate to the last slide when a right swipe event occurs on the first slide', done => {
    renderToJsdom(
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
      Simulate.mouseMove(track, { clientX: 150 });
      Simulate.mouseUp(track);
      setImmediate(() => {
        expect(dots[0].className).to.not.contain('selected');
        expect(dots[2].className).to.contain('selected');
        done();
      });
    });
  });

  it('should navigate to the next slide in response to touch events', done => {
    renderToJsdom(
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
      Simulate.touchStart(track, { touches: [{ clientX: 0 }] });
      Simulate.touchMove(track, { touches: [{ clientX: -150 }] });
      Simulate.touchEnd(track);
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
  });
});
