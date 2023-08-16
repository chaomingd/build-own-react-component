import './App.css';
import Form from './components/Form';
import { Input } from 'antd';

function App() {
  console.log('app render')
  return (
    <div className="App">
      <Form
        onValuesChange={(values) => {
          // console.log(values);
        }}
      >
        <Form.Item
          labelStyles={{
            width: 100,
          }}
          label="用户名"
          field={['userInfo', 'username']}
          rules={[
            {
              required: true,
              message: '请输入用户名'
            },
            {
              type: 'number',
              message: '只能是数字'
            }
          ]}
        >
          <Input />
        </Form.Item>
        {/* <Form.Item
          labelStyles={{
            width: 100,
          }}
          label="密码"
          field={['userInfo', 'password']}
          rules={[
            {
              required: true,
              message: '请输入密码'
            }
          ]}
        >
          <Input />
        </Form.Item> */}
      </Form>
    </div>
  );
}

export default App;
