/* eslint-disable */

import React from 'react';
import { getIconColor } from './helper';

const DEFAULT_STYLE = {
  display: 'block',
};

const IconBodongfenxi = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M790.8864 916.4288H230.0416c-70.6048 0-128-57.3952-128-128V227.584c0-70.6048 57.3952-128 128-128h560.8448c70.6048 0 128 57.3952 128 128v560.8448c0 70.5536-57.3952 128-128 128zM230.0416 150.784c-42.3424 0-76.8 34.4576-76.8 76.8v560.8448c0 42.3424 34.4576 76.8 76.8 76.8h560.8448c42.3424 0 76.8-34.4576 76.8-76.8V227.584c0-42.3424-34.4576-76.8-76.8-76.8H230.0416z"
        fill={getIconColor(color, 0, '#231815')}
      />
      <path
        d="M505.3952 730.368c-14.1312 0-25.6-11.4688-25.6-25.6V311.2448c0-14.1312 11.4688-25.6 25.6-25.6s25.6 11.4688 25.6 25.6v393.5232c0 14.1312-11.4688 25.6-25.6 25.6zM309.9648 730.368c-14.1312 0-25.6-11.4688-25.6-25.6v-161.6896c0-14.1312 11.4688-25.6 25.6-25.6s25.6 11.4688 25.6 25.6v161.6896c0 14.1312-11.4688 25.6-25.6 25.6zM700.8256 730.368c-14.1312 0-25.6-11.4688-25.6-25.6v-308.736c0-14.1312 11.4688-25.6 25.6-25.6s25.6 11.4688 25.6 25.6v308.6848c0 14.1824-11.4688 25.6512-25.6 25.6512z"
        fill={getIconColor(color, 1, '#FF3355')}
      />
    </svg>
  );
};

IconBodongfenxi.defaultProps = {
  size: 24,
};

export default IconBodongfenxi;
