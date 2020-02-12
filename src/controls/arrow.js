import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Renders an arrow component used to transition from right-to-left or left-to-right through the carousel slides.
 */
export default class Arrow extends Component {

  static get propTypes() {
    return {
      numSlides: PropTypes.number.isRequired,
      selectedIndex: PropTypes.number.isRequired,
      infinite: PropTypes.bool.isRequired,
      prevSlide: PropTypes.func.isRequired,
      nextSlide: PropTypes.func.isRequired,
      direction: PropTypes.oneOf(['left', 'right']).isRequired,
      customArrow: PropTypes.shape({
        left: PropTypes.node.isRequired,
        right: PropTypes.node.isRequired,
        className: PropTypes.string
      })
    };
  }

  /**
   * @returns {Boolean} True if there is a next slide to transition to, else False.
   */
  hasNext() {
    const { direction, infinite, numSlides, selectedIndex } = this.props;

    return infinite || (direction === 'left' ? selectedIndex > 0 : selectedIndex < numSlides - 1);
  }

  render() {
    const { prevSlide, nextSlide, direction, customArrow } = this.props;
    let arrowComponent = null;
    let buttonClass = 'carousel-arrow-default';

    if (customArrow) {
      buttonClass = customArrow.className ? customArrow.className : '';
      arrowComponent = direction === 'left' ? customArrow.left : customArrow.right;
    }

    return (
      <button
        disabled={ !this.hasNext() }
        onClick={ direction === 'left' ? prevSlide : nextSlide }
        className={ `carousel-arrow carousel-${direction}-arrow ${buttonClass}` }>
        { arrowComponent }
      </button>
    );
  }
}
