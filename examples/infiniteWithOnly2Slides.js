import React from 'react';
import Carousel from 'react-img-carousel';

const infiniteWithOnly2Slides = () =>
    <Carousel width='450px' arrows={ false } slideHeight='300px'>
        <img src='http://picsum.photos/325/300'/>
        <img src='http://picsum.photos/350/300'/>
    </Carousel>;

export default infiniteWithOnly2Slides;
