import React from 'react';
import PropTypes from 'prop-types';

const CustomArrow = ({ nextSlide, prevSlide, overrideArrowStyle = {}, direction, infinite, numSlides, selectedIndex, customImage }) => {
    const isTopOrLeft = ['top', 'left'].includes(direction);
    const hasNext = () => {
        return infinite || (isTopOrLeft ? selectedIndex > 0 : selectedIndex < numSlides - 1);
    }

    const hasNextSlide = hasNext();
    return (
        <button disabled={ !hasNextSlide } onClick={ isTopOrLeft ? prevSlide : nextSlide } style={{ ...overrideArrowStyle, opacity: !hasNextSlide ? 0.5 : 1 }}>
            {customImage}
        </button>
    );
};

CustomArrow.propTypes = {
    prevSlide: PropTypes.func,
    nextSlide: PropTypes.func,
    visible: PropTypes.bool,
    overrideArrowStyle: PropTypes.object,
    triggerNextSlide: PropTypes.number,
    direction: PropTypes.string,
    infinite: PropTypes.bool,
    numSlides: PropTypes.number,
    selectedIndex: PropTypes.number,
    customImage: PropTypes.node
};

export default CustomArrow;
