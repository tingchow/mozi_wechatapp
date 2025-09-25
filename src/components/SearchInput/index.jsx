import IconFont from '../iconfont';
import { Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro';
import { useEffect, useState, useRef } from 'react';
const searchIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community/search.png';
import './index.less';


export const SearchInput = (props) => {

  const { value = '' } = props;
  // const newValue = value? value: '';
  const [ closeColor, setCloseColor ] = useState('#b2b2b2');
  const [inputValue, setInputValue] = useState(value);
  const inputValueRef = useRef(value);
  // const inputNode = useRef(null);

  // useEffect(() => {
  //   console.log();
  // }, []);
  
  const jump2Search = (e) => {
    const raw = e?.detail?.value ?? inputValueRef.current;
    const value = (raw || '').trim();
    const { reloadFun } = props;

    if (value) reloadFun(value);
    
    // if (reloadFun) {
    //   reloadFun(value);
    // } else {
    //   Taro.navigateTo({
    //     url: `/pages/search/index?value=${value}`,
    //   });
    // }
  }

  const onChange = (e) => {
    if (e.detail.value) setCloseColor('#b2b2b2');
    setInputValue(e.detail.value);
    inputValueRef.current = e.detail.value;
    // console.log(e);
  };

  const clear = () => {
    setInputValue('');
    setCloseColor('#b2b2b2');
    // inputNode.current.props.value = '';
  };

  return (
    <>
      <div className='searchBox'>
        <Input className='searchInput' type='text' placeholder={props?.placeholder || '请搜索币种'} value={inputValue} onInput={onChange} confirmType='search' onConfirm={(e) => {jump2Search(e)}} />
        <div className='searchCancel' onClick={clear}>
          <IconFont name='close-circle-fill' color={closeColor} size={30} />
        </div>
        <div className='searchButton' onClick={() => jump2Search()}>
          <Image src={searchIcon} className='searchIconImg' />
          <span className='searchText'>搜索</span>
        </div>
      </div>
    </>
  );
};