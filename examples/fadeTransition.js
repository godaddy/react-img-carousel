import React from 'react';
import Carousel from 'react-img-carousel';
import { imgElements } from "./util/util";

const fadeTransition = () =>
    <Carousel
        width='450px'
        slideHeight='300px'
        transitionDuration={ 1000 }
        draggable={ false }
        transition='fade'
    >
        { imgElements }
    </Carousel>;

export default fadeTransition;
