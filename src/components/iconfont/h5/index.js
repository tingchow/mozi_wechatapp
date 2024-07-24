/* eslint-disable */

import React from 'react';
import IconInfoCircleFill from './IconInfoCircleFill';
import IconFileCopy from './IconFileCopy';
import IconCaretDown from './IconCaretDown';
import IconCaretUp from './IconCaretUp';
import IconBodongfenxi from './IconBodongfenxi';
import IconJijin from './IconJijin';
import IconJiaoyichaxun from './IconJiaoyichaxun';
import IconJifen from './IconJifen';
import IconWangdian from './IconWangdian';
import IconPiaowu from './IconPiaowu';
import IconLicaichanpin2 from './IconLicaichanpin2';
import IconLicaichanpin from './IconLicaichanpin';
import IconHeartFill from './IconHeartFill';
import IconCloseCircleFill from './IconCloseCircleFill';
import IconSearch from './IconSearch';
import IconRight from './IconRight';
export { default as IconInfoCircleFill } from './IconInfoCircleFill';
export { default as IconFileCopy } from './IconFileCopy';
export { default as IconCaretDown } from './IconCaretDown';
export { default as IconCaretUp } from './IconCaretUp';
export { default as IconBodongfenxi } from './IconBodongfenxi';
export { default as IconJijin } from './IconJijin';
export { default as IconJiaoyichaxun } from './IconJiaoyichaxun';
export { default as IconJifen } from './IconJifen';
export { default as IconWangdian } from './IconWangdian';
export { default as IconPiaowu } from './IconPiaowu';
export { default as IconLicaichanpin2 } from './IconLicaichanpin2';
export { default as IconLicaichanpin } from './IconLicaichanpin';
export { default as IconHeartFill } from './IconHeartFill';
export { default as IconCloseCircleFill } from './IconCloseCircleFill';
export { default as IconSearch } from './IconSearch';
export { default as IconRight } from './IconRight';

const IconFont = ({ name, ...rest }) => {
  switch (name) {
    case 'info-circle-fill':
      return <IconInfoCircleFill {...rest} />;
    case 'file-copy':
      return <IconFileCopy {...rest} />;
    case 'caret-down':
      return <IconCaretDown {...rest} />;
    case 'caret-up':
      return <IconCaretUp {...rest} />;
    case 'bodongfenxi':
      return <IconBodongfenxi {...rest} />;
    case 'jijin':
      return <IconJijin {...rest} />;
    case 'jiaoyichaxun':
      return <IconJiaoyichaxun {...rest} />;
    case 'jifen':
      return <IconJifen {...rest} />;
    case 'wangdian':
      return <IconWangdian {...rest} />;
    case 'piaowu':
      return <IconPiaowu {...rest} />;
    case 'licaichanpin2':
      return <IconLicaichanpin2 {...rest} />;
    case 'licaichanpin':
      return <IconLicaichanpin {...rest} />;
    case 'heart-fill':
      return <IconHeartFill {...rest} />;
    case 'close-circle-fill':
      return <IconCloseCircleFill {...rest} />;
    case 'search':
      return <IconSearch {...rest} />;
    case 'right':
      return <IconRight {...rest} />;

  }

  return null;
};

export default IconFont;
