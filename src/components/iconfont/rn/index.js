/* eslint-disable */

import React from 'react';

import IconInfoCircle from './IconInfoCircle';
import IconPlusSquare from './IconPlusSquare';
import IconMoneycollect from './IconMoneycollect';
import IconAttachment from './IconAttachment';
import IconShare from './IconShare';
import IconWechatFill from './IconWechatFill';
import IconMPingfen from './IconMPingfen';
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
export { default as IconInfoCircle } from './IconInfoCircle';
export { default as IconPlusSquare } from './IconPlusSquare';
export { default as IconMoneycollect } from './IconMoneycollect';
export { default as IconAttachment } from './IconAttachment';
export { default as IconShare } from './IconShare';
export { default as IconWechatFill } from './IconWechatFill';
export { default as IconMPingfen } from './IconMPingfen';
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

let IconFont = ({ name, ...rest }) => {
  switch (name) {
    case 'info-circle':
      return <IconInfoCircle key="1" {...rest} />;
    case 'plus-square':
      return <IconPlusSquare key="2" {...rest} />;
    case 'moneycollect':
      return <IconMoneycollect key="3" {...rest} />;
    case 'attachment':
      return <IconAttachment key="4" {...rest} />;
    case 'share':
      return <IconShare key="5" {...rest} />;
    case 'wechat-fill':
      return <IconWechatFill key="6" {...rest} />;
    case 'm-pingfen':
      return <IconMPingfen key="7" {...rest} />;
    case 'info-circle-fill':
      return <IconInfoCircleFill key="8" {...rest} />;
    case 'file-copy':
      return <IconFileCopy key="9" {...rest} />;
    case 'caret-down':
      return <IconCaretDown key="10" {...rest} />;
    case 'caret-up':
      return <IconCaretUp key="11" {...rest} />;
    case 'bodongfenxi':
      return <IconBodongfenxi key="12" {...rest} />;
    case 'jijin':
      return <IconJijin key="13" {...rest} />;
    case 'jiaoyichaxun':
      return <IconJiaoyichaxun key="14" {...rest} />;
    case 'jifen':
      return <IconJifen key="15" {...rest} />;
    case 'wangdian':
      return <IconWangdian key="16" {...rest} />;
    case 'piaowu':
      return <IconPiaowu key="17" {...rest} />;
    case 'licaichanpin2':
      return <IconLicaichanpin2 key="18" {...rest} />;
    case 'licaichanpin':
      return <IconLicaichanpin key="19" {...rest} />;
    case 'heart-fill':
      return <IconHeartFill key="20" {...rest} />;
    case 'close-circle-fill':
      return <IconCloseCircleFill key="21" {...rest} />;
    case 'search':
      return <IconSearch key="22" {...rest} />;
    case 'right':
      return <IconRight key="23" {...rest} />;
  }

  return null;
};

IconFont = React.memo ? React.memo(IconFont) : IconFont;

export default IconFont;
