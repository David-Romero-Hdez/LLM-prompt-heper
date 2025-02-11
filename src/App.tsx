import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/MainScreen';
import MyPrompts from './pages/MyPrompts';
import Help from './pages/Help';
import ItemFormScreen from './pages/ItemFormScreen';

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<ItemFormScreen />} />
        <Route path="/edit/:id" element={<ItemFormScreen />} />
        <Route path="/prompts" element={<MyPrompts />} />
        <Route path="/help" element={<Help />} />
      </Routes>
  );
}

export default App;
