import { useEffect, useRef, useState } from 'react';
import Portal from './components/Portal';
import { getScrollBarSize } from './utils/scrollBar';
import { createFakeInputStdIn } from './components/FakeInput/createFakeInputStdIn';
import FakeInput from './components/FakeInput';

const scrollbarSize = getScrollBarSize();

console.log(scrollbarSize);

const App: React.FC = () => {
  const [value, setValue] = useState('');
  useEffect(() => {
    const { focus, destroy } = createFakeInputStdIn({
      onChange: (value) => {
        setValue(value);
      },
    });

    focus();

    return () => {
      destroy();
    };
  }, []);
  return (
    <div>
      <FakeInput.Search
        value={value}
        round
        onChange={(val) => {
          setValue(val);
        }}
      />
      <input />
    </div>
  );
};

export default App;
