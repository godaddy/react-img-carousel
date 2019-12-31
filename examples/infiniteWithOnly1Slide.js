import React from 'react';
import Carousel from 'react-img-carousel';

const infiniteWithOnly1Slide = () =>
    <Carousel
        width='450px'
        infinite={ true }
        arrows={ false }
        dots={ false }
    >
        <img src='http://picsum.photos/325/300'/>
    </Carousel>;

export default infiniteWithOnly1Slide;
