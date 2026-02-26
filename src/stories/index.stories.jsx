/* eslint-disable react/jsx-key */
/* eslint-disable id-length */
import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import Carousel from '../index';
import CustomArrows from './CustomArrows';
import DownArrow from '../../test/images/test-down-arrow.svg';
import UpArrow from '../../test/images/test-up-arrow.svg';

import '../carousel.less';

export default {
  component: Carousel,
  title: 'Carousel'
};

const IMAGES = [
  'http://picsum.photos/400/300',
  'http://picsum.photos/275/300',
  'http://picsum.photos/400/300',
  'http://picsum.photos/350/300',
  'http://picsum.photos/250/300',
  'http://picsum.photos/375/300',
  'http://picsum.photos/425/300',
  'http://picsum.photos/325/300'
];

const imgElements = IMAGES.map((image, index) => (
  <img src={ image } key={ index } alt='A sample' />
));

const SLIDES_TO_ADVANCE = 2;

const CustomArrowsTwoSlides = ({
  goToSlide,
  selectedIndex,
  numSlides,
  infinite,
  leftArrow,
  rightArrow,
  arrowStyle = {}
}) => {
  const goPrev = () => {
    const target = infinite
      ? selectedIndex - SLIDES_TO_ADVANCE
      : Math.max(0, selectedIndex - SLIDES_TO_ADVANCE);
    goToSlide(target, 'left');
  };
  const goNext = () => {
    const target = infinite
      ? selectedIndex + SLIDES_TO_ADVANCE
      : Math.min(numSlides - 1, selectedIndex + SLIDES_TO_ADVANCE);
    goToSlide(target, 'right');
  };
  const canGoPrev = infinite || selectedIndex >= SLIDES_TO_ADVANCE;
  const canGoNext = infinite || selectedIndex < numSlides - SLIDES_TO_ADVANCE;
  const baseStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    cursor: 'pointer',
    padding: '12px 16px',
    fontSize: '24px',
    zIndex: 1,
    ...arrowStyle
  };
  return (
    <>
      <button
        type='button'
        className='carousel-custom-arrow carousel-custom-arrow-left'
        onClick={ goPrev }
        disabled={ !canGoPrev }
        style={{
          ...baseStyle,
          left: 0,
          opacity: canGoPrev ? 1 : 0.4,
          cursor: canGoPrev ? 'pointer' : 'not-allowed'
        }}
        aria-label={ `Previous ${SLIDES_TO_ADVANCE} slides` }
      >
        {leftArrow || '‹'}
      </button>
      <button
        type='button'
        className='carousel-custom-arrow carousel-custom-arrow-right'
        onClick={ goNext }
        disabled={ !canGoNext }
        style={{
          ...baseStyle,
          right: 0,
          left: 'auto',
          opacity: canGoNext ? 1 : 0.4,
          cursor: canGoNext ? 'pointer' : 'not-allowed'
        }}
        aria-label={ `Next ${SLIDES_TO_ADVANCE} slides` }
      >
        {rightArrow || '›'}
      </button>
    </>
  );
};

CustomArrowsTwoSlides.propTypes = {
  goToSlide: PropTypes.func.isRequired,
  selectedIndex: PropTypes.number.isRequired,
  numSlides: PropTypes.number.isRequired,
  infinite: PropTypes.bool,
  leftArrow: PropTypes.node,
  rightArrow: PropTypes.node,
  arrowStyle: PropTypes.object
};

const CustomDots = ({ numSlides, selectedIndex, goToSlide, title }) => {
  const dots = [];

  for (let index = 0; index < numSlides; index++) {
    const buttonStyle = {
      border: 'none',
      cursor: 'pointer',
      background: 'transparent'
    };

    if (index === selectedIndex) {
      buttonStyle.color = 'red';
    }

    dots.push(
      <li key={ `dot-${index}` } style={{ display: 'inline-block' }}>
        <button style={ buttonStyle } onClick={ goToSlide.bind(null, index) }>
          •
        </button>
      </li>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(114, 114, 114, 0.6)',
        zIndex: '1'
      }}
    >
      <h2>{title}</h2>
      <ul style={{ listStyle: 'none', padding: '0' }}>{dots}</ul>
    </div>
  );
};

