/* eslint-disable */

import React from 'react';
import { getIconColor } from './helper';

const DEFAULT_STYLE = {
  display: 'block',
};

const IconEllipsis = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M232 511m-56 0a56 56 0 1 0 112 0 56 56 0 1 0-112 0Z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <path
        d="M512 511m-56 0a56 56 0 1 0 112 0 56 56 0 1 0-112 0Z"
        fill={getIconColor(color, 1, '#333333')}
      />
      <path
        d="M792 511m-56 0a56 56 0 1 0 112 0 56 56 0 1 0-112 0Z"
        fill={getIconColor(color, 2, '#333333')}
      />
    </svg>
  );
};

IconEllipsis.defaultProps = {
  size: 24,
};

export default IconEllipsis;
