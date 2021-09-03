import React from 'react';
import { ReactElement } from 'react';
import { render } from 'react-dom';
import './styles/index.scss';
import { BrowserRouter } from 'react-router-dom';
import { g, rc } from 'utils';
import * as Components from 'components';
import { ModalBase } from 'components/modals/ModalBase';

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

type Modal<T extends ModalBase<any>> = {
	component: (props: T) => ReactElement,
	props: T
};

export const LayoutContext = React.createContext({
	sidenav_expanded: false,
	set_sidenav_expanded: (_: boolean) => { return; },
	modal_stack: [] as Modal<any>[],
	push_modal: <T extends ModalBase<any>>(_data: Modal<T>) => { return; },
	pop_modal: () => {}
});

export const NodeContext = React.createContext({
	network: rc.test_net,
	node: rc.test_net.hosts[0],
	set_node: (_net_i: number, _host_i: number) => { return; },
	read_only: rc.test_net.readOnlys[0],
	set_read_only: (_ro_i: number) => { return; }
});

function App() {
	let [network, set_network] = React.useState(rc.test_net);
	let [node, set_current_node] = React.useState(rc.test_net.hosts[0]);
	let [read_only, set_current_readonly] = React.useState(rc.test_net.readOnlys[0]);
	let [sidenav_expanded, set_sidenav_expanded] = React.useState(false);
	let [modal_stack, set_modal_stack] = React.useState<Modal<any>[]>([]);

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

	const push_modal  = <T extends ModalBase<any>>(modal: Modal<T>) => {
		modal_stack.push(modal);
		set_modal_stack([...modal_stack]);
	};

	const pop_modal = () => {
		let modal = modal_stack.pop();
		if (modal) {
			set_modal_stack([...modal_stack]);
		}
	};

	let initial_data = { network, node, read_only, set_node, set_read_only };
	let initial_layout = { sidenav_expanded, set_sidenav_expanded, modal_stack, push_modal, pop_modal };

	return (
		<NodeContext.Provider value={initial_data}>
			<LayoutContext.Provider value={initial_layout}>
				<BrowserRouter>
					<Components.Routes />
				</BrowserRouter>
				<Components.ModalHost />
			</LayoutContext.Provider>
		</NodeContext.Provider>
	);
}

render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
  document.getElementById('root')
);

