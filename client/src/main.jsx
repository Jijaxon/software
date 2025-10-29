import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import {Provider} from "react-redux";
import store from './store/store.js';
import "react-toastify/dist/ReactToastify.css";
import {ToastContainer} from "react-toastify";

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App/>
      <ToastContainer
        autoClose={2000}
        hideProgressBar={true}
        theme="colored"
        position="bottom-right"
      />
    </BrowserRouter>
  </Provider>
);
