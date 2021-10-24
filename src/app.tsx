import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SearchFolders } from './components/search-folders/SearchFolders'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Provider } from 'react-redux';
import { configureStore } from './store';
const store = configureStore();

function render() {
  ReactDOM.render(
     <Provider store={store}>
      <SearchFolders />
     </Provider>
  , document.getElementById("root"));
}

render();