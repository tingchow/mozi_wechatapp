import IconFont from '../iconfont';
import { Input } from '@tarojs/components'
import Taro from '@tarojs/taro';
import { useEffect, useState, useRef } from 'react';
import './index.less';


export const SearchInput = (props) => {

  const { value = '' } = props;
  // const newValue = value? value: '';
  const [ closeColor, setCloseColor ] = useState('#b2b2b2');
  const [inputValue, setInputValue] = useState(value);
  // const inputNode = useRef(null);

  // useEffect(() => {
  //   console.log();
  // }, []);
  
  const jump2Search = (e) => {
    const { value } = e.detail;
    const { reloadFun } = props;

    reloadFun(value);
    
    // if (reloadFun) {
    //   reloadFun(value);
    // } else {
    //   Taro.navigateTo({
    //     url: `/pages/search/index?value=${value}`,
    //   });
    // }
  }

  const onChange = (e) => {
    if (e.detail.value) setCloseColor('#000');
    setInputValue(e.detail.value);
    // console.log(e);
  };

  const clear = () => {
    setInputValue('');
    // inputNode.current.props.value = '';
  };

  return (
    <>
      <div className='searchBox'>
        <div className='searchIcon'>
          <IconFont name='search' size={30} />
        </div>
        <Input className='searchInput' type='text' placeholder='请搜索币种' value={inputValue} onInput={onChange} confirmType='search' onConfirm={(e) => {jump2Search(e)}} focus/>
        <div className='searchCancel' onClick={clear}>
          <IconFont name='close-circle-fill' color={closeColor} size={30} />
        </div>
      </div>
    </>
  );
};