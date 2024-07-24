/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

let IconPiaowu = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M180.0192 924.7232a25.59488 25.59488 0 0 1-25.6-25.6V201.6768c0-54.8352 43.0592-99.4816 96-99.4816h519.424c52.9408 0 96 44.5952 96 99.4816V899.072c0 10.1888-6.0416 19.4048-15.36 23.4496s-20.1728 2.2016-27.648-4.7104l-100.5568-93.2864-96 92.928a25.58976 25.58976 0 0 1-37.12-1.6384l-76.288-87.9616-79.5648 88.32c-4.5568 5.0688-10.9568 8.0896-17.7664 8.448-6.8608 0.3072-13.4656-2.048-18.4832-6.656l-102.4512-93.5936-96.6656 93.1328c-5.0688 4.7104-11.4688 7.2192-17.92 7.2192z m113.9712-161.024c6.1952 0 12.3904 2.2528 17.2544 6.7072l101.1712 92.416 81.7152-90.6752c4.9152-5.4272 12.0832-8.3456 19.2512-8.448a25.6 25.6 0 0 1 19.0976 8.8064l77.568 89.3952 94.0032-90.9824a25.58464 25.58464 0 0 1 35.2256-0.3584l75.3152 69.888V201.6768c0-26.624-20.0704-48.2816-44.8-48.2816H250.368c-24.6784 0-44.8 21.6576-44.8 48.2816v637.184l70.6048-68.0448c4.9664-4.7104 11.3664-7.1168 17.8176-7.1168z"
        fill={getIconColor(color, 0, '#231815')}
      />
      <Path
        d="M655.5136 512.768H535.04V433.7152h120.5248c14.1312 0 25.6-11.4688 25.6-25.6s-11.4688-25.6-25.6-25.6h-98.4064l76.544-70.8608a25.58976 25.58976 0 0 0 1.3824-36.1984 25.58976 25.58976 0 0 0-36.1984-1.3824L508.5696 357.6832l-88.4224-83.456c-10.2912-9.728-26.4704-9.216-36.1984 1.024-9.728 10.2912-9.216 26.4704 1.024 36.1984l75.264 71.0656H363.3152c-14.1312 0-25.6 11.4688-25.6 25.6s11.4688 25.6 25.6 25.6H483.84v79.0528H363.3152c-14.1312 0-25.6 11.4688-25.6 25.6s11.4688 25.6 25.6 25.6H483.84v83.2c0 14.1312 11.4688 25.6 25.6 25.6s25.6-11.4688 25.6-25.6v-83.2h120.5248c14.1312 0 25.6-11.4688 25.6-25.6s-11.4688-25.6-25.6512-25.6z"
        fill={getIconColor(color, 1, '#FF3355')}
      />
    </Svg>
  );
};

IconPiaowu.defaultProps = {
  size: 24,
};

IconPiaowu = React.memo ? React.memo(IconPiaowu) : IconPiaowu;

export default IconPiaowu;
