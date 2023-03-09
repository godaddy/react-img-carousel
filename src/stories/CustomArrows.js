import React from 'react';
import PropTypes from 'prop-types';

const CustomArrows = ({ nextSlide, prevSlide, overrideArrowStyle = {}, infinite, numSlides, selectedIndex, topArrowImage, bottomArrowImage, arrowDivStyle }) => {
    const hasNext = (direction) => {
        return infinite || (['top', 'left'].includes(direction) ? selectedIndex > 0 : selectedIndex < numSlides - 1);
    }

    const hasNextBottom = hasNext('bottom');
    const hasNextTop = hasNext('top');

    return (
        <div style={ arrowDivStyle } className='custom-arrows-div'>
            <button className='carousel-custom-arrow' disabled={ !hasNextTop } onClick={ hasNextTop ? prevSlide : nextSlide } style={{ ...overrideArrowStyle, ...{ opacity: !hasNextTop ? 0.5 : 1 }, ...{ cursor: !hasNextTop ? 'not-allowed' : 'pointer' } }}>
                {topArrowImage}
            </button>
            <button className='carousel-custom-arrow' disabled={ !hasNextBottom } onClick={ hasNextBottom ? nextSlide : prevSlide } style={{ ...overrideArrowStyle, ...{ opacity: !hasNextBottom ? 0.5 : 1 }, ...{ cursor: !hasNextBottom ? 'not-allowed' : 'pointer' } }}>
                {bottomArrowImage}
            </button>
        </div>
    );
};

CustomArrows.propTypes = {
    prevSlide: PropTypes.func,
    nextSlide: PropTypes.func,
    visible: PropTypes.bool,
    overrideArrowStyle: PropTypes.object,
    triggerNextSlide: PropTypes.number,
    infinite: PropTypes.bool,
    numSlides: PropTypes.number,
    selectedIndex: PropTypes.number,
    topArrowImage: PropTypes.node,
    bottomArrowImage: PropTypes.node,
    arrowDivStyle: PropTypes.object
};

export default CustomArrows;
