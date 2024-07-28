/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

let IconMPingfen = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M122.88 171.52h778.24c-9.216 0-16.384-7.168-16.384-16.384v713.728c0-9.216 7.168-16.384 16.384-16.384H122.88c9.216 0 16.384 7.168 16.384 16.384V155.648c0 8.192-6.656 15.872-16.384 15.872z m-32.768 684.544c0 26.112 20.992 47.104 47.104 47.104h750.08c26.112 0 47.104-20.992 47.104-47.104V167.936c0-26.112-20.992-47.104-47.104-47.104H137.216c-26.112 0-47.104 20.992-47.104 47.104v688.128z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M743.936 415.744l-131.584-19.456L552.96 276.48c-8.192-16.896-24.576-25.6-40.96-25.6v45.568l69.632 141.312L737.28 460.8l-112.64 111.104 26.112 155.648-138.752-73.216v51.712l117.76 61.952c33.28 17.408 72.192-10.752 66.048-48.128l-22.016-132.608 95.232-94.208c26.624-26.112 11.776-71.68-25.088-77.312zM442.368 437.76L286.72 460.8l112.64 111.104-26.112 155.648 138.752-73.216V296.448z"
        fill={getIconColor(color, 1, '#333333')}
      />
      <Path
        d="M373.248 727.552l26.112-155.648L286.72 460.8l155.136-23.04L512 296.448V250.88c-16.384 0-32.768 8.704-40.96 25.6L412.16 396.288l-131.584 19.456c-37.376 5.632-52.224 51.2-25.088 77.312l95.232 94.208-22.016 132.608c-6.144 37.376 32.768 65.536 66.048 48.128l117.76-61.952v-51.712l-139.264 73.216z"
        fill={getIconColor(color, 2, '#333333')}
      />
    </Svg>
  );
};

IconMPingfen.defaultProps = {
  size: 24,
};

IconMPingfen = React.memo ? React.memo(IconMPingfen) : IconMPingfen;

export default IconMPingfen;
