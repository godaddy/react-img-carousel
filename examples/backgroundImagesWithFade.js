import React from 'react';
import Carousel from 'react-img-carousel';

const backgroundImagesWithFade = () =>
    <Carousel
        width='100%'
        slideWidth='100%'
        slideHeight='70vh'
        transition='fade'
        transitionDuration={ 1000 }
        autoplay={ true }
        arrows={ true }
    >
        <div style={{ backgroundImage: 'url(http://picsum.photos/600/300)', backgroundSize: 'cover', height: '100%', width: '100%' }}/>
        <div style={{ backgroundImage: 'url(http://picsum.photos/650/300)', backgroundSize: 'cover', height: '100%', width: '100%' }}/>
        <div style={{ backgroundImage: 'url(http://picsum.photos/675/300)', backgroundSize: 'cover', height: '100%', width: '100%' }}/>
        <div style={{ backgroundImage: 'url(http://picsum.photos/700/300)', backgroundSize: 'cover', height: '100%', width: '100%' }}/>
        <div style={{ backgroundImage: 'url(http://picsum.photos/750/300)', backgroundSize: 'cover', height: '100%', width: '100%' }}/>
        <div style={{ backgroundImage: 'url(http://picsum.photos/725/300)', backgroundSize: 'cover', height: '100%', width: '100%' }}/>
        <div style={{ backgroundImage: 'url(http://picsum.photos/625/300)', backgroundSize: 'cover', height: '100%', width: '100%' }}/>
    </Carousel>;

export default backgroundImagesWithFade;
