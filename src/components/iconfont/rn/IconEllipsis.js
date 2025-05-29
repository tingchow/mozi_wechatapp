/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

let IconEllipsis = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M232 511m-56 0a56 56 0 1 0 112 0 56 56 0 1 0-112 0Z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M512 511m-56 0a56 56 0 1 0 112 0 56 56 0 1 0-112 0Z"
        fill={getIconColor(color, 1, '#333333')}
      />
      <Path
        d="M792 511m-56 0a56 56 0 1 0 112 0 56 56 0 1 0-112 0Z"
        fill={getIconColor(color, 2, '#333333')}
      />
    </Svg>
  );
};

IconEllipsis.defaultProps = {
  size: 24,
};

IconEllipsis = React.memo ? React.memo(IconEllipsis) : IconEllipsis;

export default IconEllipsis;
