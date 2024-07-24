/* eslint-disable */

import React from 'react';
import { getIconColor } from './helper';

const DEFAULT_STYLE = {
  display: 'block',
};

const IconJijin = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M879.0016 918.3744h-153.7024c-14.1312 0-25.6-11.4688-25.6-25.6V352.6656c0-14.1312 11.4688-25.6 25.6-25.6h153.7024c14.1312 0 25.6 11.4688 25.6 25.6v540.1088c0 14.1312-11.4688 25.6-25.6 25.6z m-128.1024-51.2h102.5024V378.2656h-102.5024v488.9088zM588.8512 918.3744H435.1488c-14.1312 0-25.6-11.4688-25.6-25.6V464.4352c0-14.1312 11.4688-25.6 25.6-25.6h153.7024c14.1312 0 25.6 11.4688 25.6 25.6v428.3392c0 14.1312-11.4688 25.6-25.6 25.6z m-128.1024-51.2h102.5024V490.0352H460.7488v377.1392zM298.7008 918.3744H144.9984c-14.1312 0-25.6-11.4688-25.6-25.6v-323.7376c0-14.1312 11.4688-25.6 25.6-25.6h153.7024c14.1312 0 25.6 11.4688 25.6 25.6v323.7376c0 14.1312-11.4176 25.6-25.6 25.6z m-128.1024-51.2h102.5024v-272.5376H170.5984v272.5376z"
        fill={getIconColor(color, 0, '#231815')}
      />
      <path
        d="M144.9984 433.9712a25.58976 25.58976 0 0 1-13.5168-47.36l276.224-170.752c7.2704-4.5056 16.2816-5.0688 24.064-1.536l130.9184 59.392 170.8032-116.8896h-35.584c-14.1312 0-25.6-11.4688-25.6-25.6s11.4688-25.6 25.6-25.6h118.3232c11.2128 0 21.1456 7.3216 24.4736 18.0224 3.328 10.7008-0.7168 22.3744-9.984 28.672L579.7376 324.096c-7.3728 5.0688-16.896 5.888-25.0368 2.2016l-131.584-59.7504-264.6528 163.584c-4.1984 2.6112-8.8576 3.84-13.4656 3.84z"
        fill={getIconColor(color, 1, '#FF3355')}
      />
    </svg>
  );
};

IconJijin.defaultProps = {
  size: 24,
};

export default IconJijin;
