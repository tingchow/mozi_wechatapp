import { useEffect, useMemo, useState } from 'react';
import { View, Text, Input, Image, ScrollView, RootPortal } from '@tarojs/components';
import { allCountries } from 'country-telephone-data';
import './index.less';

const LEFT_ARROW = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/left-arrow.png';

function buildCountries() {
  let zhDisplayNames = null;
  try {
    if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
      zhDisplayNames = new Intl.DisplayNames(['zh-CN'], { type: 'region' });
    }
  } catch {
    /* ignore */
  }

  return allCountries
    .map((c) => {
      if (Array.isArray(c)) {
        const nameEn = c[0];
        const iso2 = c[1];
        const dialCode = c[2];
        const nameZh = zhDisplayNames && iso2
          ? (zhDisplayNames.of(String(iso2).toUpperCase()) || '')
          : '';
        return {
          iso2,
          nameEn,
          nameZh,
          name: nameZh || nameEn,
          dialCode: dialCode ? `+${dialCode}` : '',
        };
      }

      const nameEn = c?.name || '';
      const iso2 = c?.iso2 || c?.iso || '';
      const nameZh = zhDisplayNames && iso2
        ? (zhDisplayNames.of(String(iso2).toUpperCase()) || '')
        : '';

      return {
        iso2,
        nameEn,
        nameZh,
        name: nameZh || nameEn,
        dialCode: c?.dialCode ? `+${c.dialCode}` : '',
      };
    })
    .filter((item) => item.name && item.dialCode)
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
}

const COUNTRIES = buildCountries();

export default function CountryPickerOverlay({
  open = false,
  onClose,
  onSelect,
  title = '选择国家/地区',
  searchPlaceholder = '搜索国家/区号',
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const filteredCountries = useMemo(() => {
    const qRaw = query.trim();
    if (!qRaw) return COUNTRIES;
    const qLower = qRaw.toLowerCase();
    return COUNTRIES.filter((c) => {
      const nameEnLower = (c.nameEn || '').toLowerCase();
      const displayLower = (c.name || '').toLowerCase();
      const matchEn = nameEnLower.includes(qLower) || displayLower.includes(qLower);
      const matchZh = (c.nameZh || '').includes(qRaw) || (c.name || '').includes(qRaw);
      const matchCode = (c.dialCode || '').includes(qRaw);
      return matchEn || matchZh || matchCode;
    });
  }, [query]);

  if (!open) return null;

  const overlay = (
    <View className='country-picker-overlay' catchMove>
      <View className='country-picker-mask' onClick={() => onClose?.()} />
      <View className='country-picker-panel'>
        <View className='country-picker-header'>
          <View className='country-picker-back' onClick={() => onClose?.()}>
            <Image className='country-picker-back-icon' src={LEFT_ARROW} mode='aspectFit' />
          </View>
          <Text className='country-picker-title'>{title}</Text>
          <View className='country-picker-header-right' />
        </View>

        <View className='country-picker-search-wrap'>
          <Input
            className='country-picker-search'
            value={query}
            placeholder={searchPlaceholder}
            onInput={(e) => setQuery(e.detail.value)}
          />
        </View>

        <View className='country-picker-body'>
          <ScrollView scrollY enhanced showScrollbar={false} className='country-picker-list'>
            {filteredCountries.map((c) => (
              <View
                key={`${c.iso2}-${c.dialCode}`}
                className='country-picker-item'
                onClick={() => {
                  onSelect?.(c);
                  onClose?.();
                }}
              >
                <Text className='country-picker-item-name'>{c.name}</Text>
                <Text className='country-picker-item-code'>{c.dialCode}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );

  return <RootPortal>{overlay}</RootPortal>;
}
