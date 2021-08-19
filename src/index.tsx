import React from 'react';
import { render } from 'react-dom';
import './styles/index.scss';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { g, rc } from 'utils';
import * as Components from 'components';
import * as Modules from 'modules';

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

g.restore_user_list();
get_scrollbar_width();

export const NodeContext = React.createContext({
	node: rc.main_net.hosts[0],
	set_node: (_: rc.RNodeInfo) => { return; }
});

function App() {
	let [current_node, set_current_node] = React.useState(rc.main_net.hosts[0]);
	const set_node = (node: rc.RNodeInfo) => {
		set_current_node(node);
	};

	return (
		<NodeContext.Provider value={{ node: current_node, set_node }}>
			<BrowserRouter>
				<Components.Navigation/>
				<Switch>
					<Route exact path="/create" component={Modules.CreateAccount} />
					<Route exact path="/login" component={Modules.Login} />
					<Route exact path="/restore" component={Modules.Restore} />
					<Route exact path="/restore/account" component={Modules.RestoreAccount} />
					<Route exact path="/restore/mnemonic" component={Modules.RestoreMnemonic} />
					<Route exact path="/restore/private-key" component={Modules.RestorePrivateKey} />
					<Route exact path="/dash" component={Modules.Dashboard} />
					<Route component={Modules.Landing} />
				</Switch>
			</BrowserRouter>
		</NodeContext.Provider>
	);
}

render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
  document.getElementById('root')
);

