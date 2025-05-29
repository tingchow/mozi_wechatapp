/* eslint-disable */

import React from 'react';
import { getIconColor } from './helper';

const DEFAULT_STYLE = {
  display: 'block',
};

const IconShequ = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 85.333333c235.637333 0 426.666667 191.029333 426.666667 426.666667S747.637333 938.666667 512 938.666667 85.333333 747.637333 85.333333 512 276.362667 85.333333 512 85.333333z m143.381333 497.781334A159.978667 159.978667 0 0 1 512 672a159.978667 159.978667 0 0 1-143.36-88.853333 32 32 0 1 0-57.301333 28.490666A223.968 223.968 0 0 0 512 736a223.968 223.968 0 0 0 200.682667-124.394667 32 32 0 0 0-57.301334-28.490666z"
        fill={getIconColor(color, 0, '#000000')}
      />
    </svg>
  );
};

IconShequ.defaultProps = {
  size: 24,
};

export default IconShequ;
