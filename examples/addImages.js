import React, { useState, Fragment } from 'react';
import Carousel from 'react-img-carousel';
import { CustomDots, IMAGES } from "./util/util";

const addImages = () => {
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
                    images.map((image, index) => <img key={ index } src={ image }/>)
                }
            </Carousel>
            <button onClick={ addImage }>Add Image</button>
        </Fragment>
    );
};

export default addImages;