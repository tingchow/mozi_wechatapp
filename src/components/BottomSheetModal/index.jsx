import { View, RootPortal } from '@tarojs/components';
import './index.less';

export default function BottomSheetModal({
  open = false,
  onClose,
  header,
  children,
  sheetClassName = '',
  sheetInnerClassName = '',
  bodyClassName = '',
  maxHeight = '85vh',
  height,
  mode = '',
}) {
  if (!open) return null;

  const panelClass = [
    'bottom-sheet-panel',
    sheetClassName,
    mode === 'config' ? 'bottom-sheet-panel--config' : '',
    mode === 'oneClick' ? 'bottom-sheet-panel--oneclick' : '',
  ].filter(Boolean).join(' ');

  const panelStyle = {
    ...(maxHeight ? { maxHeight } : {}),
    ...(height ? { height } : {}),
  };

  const modal = (
    <View className='bottom-sheet-root' catchMove>
      <View className='bottom-sheet-mask' onClick={onClose} />
      <View className={panelClass} style={panelStyle}>
        <View className={`bottom-sheet-inner ${sheetInnerClassName}`}>
          {header}
          <View className={`bottom-sheet-body ${bodyClassName}`}>
            {children}
          </View>
        </View>
      </View>
    </View>
  );

  return <RootPortal>{modal}</RootPortal>;
}
