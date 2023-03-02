import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DefaultUpArrow from '../images/arrow-up.svg';
import DefaultDownArrow from '../images/arrow-down.svg';
import DefaultLeftArrow from '../images/arrow-left.svg';
import DefaultRightArrow from '../images/arrow-right.svg';

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
      direction: PropTypes.oneOf(['left', 'right', 'top', 'bottom']).isRequired,
      arrows: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.shape({
          left: PropTypes.node.isRequired,
          right: PropTypes.node.isRequired,
          className: PropTypes.string
        })
      ]),
      upArrowImage: PropTypes.node,
      downArrowImage: PropTypes.node,
      leftArrowImage: PropTypes.node,
      rightArrowImage: PropTypes.node
    };
  }

  /**
   * @returns {Boolean} True if there is a next slide to transition to, else False.
   */
  hasNext() {
    const { direction, infinite, numSlides, selectedIndex } = this.props;

    return infinite || (['top', 'left'].includes(direction) ? selectedIndex > 0 : selectedIndex < numSlides - 1);
  }

  render() {
    const { prevSlide, nextSlide, direction, arrows, upArrowImage, downArrowImage, leftArrowImage, rightArrowImage } = this.props;
    let arrowComponent = null;
    let buttonClass = 'carousel-arrow-default';

    if (arrows.left) {
      buttonClass = arrows.className ? arrows.className : '';
      arrowComponent = direction === 'left' ? arrows.left : arrows.right;
    }

    return (
      <button
        type='button'
        disabled={ !this.hasNext() }
        onClick={ ['top', 'left'].includes(direction) ? prevSlide : nextSlide }
        className={ `carousel-arrow carousel-${direction}-arrow ${buttonClass}` }>
        { arrowComponent }
        { direction === 'top' && (upArrowImage || <DefaultUpArrow/>)}
        { direction === 'bottom' && (downArrowImage || <DefaultDownArrow/>)}
        { direction === 'left' && (leftArrowImage || <DefaultLeftArrow/>)}
        { direction === 'right' && (rightArrowImage || <DefaultRightArrow/>)}
      </button>
    );
  }
}
