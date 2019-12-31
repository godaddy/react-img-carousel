import React from 'react';

export const IMAGES = [
  'http://picsum.photos/400/300',
  'http://picsum.photos/275/300',
  'http://picsum.photos/450/300',
  'http://picsum.photos/350/300',
  'http://picsum.photos/250/300',
  'http://picsum.photos/375/300',
  'http://picsum.photos/425/300',
  'http://picsum.photos/325/300',
];

export const imgElements = IMAGES.map((image, index) => <img src={ image } key={ index } />);

export const CustomDots = ({ numSlides, selectedIndex, goToSlide, title }) => {
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

