import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SearchFolders } from './components/search-folders/SearchFolders'
import 'bootstrap/dist/css/bootstrap.min.css';

function render() {
  ReactDOM.render(<div>
     <SearchFolders />
  </div>, document.getElementById("root"));
}

render();