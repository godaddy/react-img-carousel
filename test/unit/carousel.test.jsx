/* eslint max-statements: 0, jsx-a11y/alt-text: 0 */
import React from "react";
import { mount } from "enzyme";
import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import Carousel from "../../src/index";
import CustomArrows from "../../src/stories/CustomArrows";
import UpArrow from "../images/test-up-arrow.svg";
import DownArrow from "../images/test-down-arrow.svg";

chai.use(sinonChai);
let imagesFetched;

global.Image = class MyImage {
  set src(val) {
    imagesFetched.push(val);
    this.onload && this.onload();
  }
};

describe("Carousel", () => {
  let tree;
  function renderToJsdom(component) {
    tree = mount(component);
    return tree.instance();
  }

  beforeEach(() => {
    imagesFetched = [];
  });

  afterEach(() => {
    tree && tree.unmount();
    tree = null;
  });

  it("should render a carousel with the specified index selected", (done) => {
    renderToJsdom(
      <Carousel
        initialSlide={2}
        slideWidth="300px"
        viewportWidth="300px"
        infinite={false}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      const dots = tree.find(".carousel-dot");
      expect(dots.length).to.equal(3);
      expect(dots.at(2).prop("className")).to.contain("selected");
      done();
    });
  });

  it("should navigate to the next slide when the button is clicked", (done) => {
    renderToJsdom(
      <Carousel slideWidth="300px" viewportWidth="300px" infinite={false}>
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      let dots = tree.find(".carousel-dot");
      expect(dots.length).to.equal(3);
      expect(dots.at(0).prop("className")).to.contain("selected");
      const nextButton = tree.find(".carousel-right-arrow");
      expect(nextButton.prop("className")).to.contain("carousel-arrow-default");
      nextButton.simulate("click");
      dots = tree.find(".carousel-dot");
      expect(dots.at(0).prop("className")).to.not.contain("selected");
      expect(dots.at(1).prop("className")).to.contain("selected");
      done();
    });
  });

  it("should navigate to the previous slide when the button is clicked", (done) => {
    const onSlideTransitionedStub = sinon.stub();

    renderToJsdom(
      <Carousel
        initialSlide={1}
        slideWidth="300px"
        viewportWidth="300px"
        infinite={false}
        onSlideTransitioned={onSlideTransitionedStub}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      let dots = tree.find(".carousel-dot");
      expect(dots.length).to.equal(3);
      expect(dots.at(1).prop("className")).to.contain("selected");
      const prevButton = tree.find(".carousel-left-arrow");
      expect(prevButton.prop("className")).to.contain("carousel-arrow-default");
      prevButton.simulate("click");
      dots = tree.find(".carousel-dot");
      expect(dots.at(1).prop("className")).to.not.contain("selected");
      expect(dots.at(0).prop("className")).to.contain("selected");
      expect(onSlideTransitionedStub).to.have.been.calledWith({
        autoPlay: false,
        index: 0,
        direction: "left",
      });
      done();
    });
  });

  it("should wrap around from the last to first slide if infinite is true and next is clicked", (done) => {
    const onSlideTransitionedStub = sinon.stub();
    const beforeChangeStub = sinon.stub();

    renderToJsdom(
      <Carousel
        initialSlide={2}
        slideWidth="300px"
        viewportWidth="300px"
        infinite={true}
        onSlideTransitioned={onSlideTransitionedStub}
        beforeChange={beforeChangeStub}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      let dots = tree.find(".carousel-dot");
      expect(dots.length).to.equal(3);
      expect(dots.at(2).prop("className")).to.contain("selected");
      const nextButton = tree.find(".carousel-right-arrow");
      nextButton.simulate("click");
      dots = tree.find(".carousel-dot");
      expect(dots.at(2).prop("className")).to.not.contain("selected");
      expect(dots.at(0).prop("className")).to.contain("selected");
      expect(onSlideTransitionedStub).to.have.been.calledWith({
        autoPlay: false,
        index: 0,
        direction: "right",
      });
      expect(beforeChangeStub).to.have.been.calledWith(0, 2, "right");
      done();
    });
  });

  it("should wrap around from the first to last slide if infinite is true and prev is clicked", (done) => {
    const beforeChangeStub = sinon.stub();

    renderToJsdom(
      <Carousel
        initialSlide={0}
        slideWidth="300px"
        viewportWidth="300px"
        infinite={true}
        beforeChange={beforeChangeStub}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      let dots = tree.find(".carousel-dot");
      expect(dots.length).to.equal(3);
      expect(dots.at(0).prop("className")).to.contain("selected");
      const prevButton = tree.find(".carousel-left-arrow");
      prevButton.simulate("click");
      dots = tree.find(".carousel-dot");
      expect(dots.at(0).prop("className")).to.not.contain("selected");
      expect(dots.at(2).prop("className")).to.contain("selected");
      expect(beforeChangeStub).to.have.been.calledWith(2, 0, "left");
      done();
    });
  });

  it("should jump directly to a slide when the dot is clicked", (done) => {
    const onSlideTransitionedStub = sinon.stub();

    renderToJsdom(
      <Carousel
        slideWidth="300px"
        viewportWidth="300px"
        infinite={false}
        onSlideTransitioned={onSlideTransitionedStub}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      let dots = tree.find(".carousel-dot");
      expect(dots.length).to.equal(3);
      expect(dots.at(0).prop("className")).to.contain("selected");
      dots.at(2).simulate("click");
      dots = tree.find(".carousel-dot");
      expect(dots.at(0).prop("className")).to.not.contain("selected");
      expect(dots.at(2).prop("className")).to.contain("selected");
      expect(onSlideTransitionedStub).to.have.been.calledOnce;
      done();
    });
  });

  it("should jump directly to a slide when the slide is clicked", (done) => {
    const onSlideTransitionedStub = sinon.stub();

    renderToJsdom(
      <Carousel
        slideWidth="300px"
        viewportWidth="300px"
        infinite={true}
        onSlideTransitioned={onSlideTransitionedStub}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
        <div id="slide4" />
        <div id="slide5" />
        <div id="slide6" />
      </Carousel>
    );

    setImmediate(() => {
      let slides = tree.find(".carousel-slide");
      const track = tree.find(".carousel-track");
      expect(slides.length).to.equal(10);
      expect(slides.at(2).prop("className")).to.contain(
        "carousel-slide-selected"
      );
      expect(slides.at(2).prop("data-index")).to.eql(0);
      slides.at(0).simulate("mousedown", { clientX: 0, clientY: 0 });
      slides.at(0).simulate("click", { clientX: 0, clientY: 0 });
      slides = tree.find(".carousel-slide");
      expect(slides.at(6).prop("className")).to.contain(
        "carousel-slide-selected"
      );
      expect(slides.at(6).prop("data-index")).to.eql(4);
      track.simulate("transitionend", { propertyName: "transform" });
      slides.at(9).simulate("mousedown", { clientX: 0, clientY: 0 });
      slides.at(9).simulate("click", { clientX: 0, clientY: 0 });
      slides = tree.find(".carousel-slide");
      expect(slides.at(3).prop("className")).to.contain(
        "carousel-slide-selected"
      );
      expect(slides.at(3).prop("data-index")).to.eql(1);
      done();
    });
  });

  it("should not freeze when a selected dot is clicked", (done) => {
    renderToJsdom(
      <Carousel slideWidth="300px" viewportWidth="300px" infinite={false}>
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      let dots = tree.find(".carousel-dot");
      expect(dots.length).to.equal(3);
      expect(dots.at(0).prop("className")).to.contain("selected");
      dots.at(0).simulate("click");

      dots = tree.find(".carousel-dot");
      dots.at(2).simulate("click");

      dots = tree.find(".carousel-dot");
      expect(dots.at(0).prop("className")).to.not.contain("selected");
      expect(dots.at(2).prop("className")).to.contain("selected");
      done();
    });
  });

  it("should prefetch the specified number of images", (done) => {
    renderToJsdom(
      <Carousel
        slideWidth="300px"
        viewportWidth="300px"
        infinite={false}
        imagesToPrefetch={3}
      >
        <img src="https://placekitten.com/200/300" />
        <img src="https://placekitten.com/300/300" />
        <img src="https://placekitten.com/400/300" />
        <img src="https://placekitten.com/350/300" />
        <img src="https://placekitten.com/250/300" />
        <img src="https://placekitten.com/375/300" />
        <img src="https://placekitten.com/425/300" />
        <img src="https://placekitten.com/325/300" />
      </Carousel>
    );

    setImmediate(() => {
      expect(imagesFetched.length).to.equal(3);
      done();
    });
  });

  it("should navigate to the next slide when a swipe event occurs", (done) => {
    const carousel = renderToJsdom(
      <Carousel slideWidth="300px" viewportWidth="300px" infinite={false}>
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      let dots = tree.find(".carousel-dot");
      const track = tree.find(".carousel-track");
      expect(dots.length).to.equal(3);
      expect(dots.at(0).prop("className")).to.contain("selected");
      track.simulate("mouseDown", { clientX: 0 });
      carousel.onMouseMove({ preventDefault: () => {}, clientX: -150 });
      carousel.stopDragging();
      tree.update();
      setImmediate(() => {
        dots = tree.find(".carousel-dot");
        expect(dots.at(0).prop("className")).to.not.contain("selected");
        expect(dots.at(1).prop("className")).to.contain("selected");
        done();
      });
    });
  });

  it("should pause when mouse is moving", (done) => {
    const carousel = renderToJsdom(
      <Carousel
        slideWidth="300px"
        viewportWidth="300px"
        infinite={false}
        autoplay={true}
        pauseOnHover={true}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      const track = tree.find(".carousel-viewport");
      const setHoverState = (bool) => {
        expect(bool).to.be.true;
        done();
      };
      carousel.setHoverState = setHoverState;
      carousel.handleMovement(track);
    });
  });

  it("should navigate to the last slide when a right swipe event occurs on the first slide", (done) => {
    const carousel = renderToJsdom(
      <Carousel slideWidth="300px" viewportWidth="300px" infinite={true}>
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      let dots = tree.find(".carousel-dot");
      const track = tree.find(".carousel-track");
      expect(dots.length).to.equal(3);
      expect(dots.at(0).prop("className")).to.contain("selected");
      track.simulate("mouseDown", { clientX: 0 });
      carousel.onMouseMove({ preventDefault: () => {}, clientX: 150 });
      carousel.stopDragging();
      tree.update();
      setImmediate(() => {
        dots = tree.find(".carousel-dot");
        expect(dots.at(0).prop("className")).to.not.contain("selected");
        expect(dots.at(2).prop("className")).to.contain("selected");
        done();
      });
    });
  });

  it("should navigate to the next slide in response to touch events", (done) => {
    const carousel = renderToJsdom(
      <Carousel slideWidth="300px" viewportWidth="300px" infinite={false}>
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      let dots = tree.find(".carousel-dot");
      const track = tree.find(".carousel-track");
      expect(dots.length).to.equal(3);
      expect(dots.at(0).prop("className")).to.contain("selected");
      track.simulate("touchStart", { touches: [{ screenX: 0, screenY: 0 }] });
      carousel.onTouchMove({
        preventDefault: () => {},
        touches: [{ screenX: -150, screenY: 0 }],
      });
      carousel.stopDragging();
      tree.update();

      setImmediate(() => {
        dots = tree.find(".carousel-dot");
        expect(dots.at(0).prop("className")).to.not.contain("selected");
        expect(dots.at(1).prop("className")).to.contain("selected");
        done();
      });
    });
  });

  it("should update the selected index if the selected slide is removed", () => {
    renderToJsdom(
      <Carousel
        initialSlide={2}
        slideWidth="300px"
        viewportWidth="300px"
        infinite={false}
      >
        <div id="slide1" key="slide1" />
        <div id="slide2" key="slide2" />
        <div id="slide3" key="slide3" />
      </Carousel>
    );

    let dots = tree.find(".carousel-dot");
    expect(dots.length).to.equal(3);
    expect(dots.at(2).prop("className")).to.contain("selected");

    tree.setProps({
      children: [
        <div id="slide1" key="slide1" />,
        <div id="slide2" key="slide2" />,
      ],
    });
    dots = tree.find(".carousel-dot");
    expect(dots.length).to.equal(2);
    expect(dots.at(1).prop("className")).to.contain("selected");
  });

  it("should apply passed inline styling", () => {
    const styles = {
      container: {
        opacity: 0.5,
      },
      containerInner: {
        opacity: 0.6,
      },
      viewport: {
        opacity: 0.7,
      },
      track: {
        opacity: 0.8,
      },
      slide: {
        opacity: 0.9,
      },
      selectedSlide: {
        opacity: 1,
      },
    };
    renderToJsdom(
      <Carousel
        initialSlide={2}
        slideWidth="300px"
        viewportWidth="300px"
        style={styles}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    const container = tree.find(".carousel");
    expect(container.prop("style").opacity).to.equal(0.5);
    const innerContainer = tree.find(".carousel-container-inner");
    expect(innerContainer.prop("style").opacity).to.equal(0.6);
    const viewport = tree.find(".carousel-viewport");
    expect(viewport.prop("style").opacity).to.equal(0.7);
    const track = tree.find(".carousel-track");
    expect(track.prop("style").opacity).to.equal(0.8);
    const slide = tree.find(".carousel-slide");
    expect(slide.at(0).prop("style").opacity).to.equal(0.9);
    const selectedSlide = tree.find(".carousel-slide-selected");
    expect(selectedSlide.prop("style").opacity).to.equal(1);
  });

  it("should render vertical carousal with default arrows.", () => {
    renderToJsdom(
      <Carousel
        slideWidth="300px"
        viewportWidth="300px"
        lazyLoad={false}
        infinite={false}
        isVertical={true}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );
    const topArrow = tree.find(".carousel-top-arrow");
    const bottomArrow = tree.find(".carousel-bottom-arrow");
    const carousalDiv = tree.find(".carousel-container-inner");

    expect(carousalDiv.prop("style").display).to.eql("flex");
    expect(topArrow.length).to.eql(1);
    expect(topArrow.html()).to.eql(
      '<button type="button" disabled="" class="carousel-arrow carousel-top-arrow carousel-arrow-default"></button>'
    );
    expect(bottomArrow.length).to.eql(1);
    expect(bottomArrow.html()).to.eql(
      '<button type="button" class="carousel-arrow carousel-bottom-arrow carousel-arrow-default"></button>'
    );
  });

  it("should render vertical carousal with custom arrows.", () => {
    renderToJsdom(
      <Carousel
        slideWidth="300px"
        viewportWidth="300px"
        lazyLoad={false}
        infinite={false}
        isVertical={true}
        arrows={false}
        controls={[
          {
            component: CustomArrows,
            props: {
              overrideArrowStyle: { border: "none", background: "none" },
              topArrowImage: <UpArrow />,
              bottomArrowImage: <DownArrow />,
            },
          },
        ]}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    const controlComponent = tree.find(".custom-arrows-div");
    expect(controlComponent.childAt(0).html()).to.eql(
      '<button class="carousel-custom-arrow" disabled="" style="background: none; opacity: 0.5; cursor: not-allowed;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="m0 16.67 2.829 2.83 9.175-9.339 9.167 9.339L24 16.67 12.004 4.5z"></path></svg></button>'
    );
    expect(controlComponent.childAt(1).html()).to.eql(
      '<button class="carousel-custom-arrow" style="background: none; opacity: 1; cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M0 7.33 2.829 4.5l9.175 9.339L21.171 4.5 24 7.33 12.004 19.5z"></path></svg></button>'
    );
  });

  it("should have transitions with the given duration and easing", (done) => {
    let slidingCarousel;

    tree = mount(
      <div>
        <Carousel
          className="sliding-carousel"
          slideWidth="300px"
          viewportWidth="300px"
          infinite={false}
          transition="slide"
          transitionDuration={300}
          easing="ease-out"
          ref={(el) => {
            slidingCarousel = el;
          }}
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
        </Carousel>
        <Carousel
          className="fading-carousel"
          slideWidth="300px"
          viewportWidth="300px"
          infinite={false}
          transition="fade"
          transitionDuration={700}
          easing="linear"
        >
          <div id="slide4" />
          <div id="slide5" />
          <div id="slide6" />
        </Carousel>
      </div>
    );

    setImmediate(() => {
      slidingCarousel.goToSlide(1);
      tree.update();
      const track = tree.find(".sliding-carousel .carousel-track");
      expect(track.prop("style").transition).to.equal(
        "transform 300ms ease-out"
      );

      const slide = tree.find(".fading-carousel .carousel-slide").at(0);
      expect(slide.prop("style").transition).to.equal("opacity 700ms linear");
      done();
    });
  });

  it("should support passing none for the transition type", (done) => {
    let noneCarousel;

    tree = mount(
      <Carousel
        className="none-carousel"
        slideWidth="300px"
        viewportWidth="300px"
        infinite={false}
        transition="none"
        ref={(el) => {
          noneCarousel = el;
        }}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      noneCarousel.goToSlide(1);
      tree.update();
      const track = tree.find(".none-carousel .carousel-track");
      expect(track.prop("style").transition).to.not.exist;

      done();
    });
  });

  describe("maxRenderedSlides", () => {
    it("should only render the specified maxRenderedSlides", () => {
      renderToJsdom(
        <Carousel
          initialSlide={2}
          slideWidth="300px"
          viewportWidth="300px"
          maxRenderedSlides={3}
          infinite={false}
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
          <div id="slide4" />
          <div id="slide5" />
          <div id="slide6" />
          <div id="slide7" />
          <div id="slide8" />
          <div id="slide9" />
          <div id="slide10" />
        </Carousel>
      );
      const loadingSlides = tree.find(".carousel-slide.carousel-slide-loading");
      expect(loadingSlides.length).to.equal(7);
      expect(tree.find("#slide1").exists()).to.be.false;
      expect(tree.find("#slide2").exists()).to.be.true;
      expect(tree.find("#slide3").exists()).to.be.true;
      expect(tree.find("#slide4").exists()).to.be.true;
      expect(tree.find("#slide5").exists()).to.be.false;
      expect(tree.find("#slide6").exists()).to.be.false;
      expect(tree.find("#slide7").exists()).to.be.false;
      expect(tree.find("#slide8").exists()).to.be.false;
      expect(tree.find("#slide9").exists()).to.be.false;
      expect(tree.find("#slide10").exists()).to.be.false;
    });

    it("should render the correct slides when infinite is true and the selected slide is near the end", () => {
      renderToJsdom(
        <Carousel
          initialSlide={0}
          slideWidth="300px"
          viewportWidth="300px"
          maxRenderedSlides={3}
          infinite={true}
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
          <div id="slide4" />
          <div id="slide5" />
          <div id="slide6" />
          <div id="slide7" />
          <div id="slide8" />
          <div id="slide9" />
          <div id="slide10" />
        </Carousel>
      );
      expect(tree.find("#slide1").exists()).to.be.true;
      expect(tree.find("#slide2").exists()).to.be.true;
      expect(tree.find("#slide3").exists()).to.be.false;
      expect(tree.find("#slide4").exists()).to.be.false;
      expect(tree.find("#slide5").exists()).to.be.false;
      expect(tree.find("#slide6").exists()).to.be.false;
      expect(tree.find("#slide7").exists()).to.be.false;
      expect(tree.find("#slide8").exists()).to.be.false;
      expect(tree.find("#slide9").exists()).to.be.false;
      expect(tree.find("#slide10").exists()).to.be.true;
    });
  });

  it("should render custom arrow", (done) => {
    const arrows = {
      className: "test-custom-arrow",
      left: <span id="custom-left">Left</span>,
      right: <span id="custom-right">Right</span>,
    };

    renderToJsdom(
      <Carousel
        slideWidth="300px"
        viewportWidth="300px"
        infinite={false}
        arrows={arrows}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      const prevButton = tree.find(".carousel-left-arrow");
      const nextButton = tree.find(".carousel-right-arrow");
      expect(prevButton.prop("className")).to.contain("test-custom-arrow");
      expect(nextButton.prop("className")).to.contain("test-custom-arrow");
      expect(tree.find("#custom-left")).to.exist;
      expect(tree.find("#custom-right")).to.exist;
      done();
    });
  });

  it("should render custom arrow without className", (done) => {
    const arrows = {
      left: <span id="custom-left">Left</span>,
      right: <span id="custom-right">Right</span>,
    };

    renderToJsdom(
      <Carousel
        slideWidth="300px"
        viewportWidth="300px"
        infinite={false}
        arrows={arrows}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setImmediate(() => {
      const prevButton = tree.find(".carousel-left-arrow");
      const nextButton = tree.find(".carousel-right-arrow");
      expect(prevButton.prop("className")).to.not.contain(
        "carousel-arrow-default"
      );
      expect(nextButton.prop("className")).to.not.contain(
        "carousel-arrow-default"
      );
      expect(tree.find("#custom-left")).to.exist;
      expect(tree.find("#custom-right")).to.exist;
      done();
    });
  });

  it("should call onSlideTransitioned with autoPlay true", (done) => {
    const onSlideTransitionedStub = sinon.stub();
    const carousel = renderToJsdom(
      <Carousel
        slideWidth="300px"
        viewportWidth="300px"
        lazyLoad={false}
        infinite={false}
        autoplay={true}
        autoplaySpeed={10}
        pauseOnHover={true}
        onSlideTransitioned={onSlideTransitionedStub}
      >
        <div id="slide1" />
        <div id="slide2" />
        <div id="slide3" />
      </Carousel>
    );

    setTimeout(() => {
      const track = tree.find(".carousel-viewport");
      const setHoverState = sinon.spy();
      carousel.setHoverState = setHoverState;
      carousel.handleMovement(track);

      expect(setHoverState).to.have.been.calledWith(true);
      expect(onSlideTransitionedStub).to.have.been.calledWithMatch({
        autoPlay: true,
        direction: "right",
      });
      done();
    }, 20);
  });

  describe("calcLeftOffset", () => {
    it("should calculate left offset for center alignment (default)", (done) => {
      const carousel = renderToJsdom(
        <Carousel
          slideWidth="300px"
          viewportWidth="600px"
          lazyLoad={false}
          infinite={false}
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
        </Carousel>
      );

      // With center alignment, leftOffset should position slide at center of viewport
      expect(carousel.state.leftOffset).to.equal(150);
      done();
    });

    it("should calculate left offset for left alignment", (done) => {
      const carousel = renderToJsdom(
        <Carousel
          slideWidth="300px"
          viewportWidth="600px"
          lazyLoad={false}
          infinite={false}
          slideAlignment="left"
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
        </Carousel>
      );

      expect(carousel.state.leftOffset).to.equal(0);
      done();
    });

    it("should calculate left offset for right alignment", (done) => {
      const carousel = renderToJsdom(
        <Carousel
          slideWidth="300px"
          viewportWidth="600px"
          lazyLoad={false}
          infinite={false}
          slideAlignment="right"
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
        </Carousel>
      );

      expect(carousel.state.leftOffset).to.equal(300);
      done();
    });

    it("should not transition when at first slide and direction is right in non-infinite mode", (done) => {
      const carousel = renderToJsdom(
        <Carousel
          slideWidth="300px"
          viewportWidth="300px"
          lazyLoad={false}
          infinite={false}
          initialSlide={0}
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
        </Carousel>
      );

      const initialOffset = carousel.state.leftOffset;
      // Try to go left (which would be "right" direction internally) at first slide
      carousel.setState({ direction: "right" }, () => {
        carousel.calcLeftOffset();
        // Offset should not change for invalid transition
        expect(carousel.state.leftOffset).to.equal(initialOffset);
        done();
      });
    });

    it("should not transition when at last slide and direction is left in non-infinite mode", (done) => {
      const carousel = renderToJsdom(
        <Carousel
          slideWidth="300px"
          viewportWidth="300px"
          lazyLoad={false}
          infinite={false}
          initialSlide={2}
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
        </Carousel>
      );

      const initialOffset = carousel.state.leftOffset;
      // Try to go right (which would be "left" direction internally) at last slide
      carousel.setState({ direction: "left" }, () => {
        carousel.calcLeftOffset();
        // Offset should not change for invalid transition
        expect(carousel.state.leftOffset).to.equal(initialOffset);
        done();
      });
    });

    it("should detect looping left when transitioning from first to last slide", (done) => {
      const carousel = renderToJsdom(
        <Carousel
          slideWidth="300px"
          viewportWidth="300px"
          lazyLoad={false}
          infinite={true}
          initialSlide={0}
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
        </Carousel>
      );

      // Simulate looping left: from slide 0 to slide 2, direction left
      carousel.setState(
        {
          currentSlide: 2,
          direction: "left",
          transitioningFrom: 0,
        },
        () => {
          carousel.calcLeftOffset();
          expect(carousel.state.leftOffset).to.equal(-600);
          done();
        }
      );
    });

    it("should detect looping right when transitioning from last to first slide", (done) => {
      const carousel = renderToJsdom(
        <Carousel
          slideWidth="300px"
          viewportWidth="300px"
          lazyLoad={false}
          infinite={true}
          initialSlide={2}
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
        </Carousel>
      );

      // Simulate looping right: from slide 2 to slide 0, direction right
      carousel.setState(
        {
          currentSlide: 0,
          direction: "right",
          transitioningFrom: 2,
        },
        () => {
          carousel.calcLeftOffset();
          expect(carousel.state.leftOffset).to.equal(-1200);
          done();
        }
      );
    });

    it("should handle cellPadding in offset calculation", (done) => {
      const carousel = renderToJsdom(
        <Carousel
          slideWidth="300px"
          viewportWidth="300px"
          lazyLoad={false}
          infinite={false}
          cellPadding={10}
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
        </Carousel>
      );

      // With cellPadding=10, initial slide 0: offset = -cellPadding = -10
      expect(carousel.state.leftOffset).to.equal(-10);
      done();
    });

    it("should clear transitioningFrom after transition completes in infinite mode", (done) => {
      const carousel = renderToJsdom(
        <Carousel
          slideWidth="300px"
          viewportWidth="300px"
          lazyLoad={false}
          infinite={true}
          initialSlide={0}
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
        </Carousel>
      );

      const nextButton = tree.find(".carousel-right-arrow");
      nextButton.simulate("click");

      expect(carousel.state.transitioningFrom).to.equal(0);
      expect(carousel.state.currentSlide).to.equal(1);
      done();
    });

    it("should handle vertical carousel offset calculation", (done) => {
      const carousel = renderToJsdom(
        <Carousel
          slideWidth="300px"
          slideHeight="300px"
          viewportWidth="600px"
          viewportHeight="600px"
          lazyLoad={false}
          infinite={false}
          isVertical={true}
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
        </Carousel>
      );

      expect(carousel.state.leftOffset).to.equal(150);
      done();
    });

    it("should handle looping left with multi-slide transition", (done) => {
      const carousel = renderToJsdom(
        <Carousel
          slideWidth="300px"
          viewportWidth="300px"
          lazyLoad={false}
          infinite={true}
          initialSlide={1}
        >
          <div id="slide1" />
          <div id="slide2" />
          <div id="slide3" />
          <div id="slide4" />
          <div id="slide5" />
        </Carousel>
      );

      // Simulate looping left with multi-slide: from slide 1 to slide 4, direction left
      // This means we're going backwards and wrapping around
      carousel.setState(
        {
          currentSlide: 4,
          direction: "left",
          transitioningFrom: 1,
        },
        () => {
          carousel.calcLeftOffset();
          expect(carousel.state.leftOffset).to.equal(-900);
          done();
        }
      );
    });
  });
});
