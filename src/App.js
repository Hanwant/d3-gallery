import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link, NavLink } from 'react-router-dom'
import Stock from './stock';
import TreeSimple from './tree_simple';
import TreeCollapse from './tree_collapse';
import './App.css'


function NavBar(){
  return (
    <div className="sidenav">
      <h1>Gallery</h1>
        <nav>
          <ul>
            <li><NavLink to="/tree_simple">Tree Simple</NavLink></li>
            <li><NavLink to="/tree_collapse">Tree Collapsible</NavLink></li>
            <li><NavLink to="/stock">Stock</NavLink></li>
          </ul>
        </nav>
   </div>
  )
};

function D3Container(){
  return (
        <Switch>
          <Route path="/stock">
            <Stock/>
          </Route>
          <Route path="/tree_simple">
            <TreeSimple/>
          </Route>
          <Route path="/tree_collapse">
            <TreeCollapse/>
          </Route>
        </Switch>
  )
}

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar/>
        <D3Container/>
      </div>
    </Router>
  );
}

export default App;
