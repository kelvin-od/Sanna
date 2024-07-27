// App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppContext from './Components/AppContext/AppContext';
import Pages from './Components/Pages/Pages';

import { ConnectionProvider } from '../src/utility/ConnectionContext';
import { NotificationProvider } from '../src/utility/NotificationContext'

import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <AppContext>
          <ConnectionProvider>
            <NotificationProvider>
              <Pages />
            </NotificationProvider>
          </ConnectionProvider>
        </AppContext>
      </Router>
    </div>
  );
}

export default App;


