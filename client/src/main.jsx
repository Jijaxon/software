import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import "react-toastify/dist/ReactToastify.css";
import './index.css'
import {Provider} from "react-redux";
import store from './store/store.js';
import NafisToaster from "@/components/common/toaster.jsx";
import {LanguageProvider} from "@/i18n/index.jsx";

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <LanguageProvider>
      <BrowserRouter>
        <App/>
        <NafisToaster/>
      </BrowserRouter>
    </LanguageProvider>
  </Provider>
);