CustomDots.propTypes = {
  numSlides: PropTypes.number.isRequired,
  selectedIndex: PropTypes.number,
  goToSlide: PropTypes.func.isRequired,
  title: PropTypes.node
};

const testButtons = ['test1', 'test2', 'test3', 'test4'].map((item) => (
  <button style={{ fontSize: '20px' }}>{item}</button>
));

export const VerticalInfiniteWithCellPaddingWithDotsAndDefaultArrows = {
  args: {
    height: '450px',
    width: '450px',
    cellPadding: 5,
    infinite: true,
    arrows: true,
    dots: true,
    isVertical: true,
    children: imgElements
  }
};

export const VerticalNonInfiniteWithCellPaddingWithDefaultArrows = {
  args: {
    height: '450px',
    width: '450px',
    cellPadding: 5,
    infinite: false,
    arrows: true,
    dots: false,
    isVertical: true,
    children: imgElements
  }
};

export const VerticalNonInfiniteButtonsWithCellPaddingWithCustomArrows = {
  args: {
    height: '450px',
    width: '450px',
    cellPadding: 5,
    infinite: false,
    arrows: false,
    dots: false,
    isVertical: true,
    controls: [{
      component: CustomArrows,
      props: {
        overrideArrowStyle: { border: 'none', background: 'none' },
        topArrowImage: <UpArrow/>,
        bottomArrowImage: <DownArrow/>,
        arrowDivStyle: { transform: 'translate(-450px, 196px)' }
      }
    }],
    children: testButtons
  }
};

export const twoSlidesAtATimeWithCustomArrows = () => (
  <Carousel
    width='600px'
    cellPadding={ 5 }
    infinite={ true }
    arrows={ false }
    dots={ false }
    slideAlignment='left'
    slideWidth='50%'
    slideHeight='100%'
    lazyLoad={ false }
    controls={ [
      {
        component: CustomArrowsTwoSlides,
        props: {
          arrowStyle: { borderRadius: '8px', fontWeight: 'bold' }
        }
      }
    ] }
  >
    {imgElements}
  </Carousel>
);

export const InfiniteWithCellPadding = {
  args: {
    width: '450px',
    cellPadding: 5,
    children: imgElements
  }
};

export const NonInfiniteWithCellPadding = {
  args: {
    infinite: false,
    width: '450px',
    cellPadding: 5,
    children: imgElements
  }
};

export const FadeTransition = {
  args: {
    width: '450px',
    slideHeight: '300px',
    transitionDuration: 1000,
    draggable: false,
    transition: 'fade',
    children: imgElements
  }
};

export const NoneTransition = {
  args: {
    width: '450px',
    slideHeight: '300px',
    draggable: false,
    transition: 'none',
    autoplay: true,
    children: imgElements
  }
};

export const InfiniteWithOnly2Slides = {
  args: {
    width: '450px',
    arrows: false,
    slideHeight: '300px'
  },
  render: (args) => (
    <Carousel { ...args }>
      <img src='http://picsum.photos/325/300' alt='A sample' />
      <img src='http://picsum.photos/350/300' alt='A sample' />
    </Carousel>
  )
};

export const InfiniteWithOnly1Slide = {
  args: {
    width: '450px',
    infinite: true,
    arrows: false,
    dots: false
  },
  render: (args) => (
    <Carousel { ...args }>
      <img src='http://picsum.photos/325/300' alt='A sample' />
    </Carousel>
  )
};

export const AutoplayWithBackgroundImages = {
  args: {
    width: '100%',
    slideWidth: '100%',
    slideHeight: '70vh',
    arrows: false,
    autoplay: true
  },
  render: (args) => (
    <Carousel { ...args }>
      <div style={{
        backgroundImage: 'url(http://picsum.photos/600/300)',
        backgroundSize: 'cover',
        height: '100%',
        width: '100%'
      }}/>
      <div style={{
        backgroundImage: 'url(http://picsum.photos/650/300)',
        backgroundSize: 'cover',
        height: '100%',
        width: '100%'
      }}/>
      <div style={{
        backgroundImage: 'url(http://picsum.photos/675/300)',
        backgroundSize: 'cover',
        height: '100%',
        width: '100%'
      }}/>
      <div style={{
        backgroundImage: 'url(http://picsum.photos/700/300)',
        backgroundSize: 'cover',
        height: '100%',
        width: '100%'
      }}/>
    </Carousel>
  )
};

