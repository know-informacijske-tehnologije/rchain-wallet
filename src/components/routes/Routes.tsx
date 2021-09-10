import { Route, Switch, useLocation } from 'react-router-dom';
import * as Components from 'components';
import * as Modules from 'modules';
import * as u from 'utils';

let layout_map: Record<string, string> = {
	"default": "Layout-Default",
	"/create": "Layout-Default",
	"/access": "Layout-Default",
	"/access/local": "Layout-Default",
	"/access/keystore": "Layout-Default",
	"/access/mnemonic": "Layout-Default",
	"/access/private-key": "Layout-Default",
	"/wallet/dash": "Layout-Wallet",
	"/wallet/transfer": "Layout-Wallet",
	"/wallet/deploy":   "Layout-Wallet",
	"/wallet/settings": "Layout-Wallet",
};

let i = 1;
export const RouteArray = [
	<Route exact key={i++} path="/create" component={Modules.Create} />,
	<Route exact key={i++} path="/create/mnemonic" component={Modules.CreateMnemonic} />,
	<Route exact key={i++} path="/create/keystore" component={Modules.CreateKeystore} />,

	<Route exact key={i++} path="/access" component={Modules.Access} />,
	<Route exact key={i++} path="/access/mnemonic"    component={Modules.AccessMnemonic} />,
	<Route exact key={i++} path="/access/private-key" component={Modules.AccessPrivateKey} />,
	<Route exact key={i++} path="/access/keystore"    component={Modules.AccessKeystore} />,
	<Route exact key={i++} path="/access/local"       component={Modules.AccessLocal} />,

	<Route exact key={i++} path="/wallet/dash"     component={Modules.Dashboard} />,
	<Route exact key={i++} path="/wallet/transfer" component={Modules.Transfer} />,
	<Route exact key={i++} path="/wallet/deploy"   component={Modules.Deploy} />,
	<Route exact key={i++} path="/wallet/settings" component={Modules.Settings} />,

	<Route       key={i++} component={Modules.Landing} />
];

export const RouteArrayProps = RouteArray.map(r => r.props);

export function Routes() {
	const location = useLocation();
	const nodes = u.useNodes();
	const layout = layout_map[location.pathname] || layout_map["default"];

	let netname = nodes.network.name || "";
	let cn = `App ${layout} ${netname}`

	return (<div className={cn}>
		<Components.Sidenav />
		<Components.Sidebar />
		<Components.Navigation />
		<Switch>
			{ RouteArray }
		</Switch>
	</div>);
}
