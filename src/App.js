// App.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import AppContext from './Components/AppContext/AppContext';
import Pages from './Components/Pages/Pages';

import './App.css';

// Replace 'your-publishable-key-here' with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51PZd0vJIpuZzEOXAgFWUKMSHgwdzAshclJ5lvrMBFSDc9Vz8d22JMmHxooR9GYo0JJZlSKbhLK9ggo1BtzTp6OV500sHrWgIgO');

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppContext>
          <Elements stripe={stripePromise}>
            <Pages />
          </Elements>
        </AppContext>
      </BrowserRouter>
    </div>
  );
}

export default App;
