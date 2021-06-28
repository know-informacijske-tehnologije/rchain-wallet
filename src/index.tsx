import React from 'react';
import { render } from 'react-dom';
import './index.scss';
import { BrowserRouter, Route } from 'react-router-dom';
import Landing from './landing/Landing';
import Navigation from './navigation/Navigation';
import Sidebar from './sidebar/Sidebar';

function get_scrollbar_width() {
	const outer = document.createElement('div');
	const inner = document.createElement('div');

	outer.style.visibility = 'hidden';
	outer.style.overflow = 'scroll';
	outer.appendChild(inner);
	document.body.appendChild(outer);

	const scrollbar_width = outer.offsetWidth - inner.offsetWidth;
	outer.remove();

	document.body.style.setProperty('--scrollbar-width', scrollbar_width + 'px');

	return scrollbar_width;
}

get_scrollbar_width();

render(
  <React.StrictMode>
    <BrowserRouter>
      <Navigation />
      <Sidebar />
      <Route path="/" component={Landing} />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

