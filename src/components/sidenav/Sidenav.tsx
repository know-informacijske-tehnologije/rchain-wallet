import './Sidenav.scss';
import { useContext } from 'react';
import { LayoutContext, NodeContext } from 'index';
import { g, nw, wallet_is_metamask } from 'utils';
import { useLocation, Link } from "react-router-dom";
import * as Assets from "assets";

interface NavLink {
  icon: string,
  text: string,
  to: string,
  validator?: ()=>boolean;
}

const links: NavLink[] = [
  { icon: Assets.dash,         text: "DASHBOARD", to: "/wallet/dash" },
  { icon: Assets.trans,        text: "TRANSFER",  to: "/wallet/transfer" },
  { icon: Assets.deploy,       text: "DEPLOY",    to: "/wallet/deploy" },
  {
    icon: Assets.wallet_small, text: "SETTINGS",  to: "/wallet/settings",
    validator: () => {
      return !wallet_is_metamask(g.user);
    }
  },
];

export function Sidenav() {
  const layout = useContext(LayoutContext);
  const node_context = useContext(NodeContext);
  const location = useLocation();

  if (!location.pathname.startsWith("/wallet")) {
    return (<></>);
  }

  function Links() {
    let link_els = [];
    for (let link of links) {
      if (!!link.validator && !link.validator()) { continue; }
      let is_current = location.pathname.startsWith(link.to);
      link_els.push(
        <Link className={is_current ? "Current" : ""}
              to={link.to}
              key={location.pathname + link.to}>
          <img src={link.icon} alt="" />
          <span>{link.text}</span>
          <img className="Spacer" src={link.icon} alt="" />
        </Link>
      );
    }

    return link_els;
  }

  const Nodes = () => {
    let optgroups = [];
    for (let i=0; i<g.networks.length; i++) {
      let network = g.networks[i];
      let options = [];

      for (let j=0; j<network.hosts.length; j++) {
        let host = network.hosts[j];
        let urls = nw.get_node_urls(host);
        options.push(
          <option key={urls.httpUrl}
                  value={`${i},${j}`}>
            {urls.httpUrl}
          </option>
        );
      }

      optgroups.push(
        <optgroup key={network.title || network.name}
                  label={network.title || network.name}>
          {options}
        </optgroup>
      );
    }

    return optgroups;
  };

  const ReadOnlys = () => {
    let options = [];

    let network = node_context.network;
    for (let i=0; i<network.readOnlys.length; i++) {
      let read_only = network.readOnlys[i];
      let urls = nw.get_node_urls(read_only);
      options.push(
        <option key={urls.httpUrl}
                value={i}>
          {urls.httpUrl}
        </option>
      );
    }

    return options;
  };

  const set_node = (ev: any) => {
    let [nw_i, host_i] = ev.target.value.split(",");
    node_context.set_node(nw_i, host_i);
  };

  const set_readonly = (ev: any) => {
    node_context.set_read_only(ev.target.value);
  };

  let selected_node_value = "0,0";
  let selected_readonly_value = 0;

  OUT: for (let i=0; i<g.networks.length; i++) {
    let network = g.networks[i];

    for (let j=0; j<network.hosts.length; j++) {
      let host = network.hosts[j];
      if (node_context.node === host) {
        selected_node_value = `${i},${j}`;
        break OUT;
      }
    }
  }

  for (let i=0; i<node_context.network.readOnlys.length; i++) {
    let read_only = node_context.network.readOnlys[i];
    if (node_context.read_only === read_only) {
      selected_readonly_value = i;
      break;
    }
  }

  const NodeSelects = () => {
    return (<>
      <label>
        <p>Validator node</p>
        <select onChange={set_node} value={selected_node_value}>
          { Nodes() }
        </select>
      </label>
      <label>
        <p>Read-only node</p>
        <select onChange={set_readonly} value={selected_readonly_value}>
          { ReadOnlys() }
        </select>
        <p>&nbsp;</p>
      </label>
    </>);
  };

  return (
    <div className={"Sidenav " + (layout.sidenav_expanded ? "Expanded" : "")}>
      <button className="Toggle CloseButton"
              onClick={() => layout.set_sidenav_expanded(false) }>
        <img src={Assets.cancel} alt="Close"/>
      </button>

      <div className="Logo">
        <img src={Assets.logo_notext} alt="RChain logo"/>
      </div>

      <div className="Links">
        {Links()}
      </div>

      <div className="Flex-Spacer" />

      <div className="NodeSelect">
        { NodeSelects() }
      </div>
    </div>
  );
}
