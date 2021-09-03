import { Route, Switch, useLocation } from 'react-router-dom';
import * as Components from 'components';
import * as Modules from 'modules';

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
	"/wallet/settings": "Layout-Wallet",
};

export function Routes() {
	const location = useLocation();
	const layout = layout_map[location.pathname] || layout_map["default"];

	return (<div className={"App " + layout}>
		<Components.Sidenav />
		<Components.Sidebar />
		<Components.Navigation />
		<Switch>
			<Route exact path="/create" component={Modules.Create} />
			<Route exact path="/create/mnemonic" component={Modules.CreateMnemonic} />
			<Route exact path="/create/keystore" component={Modules.CreateKeystore} />

			<Route exact path="/access" component={Modules.Access} />
			<Route exact path="/access/mnemonic"    component={Modules.AccessMnemonic} />
			<Route exact path="/access/private-key" component={Modules.AccessPrivateKey} />
			<Route exact path="/access/keystore"    component={Modules.AccessKeystore} />
			<Route exact path="/access/local"       component={Modules.AccessLocal} />

			<Route exact path="/wallet/dash"     component={Modules.Dashboard} />
			<Route exact path="/wallet/transfer" component={Modules.Transfer} />
			<Route exact path="/wallet/settings" component={Modules.Settings} />
			<Route component={Modules.Landing} />
		</Switch>
	</div>);
}
