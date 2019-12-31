import React, { Fragment, useState } from 'react';
import Carousel from 'react-img-carousel';
import { IMAGES } from './util/util';
import  { text, boolean, object, number, radios, select } from '@storybook/addon-knobs';

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
    const [reloadKey, setReloadKey] = useState('some-random-key');

    const sizesTabLabel = 'Sizes';
    const controlsTabLabel = 'Controls';
    const transitionTabLabel = 'Transition';

    const sizes = {
        width: text('width', '100%', sizesTabLabel),
        height: text('height', 'auto', sizesTabLabel),
        viewportWidth: text('viewportWidth', '100%', sizesTabLabel),
        viewportHeight: text('viewportHeight', 'auto', sizesTabLabel),
        slideWidth: text('slideWidth', '', sizesTabLabel),
        slideHeight: text('slideHeight', '', sizesTabLabel),
        cellPadding: number('cellPadding', 5, {}, sizesTabLabel),
    };

    const controls = {
        clickToNavigate: boolean('clickToNavigate', true, controlsTabLabel),
        autoplay: boolean('autoplay', false, controlsTabLabel),
        autoplaySpeed: number('autoplaySpeed', 4000, {}, controlsTabLabel),
        draggable: boolean('draggable', true, controlsTabLabel),
        dots: boolean('dots', true, controlsTabLabel),
        arrows: boolean('arrows', true, controlsTabLabel),
        infinite: boolean('infinite', false, controlsTabLabel),
    };
    const transition = {
        transition: radios('transition', {
            slide: 'slide',
            fade: 'fade',
        }, 'slide', transitionTabLabel),
        transitionDuration: number('transitionDuration', 500, {}, transitionTabLabel),
        easing: select('easing', {
            'ease': 'ease',
            'linear': 'linear',
            'ease-in': 'ease-in',
            'ease-out': 'ease-out',
            'ease-in-out': 'ease-in-out',
        }, 'ease-in-out', transitionTabLabel),
    };

    const carouselProps = {
        ...sizes,
        ...controls,
        ...transition,
        initialSlide: number('initialSlide', 0),
        lazyLoad: boolean('lazyLoad', false),
        imagesToPrefetch: number('imagesToPrefetch', 5),
        maxRenderedSlides: number('maxRenderedSlides', 5),
    };

    const content = object('image URLs', IMAGES).map((image, index) => <img src={ image } key={ index } />)
    return (
        <Fragment key={ reloadKey }>
            <Carousel { ...carouselProps }>
                {  content }
            </Carousel>


            <button
                onClick={ () => setReloadKey(`${Math.random()}-${Math.random()}`) }
                style={ BUTTON_STYLE }
            >
                Force Remount Component
            </button>
        </Fragment>
    );
};

export default knobsPlayground;