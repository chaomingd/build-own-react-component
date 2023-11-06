import Input from './Input'
import { FakeInputProps } from './type';
import { SearchOutlined } from '@ant-design/icons'
import {forwardRef} from "react";
import {InputRef} from "antd";


const Search = forwardRef<HTMLInputElement | null, FakeInputProps>((props: FakeInputProps, ref) => {
  return (
    <Input ref={ref} {...props} prefix={props.prefix ? props.prefix : <SearchOutlined />} />
  )
})

export default Search;
