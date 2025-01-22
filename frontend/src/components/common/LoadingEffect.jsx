import React from 'react';
import {DotLoader} from 'react-spinners';

const LoadingEffect = ({color = "#ffff", size = 20, loading = true}) => {
    return (<DotLoader color={color} loading={loading} size={size}/>)
}

export default LoadingEffect;
