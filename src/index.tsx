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
	network: rc.main_net,
	node: rc.main_net.hosts[0],
	set_node: (_net_i: number, _host_i: number) => { return; },
	read_only: rc.main_net.readOnlys[0],
	set_read_only: (_ro_i: number) => { return; }
});

function App() {
	let [network, set_network] = React.useState(rc.main_net);
	let [node, set_current_node] = React.useState(rc.main_net.hosts[0]);
	let [read_only, set_current_readonly] = React.useState(rc.main_net.readOnlys[0]);

	const set_node = (net_i: number, host_i: number) => {
		const nw = g.networks[net_i];
		if (!nw) { throw new Error(`Unknown network at index ${net_i}!`); }
		const host = nw.hosts[host_i];
		if (!host) { throw new Error(`Unknown host in network '${network.title || network.name}' at index ${host_i}!`); }


		let ro = read_only;
		if (nw !== network) { ro = nw.readOnlys[0]; set_network(nw); }
		if (host !== node) { set_current_node(host); }
		if (ro !== read_only) { set_current_readonly(ro); }
	};

	const set_read_only = (ro_i: number) => {
		set_current_readonly(network.readOnlys[ro_i]);
	};

	let initial_data = { network, node, read_only, set_node, set_read_only };

	return (
		<NodeContext.Provider value={initial_data}>
			<BrowserRouter>
				<Components.Navigation/>
				<Switch>
					<Route exact path="/create" component={Modules.CreateAccount} />
					<Route exact path="/login" component={Modules.Login} />
					<Route exact path="/restore" component={Modules.Restore} />
					<Route exact path="/restore/account" component={Modules.RestoreAccount} />
					<Route exact path="/restore/mnemonic" component={Modules.RestoreMnemonic} />
					<Route exact path="/restore/private-key" component={Modules.RestorePrivateKey} />
					<Route exact path="/wallet/dash" component={Modules.Dashboard} />
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

