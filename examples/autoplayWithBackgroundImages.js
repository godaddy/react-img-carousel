import React from 'react';
import Carousel from 'react-img-carousel';

const autoplayWithBackgroundImages = () =>
    <Carousel
        width='100%'
        slideWidth='100%'
        slideHeight='70vh'
        arrows={ false }
        autoplay={ true }
    >
        <div style={{ backgroundImage: 'url(http://picsum.photos/600/300)', backgroundSize: 'cover', height: '100%', width: '100%' }}/>
        <div style={{ backgroundImage: 'url(http://picsum.photos/650/300)', backgroundSize: 'cover', height: '100%', width: '100%' }}/>
        <div style={{ backgroundImage: 'url(http://picsum.photos/675/300)', backgroundSize: 'cover', height: '100%', width: '100%' }}/>
        <div style={{ backgroundImage: 'url(http://picsum.photos/700/300)', backgroundSize: 'cover', height: '100%', width: '100%' }}/>
    </Carousel>;

export default autoplayWithBackgroundImages;
