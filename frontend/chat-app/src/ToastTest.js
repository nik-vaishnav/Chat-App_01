// ToastTest.js
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ToastTest() {
  return (
    <div>
      <h1>Hello Toast</h1>
      <button onClick={() => toast('Test toast!')}>Show Toast</button>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default ToastTest;