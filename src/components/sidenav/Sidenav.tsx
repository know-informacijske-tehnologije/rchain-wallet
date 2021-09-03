import './Sidenav.scss';
import { useContext } from 'react';
import { LayoutContext, NodeContext } from 'index';
import { g, rc } from 'utils';
import { useLocation, Link } from "react-router-dom";
import * as Assets from "assets";

const links = [
  { icon: Assets.dash,         text: "DASHBOARD", to: "/wallet/dash" },
  { icon: Assets.trans,        text: "TRANSFER",  to: "/wallet/transfer" },
  { icon: Assets.wallet_small, text: "SETTINGS",  to: "/wallet/settings" },
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
        let urls = rc.get_node_urls(host);
        options.push(
          <option key={urls.httpUrl}
                  value={`${i},${j}`}
                  selected={node_context.node === host}>
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
      let urls = rc.get_node_urls(read_only);
      options.push(
        <option key={urls.httpUrl}
                value={i}
                selected={node_context.read_only === read_only}>
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

  const NodeSelects = () => {
    return (<>
      <label>
        <p>Validator node</p>
        <select onChange={set_node}>
          { Nodes() }
        </select>
      </label>
      <label>
        <p>Read-only node</p>
        <select onChange={set_readonly}>
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