export const BackgroundImagesWithFade = {
  args: {
    width: '100%',
    slideWidth: '100%',
    slideHeight: '70vh',
    transition: 'fade',
    transitionDuration: 1000,
    autoplay: true,
    arrows: true
  },
  render: (args) => (
    <Carousel { ...args }>
      <div style={{
        backgroundImage: 'url(http://picsum.photos/600/300)',
        backgroundSize: 'cover',
        height: '100%',
        width: '100%'
      }}/>
      <div style={{
        backgroundImage: 'url(http://picsum.photos/650/300)',
        backgroundSize: 'cover',
        height: '100%',
        width: '100%'
      }}/>
      <div style={{
        backgroundImage: 'url(http://picsum.photos/675/300)',
        backgroundSize: 'cover',
        height: '100%',
        width: '100%'
      }}/>
      <div style={{
        backgroundImage: 'url(http://picsum.photos/700/300)',
        backgroundSize: 'cover',
        height: '100%',
        width: '100%'
      }}/>
      <div style={{
        backgroundImage: 'url(http://picsum.photos/750/300)',
        backgroundSize: 'cover',
        height: '100%',
        width: '100%'
      }}/>
      <div style={{
        backgroundImage: 'url(http://picsum.photos/725/300)',
        backgroundSize: 'cover',
        height: '100%',
        width: '100%'
      }}/>
      <div style={{
        backgroundImage: 'url(http://picsum.photos/625/300)',
        backgroundSize: 'cover',
        height: '100%',
        width: '100%'
      }}/>
    </Carousel>
  )
};

export const CustomDotsComponent = {
  args: {
    width: '450px',
    cellPadding: 5,
    infinite: false,
    dots: false,
    arrows: false,
    autoplay: true,
    controls: [{ component: CustomDots, props: { title: 'My Slides' }, position: 'top' }],
    transitionDuration: 0,
    children: imgElements
  }
};

const AddImagesComponent = () => {
  const [images, setImages] = useState([IMAGES[0]]);

  const addImage = () => {
    if (images.length < IMAGES.length) {
      setImages(images.concat(IMAGES[images.length]));
    }
  };

  return (
    <Fragment>
      <Carousel
        width='450px'
        cellPadding={ 5 }
        infinite={ true }
        dots={ false }
        arrows={ false }
        autoplay={ false }
        controls={ [
          {
            component: CustomDots,
            props: { title: 'My Slides' },
            position: 'top'
          }
        ] }
      >
        {images.map((image, index) => (
          <img key={ index } src={ image } alt='A sample' />
        ))}
      </Carousel>
      <button onClick={ addImage }>Add Image</button>
    </Fragment>
  );
};

export const AddImages = {
  render: AddImagesComponent
};

export const LeftAlignedSlides = {
  args: {
    width: '450px',
    cellPadding: 5,
    slideAlignment: 'left',
    children: imgElements
  }
};

export const RightAlignedSlides = {
  args: {
    width: '450px',
    cellPadding: 5,
    slideAlignment: 'right',
    children: imgElements
  }
};

const RTL_TEXT_SLIDES = [
  { label: 'RTL ←', text: 'Hello' },
  { label: 'RTL ←', text: 'World' },
  { label: 'RTL ←', text: 'Test' },
  { label: 'RTL ←', text: '1' },
  { label: 'RTL ←', text: '2' },
  { label: 'RTL ←', text: '3' }
].map(({ label, text }, index) => (
  <div
    key={ index }
    style={{
      minHeight: '200px',
      padding: '24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      fontSize: '24px',
      width: '250px',
      borderRadius: '8px'
    }}
  >
    <span style={{ fontSize: '14px', opacity: 0.9 }}>{label}</span>
    <span>{text}</span>
  </div>
));

export const Rtl = {
  args: {
    width: '450px',
    cellPadding: 5,
    dir: 'rtl',
    children: RTL_TEXT_SLIDES
  },
  render: (args) => (
    <div dir='rtl'>
      <Carousel { ...args } />
    </div>
  )
};
