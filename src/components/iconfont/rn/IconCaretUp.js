/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

let IconCaretUp = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M858.9 689L530.5 308.2c-9.4-10.9-27.5-10.9-37 0L165.1 689c-12.2 14.2-1.2 35 18.5 35h656.8c19.7 0 30.7-20.8 18.5-35z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconCaretUp.defaultProps = {
  size: 24,
};

IconCaretUp = React.memo ? React.memo(IconCaretUp) : IconCaretUp;

export default IconCaretUp;
