/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

let IconCaretDown = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconCaretDown.defaultProps = {
  size: 24,
};

IconCaretDown = React.memo ? React.memo(IconCaretDown) : IconCaretDown;

export default IconCaretDown;
