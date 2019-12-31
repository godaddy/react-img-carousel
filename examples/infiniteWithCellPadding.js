import React from 'react';
import Carousel from 'react-img-carousel';
import { imgElements } from "./util/util";

const infiniteWithCellPadding = () =>
    <Carousel width='450px' cellPadding={ 5 }>
        { imgElements }
    </Carousel>;

export default infiniteWithCellPadding;