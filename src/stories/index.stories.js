import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import Carousel from '../index';

require('../carousel.less');

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

const imgElements = IMAGES.map((image, index) => <img src={ image } key={ index } alt='A sample' />);

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
        <button style={ buttonStyle } onClick={ goToSlide.bind(null, index) }>•</button>
      </li>
    );
  }

  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(114, 114, 114, 0.6)', zIndex: '1' }}>
      <h2>{ title }</h2>
      <ul style={{ listStyle: 'none', padding: '0' }}>
        { dots }
      </ul>
    </div>
  );
};

CustomDots.propTypes = {
  numSlides: PropTypes.number.isRequired,
  selectedIndex: PropTypes.number,
  goToSlide: PropTypes.func.isRequired,
  title: PropTypes.node
};

export const infiniteWithCellPadding = () =>
  <Carousel width='450px' cellPadding={ 5 }>
    { imgElements }
  </Carousel>;

export const nonInfiniteWithCellPadding = () =>
  <Carousel infinite={ false } width='450px' cellPadding={ 5 }>
    { imgElements }
  </Carousel>;

export const fadeTransition = () =>
  <Carousel
    width='450px'
    slideHeight='300px'
    transitionDuration={ 1000 }
    draggable={ false }
    transition='fade'
  >
    { imgElements }
  </Carousel>;

export const infiniteWithOnly2Slides = () =>
  <Carousel width='450px' arrows={ false } slideHeight='300px'>
    <img src='http://picsum.photos/325/300' alt='A sample' />
    <img src='http://picsum.photos/350/300' alt='A sample' />
  </Carousel>;

export const infiniteWithOnly1Slide = () =>
  <Carousel
    width='450px'
    infinite={ true }
    arrows={ false }
    dots={ false }
  >
    <img src='http://picsum.photos/325/300' alt='A sample' />
  </Carousel>;

export const autoplayWithBackgroundImages = () =>
  <Carousel
    width='100%'
    slideWidth='100%'
    slideHeight='70vh'
    arrows={ false }
    autoplay={ true }
  >
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
  </Carousel>;

export const backgroundImagesWithFade = () =>
  <Carousel
    width='100%'
    slideWidth='100%'
    slideHeight='70vh'
    transition='fade'
    transitionDuration={ 1000 }
    autoplay={ true }
    arrows={ true }
  >
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
  </Carousel>;

export const customDotsComponent = () =>
  <Carousel
    width='450px'
    cellPadding={ 5 }
    infinite={ false }
    dots={ false }
    arrows={ false }
    autoplay={ true }
    controls={ [{ component: CustomDots, props: { title: 'My Slides' }, position: 'top' }] }
    transitionDuration={ 0 }
  >
    { imgElements }
  </Carousel>;

export const addImages = () => {
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
        controls={ [{ component: CustomDots, props: { title: 'My Slides' }, position: 'top' }] }
      >
        {
          images.map((image, index) => <img key={ index } src={ image } alt='A sample' />)
        }
      </Carousel>
      <button onClick={ addImage }>Add Image</button>
    </Fragment>
  );
};

export const leftAlignedSlides = () =>
  <Carousel width='450px' cellPadding={ 5 } slideAlignment='left'>
    { imgElements }
  </Carousel>;

export const rightAlignedSlides = () =>
  <Carousel width='450px' cellPadding={ 5 } slideAlignment='right'>
    { imgElements }
  </Carousel>;
