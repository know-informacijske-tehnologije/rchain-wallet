// shortname: nw

// Mostly code adapted from tgrospic/rnode-client-js-dev-test
// https://github.com/tgrospic/rnode-client-js-dev-test

import * as u from './utils';

export interface RNodeInfo {
	readonly domain: string;
	readonly grpc?: number;
	readonly http?: number;
	readonly https?: number;
	readonly httpAdmin?: number;
	readonly httpsAdmin?: number;
	readonly instance?: string;
	readonly name?: NetworkName;
	readonly title?: string;
	readonly network?: RChainNetwork;
};

enum READONLY_TAG {};
export type RNodeReadonlyInfo = RNodeInfo & READONLY_TAG;

function readonly_tag(node: RNodeInfo): RNodeReadonlyInfo {
	return node as RNodeReadonlyInfo;
}

export interface RChainNetwork {
	readonly title: string;
	readonly name: NetworkName;
	readonly hosts: RNodeInfo[];
	readonly readOnlys: RNodeReadonlyInfo[];
	readonly faucet?: string;
}

export type NetworkName = 'localnet' | 'testnet-bm' | 'testnet' | 'mainnet';

const default_ports_ssl: Partial<RNodeInfo> = { grpc: 40401, https: 443, httpAdmin: 40405 };

function localnet_host(n: number): RNodeInfo {
	return {
		domain: "localhost",
		grpc:      40401 + n*10,
		http:      40403 + n*10,
		httpAdmin: 40405 + n*10
	};
}

export const local_net: RChainNetwork = {
	title: 'Local network',
	name: 'localnet',
	hosts: u.range(0,5).map(localnet_host),
	readOnlys: u.range(0,5).map((n)=>readonly_tag(localnet_host(n)))
};

function bm_testnet_host(n: number) {
	return {
		domain: `node${n}.bm.testnet.rchain.coop`,
		instance: `node${n}`,
		...default_ports_ssl
	};
}

export const test_net_block_merge: RChainNetwork = {
	title: 'RChain testing network (block-merge)',
	name: 'testnet-bm',
	hosts: u.range(0, 4).map(bm_testnet_host),
	readOnlys: [
		readonly_tag({
			domain: 'observer.bm.testnet.rchain.coop',
			instance: 'observer',
			...default_ports_ssl
		}),
	],
	faucet: 'https://status.bm.testnet.rchain.coop/testnet/faucet',
};

function testnet_host(n: number) {
	return {
		domain: `node${n}.testnet.rchain.coop`,
		instance: `node${n}`,
		...default_ports_ssl,
	}
}

export const test_net: RChainNetwork = {
	title: 'RChain testing network',
	name: 'testnet',
	hosts: u.range(0, 4).map(testnet_host),
	readOnlys: [
		readonly_tag({ domain: 'observer.testnet.rchain.coop', instance: 'observer', ...default_ports_ssl }),
		readonly_tag({ domain: 'rnode1.rhobot.net', ...default_ports_ssl }),
	],
	faucet: 'https://status.rchain.coop/testnet/faucet'
};

function mainnet_host(n: number) {
	return {
		domain: `node${n}.root-shard.mainnet.rchain.coop`,
		...default_ports_ssl
	};
}

export const main_net: RChainNetwork = {
	title: 'RChain MAIN network',
	name: 'mainnet',
	hosts: u.range(0, 30).map(mainnet_host),
	readOnlys: [
		readonly_tag({ domain: 'observer.services.mainnet.rchain.coop', https: 443 }),
		readonly_tag({ domain: 'observer-us.services.mainnet.rchain.coop', ...default_ports_ssl }),
		readonly_tag({ domain: 'observer-asia.services.mainnet.rchain.coop', ...default_ports_ssl }),
		readonly_tag({ domain: 'observer-eu.services.mainnet.rchain.coop', ...default_ports_ssl }),
	],
};

export interface NodeUrls {
	readonly network: NetworkName;
	readonly grpcUrl: string;
	readonly httpUrl: string;
	readonly httpAdminUrl: string;
	readonly statusUrl: string;
	readonly getBlocksUrl: string;
	readonly logsUrl?: string;
	readonly filesUrl?: string;
}

export function get_node_urls({name, domain, grpc, http, https, httpAdmin, httpsAdmin, instance}: RNodeInfo): NodeUrls {
	let scheme = '';
	if (!!http) { scheme = 'http' };
	if (!!https) { scheme = 'https' };

	let scheme_admin = '';
	if (!!httpAdmin) { scheme_admin = 'http' };
	if (!!httpsAdmin) { scheme_admin = 'https' };

	let http_url = '';
	if (!!https || !!http) {
		http_url = `${scheme}://${domain}:${https || http}`;
	}

	let http_admin_url = '';
	if (!!httpsAdmin || !!httpAdmin) {
		http_admin_url = `${scheme_admin}://${domain}:${httpsAdmin || httpAdmin}`;
	}

	let grpc_url = '';
	if (!!grpc) {
		grpc_url = `${domain}:${grpc}`;
	}

	return {
		network: name as NetworkName,
		grpcUrl: grpc_url,
		httpUrl: http_url,
		httpAdminUrl: http_admin_url,
		statusUrl: `${http_url}/status`,
		getBlocksUrl: `${http_url}/api/blocks`,
		logsUrl: instance && `http://${domain}:8181/logs/name:${instance}`,
	};
}
