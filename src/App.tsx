import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './home/Home';
import About from './about/About';
import { useAuth } from './lib/auth-context';

const App: React.FC = () => {
  console.log('App component rendered');
  const { testAuthenticate } = useAuth();
  console.log('testAuthenticate:', testAuthenticate);
  testAuthenticate(); // Call testAuthenticate to simulate user authentication

  return (
    <Router>
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
};

export default App;