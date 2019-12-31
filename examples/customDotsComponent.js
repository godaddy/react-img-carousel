import React from 'react';
import Carousel from 'react-img-carousel';
import { CustomDots, imgElements } from "./util/util";

const customDotsComponent = () =>
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

export default customDotsComponent;
