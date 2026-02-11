import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Renders a dots navigation component for the carousel, with clickable dots that transition to the corresponding slide.
 *
 * @extends React.Component
 */
export default class Dots extends Component {

  static get propTypes() {
    return {
      numSlides: PropTypes.number.isRequired,
      selectedIndex: PropTypes.number.isRequired,
      goToSlide: PropTypes.func.isRequired
    };
  }

  render() {
    const { numSlides, selectedIndex, goToSlide } = this.props;
    const dots = [];

    for (let index = 0; index < numSlides; index++) {
      const buttonClass = classnames('carousel-dot', {
        selected: index === selectedIndex
      });

      dots.push(
        <li key={ `dot-${index}` }>
          <button className={ buttonClass } onClick={ goToSlide.bind(null, index) }>•</button>
        </li>
      );
    }

    return (
      <ul className='carousel-dots'>
        { dots }
      </ul>
    );
  }
}
