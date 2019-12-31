import React, { Fragment, useState } from 'react';
import Carousel from 'react-img-carousel';
import { IMAGES , imgElements} from "./util/util";
import Knobs, {text, boolean, object, number, radios, select } from "@storybook/addon-knobs";

const BUTTON_STYLE = {
    padding: '5px 10px',
    marginTop: 20,
    marginLeft: 20,

    borderRadius: 5,
    backgroundColor: 'red',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none',
};


const knobsPlayground = () => {

    const [reloadKey, setReloadKey] = useState('random-key');


    const carouselProps = {
        initialSlide: number('initialSlide', 0),
        width: text('width', '100%'),
        height: text('width', 'auto'),

        viewportWidth: text('viewportWidth', '100%'),
        viewportHeight: text('viewportHeight', 'auto'),
        dots: boolean('dots', false),
        arrows: boolean('arrows', false),
        infinite: boolean('infinite', false),
        lazyLoad: boolean('lazyLoad', false),
        imagesToPrefetch: number('imagesToPrefetch', 5),
        maxRenderedSlides: number('maxRenderedSlides', 5),
        cellPadding: number('cellPadding', 5),
        slideWidth: text('slideWidth', ''),
        slideHeight: text('slideHeight', ''),

        transition: radios('transition', {
            slide: 'slide',
            fade: 'fade',
        }, 'slide'),
        transitionDuration: number('transitionDuration', 500),
        easing: select('easing', {
            'ease': 'ease',
            'linear': 'linear',
            'ease-in': 'ease-in',
            'ease-out': 'ease-out',
            'ease-in-out': 'ease-in-out',
        }, 'ease-in-out'),
        clickToNavigate: boolean('clickToNavigate', true),
        autoplay: boolean('autoplay', false),
        autoplaySpeed: number('autoplaySpeed', 4000),
        draggable: boolean('draggable', true),


    };

    const content = object('image URLs', IMAGES).map((image, index) => <img src={ image } key={ index } />)
    return (
        <Fragment key={reloadKey}>
            <Carousel { ...carouselProps }>
                {  content }
            </Carousel>


            <button
                onClick={() => setReloadKey(`${Math.random()}-${Math.random()}`)}
                style={BUTTON_STYLE}
            >
                Force Remount Component
            </button>
        </Fragment>
    );
};

export default knobsPlayground;
