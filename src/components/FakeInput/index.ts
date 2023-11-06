import Input from './FakeInput'
import Search from './Search';

type _InputType = typeof Input;

type InputType = _InputType & {
  Search: typeof Search
}

const FakeInput = Input as InputType;

FakeInput.Search = Search;

export default FakeInput;
