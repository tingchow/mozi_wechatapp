/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

let IconMoneycollect = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M911.5 700.7c-1.5-4.2-6.1-6.3-10.3-4.8L840 718.2V180c0-37.6-30.4-68-68-68H252c-37.6 0-68 30.4-68 68v538.2l-61.3-22.3c-0.9-0.3-1.8-0.5-2.7-0.5-4.4 0-8 3.6-8 8V763c0 3.3 2.1 6.3 5.3 7.5L501 910.1c7.1 2.6 14.8 2.6 21.9 0l383.8-139.5c3.2-1.2 5.3-4.2 5.3-7.5v-59.6c0-1-0.2-1.9-0.5-2.8zM512 837.5l-256-93.1V184h512v560.4l-256 93.1z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M660.6 312h-54.5c-3 0-5.8 1.7-7.1 4.4l-84.7 168.8H511l-84.7-168.8c-1.4-2.7-4.1-4.4-7.1-4.4h-55.7c-1.3 0-2.6 0.3-3.8 1-3.9 2.1-5.3 7-3.2 10.8l103.9 191.6h-57c-4.4 0-8 3.6-8 8v27.1c0 4.4 3.6 8 8 8h76v39h-76c-4.4 0-8 3.6-8 8v27.1c0 4.4 3.6 8 8 8h76V704c0 4.4 3.6 8 8 8h49.9c4.4 0 8-3.6 8-8v-63.5h76.3c4.4 0 8-3.6 8-8v-27.1c0-4.4-3.6-8-8-8h-76.3v-39h76.3c4.4 0 8-3.6 8-8v-27.1c0-4.4-3.6-8-8-8H564l103.7-191.6c0.6-1.2 1-2.5 1-3.8-0.1-4.3-3.7-7.9-8.1-7.9z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconMoneycollect.defaultProps = {
  size: 24,
};

IconMoneycollect = React.memo ? React.memo(IconMoneycollect) : IconMoneycollect;

export default IconMoneycollect;
