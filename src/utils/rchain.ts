// Mostly code adapted from tgrospic/rnode-client-js-dev-test
// https://github.com/tgrospic/rnode-client-js-dev-test

import * as rho from './rho';
import {
	RevAccount, rhoExprToJson, GetDeployDataEff,
	ProposeEff, RawRNodeHttpEff, RNodeWebAPI, SendDeployEff
} from '@tgrospic/rnode-http-js';

type Constructor<T> = (new (...args: any[]) => T) | ((...args: any[]) => T);

// Produces an array with the numbers
// from a to b in it.
function range(a: number=0, b: number=a) {
	let reverse = false;
	if (a > b) {
		[a, b] = [b, a];
		reverse = true;
	}
	let rng = (b - a) + 1;

	let arr = new Array(rng).fill(0).map((_, i) => i + a);

	if (reverse) {
		arr.reverse();
	}

	return arr;
}

function repeat_string(str: string, times: number) {
	return new Array(times).fill(str).join("");
}

function is_nil(obj: any): obj is null {
	return obj === null || obj === undefined;
}

function is_type<T>(obj: any, type_: Constructor<T>): obj is T {
	if (is_nil(obj)) { return false; }
	return obj.constructor === type_ || obj instanceof type_;
}

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
}

export interface RChainNetwork {
	readonly title: string;
	readonly name: NetworkName;
	readonly hosts: RNodeInfo[];
	readonly readOnlys: RNodeInfo[];
	readonly faucet?: string;
}

export type NetworkName = 'localnet' | 'testnet-bm' | 'testnet' | 'mainnet'

const default_ports: Partial<RNodeInfo> = { grpc: 40401, http: 40403, httpAdmin: 40405 };
const default_ports_ssl: Partial<RNodeInfo> = { grpc: 40401, https: 443, httpAdmin: 40405 };

export const local_net: RChainNetwork = {
	title: 'Local network',
	name: 'localnet',
	hosts: [
		{ domain: 'localhost', ...default_ports },
		{ domain: 'localhost', grpc: 40411, http: 40413, httpAdmin: 40415 },
		{ domain: 'localhost', grpc: 40421, http: 40423, httpAdmin: 40425 },
		{ domain: 'localhost', grpc: 40431, http: 40433, httpAdmin: 40435 },
		{ domain: 'localhost', grpc: 40441, http: 40443, httpAdmin: 40445 },
		{ domain: 'localhost', grpc: 40451, http: 40453, httpAdmin: 40455 },
	],
	readOnlys: [
		{ domain: 'localhost', ...default_ports },
		{ domain: 'localhost', grpc: 40411, http: 40413, httpAdmin: 40415 },
		{ domain: 'localhost', grpc: 40421, http: 40423, httpAdmin: 40425 },
		{ domain: 'localhost', grpc: 40431, http: 40433, httpAdmin: 40435 },
		{ domain: 'localhost', grpc: 40441, http: 40443, httpAdmin: 40445 },
		{ domain: 'localhost', grpc: 40451, http: 40453, httpAdmin: 40455 },
	]
};

function get_test_net_bm_urls(n: number) {
	const instance = `node${n}`;
	return {
		domain: `${instance}.bm.testnet.rchain.coop`,
		instance,
		...default_ports_ssl
	};
}

const test_net_bm_hosts = range(0, 4).map(get_test_net_bm_urls);

export const test_net_block_merge: RChainNetwork = {
	title: 'RChain testing network (block-merge)',
	name: 'testnet-bm',
	hosts: test_net_bm_hosts,
	readOnlys: [
		{ domain: 'observer.bm.testnet.rchain.coop', instance: 'observer', ...default_ports_ssl },
	],
	faucet: 'https://status.bm.testnet.rchain.coop/testnet/faucet',
};

function get_test_net_urls(n: number) {
	const instance = `node${n}`;
	return {
		domain: `${instance}.testnet.rchain.coop`,
		instance,
		...default_ports_ssl,
	}
}

const test_net_hosts = range(0, 4).map(get_test_net_urls);

export const test_net: RChainNetwork = {
	title: 'RChain testing network',
	name: 'testnet',
	hosts: test_net_hosts,
	readOnlys: [
		{ domain: 'observer.testnet.rchain.coop', instance: 'observer', ...default_ports_ssl },
		{ domain: 'rnode1.rhobot.net', ...default_ports_ssl },
	],
	faucet: 'https://status.rchain.coop/testnet/faucet'
};

function get_main_net_urls(n: number) {
	return {
		domain: `node${n}.root-shard.mainnet.rchain.coop`,
		...default_ports_ssl
	};
}

const main_net_hosts = range(0, 30).map(get_main_net_urls);
export const main_net: RChainNetwork = {
	title: 'RChain MAIN network',
	name: 'mainnet',
	hosts: main_net_hosts,
	readOnlys: [
		{ domain: 'observer.services.mainnet.rchain.coop', https: 443 },
		{ domain: 'observer-us.services.mainnet.rchain.coop', ...default_ports_ssl },
		{ domain: 'observer-asia.services.mainnet.rchain.coop', ...default_ports_ssl },
		{ domain: 'observer-eu.services.mainnet.rchain.coop', ...default_ports_ssl },
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

export function make_rnode_actions(rnodeweb: RNodeWebAPI) {
	const { rnodeHttp, sendDeploy, getDataForDeploy, propose } = rnodeweb;
	const { log, warn } = console;

	return {
		appCheckBalance: appCheckBalance({rnodeHttp}),
		appTransfer: appTransfer({sendDeploy, getDataForDeploy, propose, log, warn}),
		appSendDeploy: appSendDeploy({sendDeploy, getDataForDeploy, log}),
		appPropose: appPropose({propose, log})
	};
}

export type AppCheckBalanceArgs = {node: NodeUrls, revAddr: string};
function appCheckBalance({rnodeHttp}: RawRNodeHttpEff) {
	return async function acb({node, revAddr}: AppCheckBalanceArgs): Promise<[number, string]> {
		const deployCode = rho.fn_check_balance(revAddr)
		const res = await rnodeHttp(node.httpUrl, 'explore-deploy', deployCode);
		const expr = res.expr[0];
		const balance = expr && expr.ExprInt && expr.ExprInt.data;
		const err = expr && expr.ExprString && expr.ExprString.data;
		return [balance, err];
	}
}

export type ConsoleLog = { log: typeof console.log };
export type ConsoleWarn = { warn: typeof console.warn };
export type ConsoleEff = ConsoleLog & ConsoleWarn;
export type AppTransferEff = SendDeployEff & GetDeployDataEff & ProposeEff & ConsoleEff;

export type AppTransferArgs = {
	readonly node: NodeUrls;
	readonly fromAccount: RevAccount;
	readonly toAccount: RevAccount;
	readonly amount: string;
	setStatus(msg: string): any;
};

function appTransfer(effects: AppTransferEff) {
	return async function at({node, fromAccount, toAccount, amount, setStatus}: AppTransferArgs) {
		const {sendDeploy, getDataForDeploy, propose, log, warn} = effects;

		log('TRANSFER', {amount, from: fromAccount.name, to: toAccount.name, node: node.httpUrl});

		setStatus(`Deploying ...`);
		const code = rho.fn_transfer_funds(fromAccount.revAddr, toAccount.revAddr, amount);
		console.log(code);
		const {signature} = await sendDeploy(node, fromAccount, code);
		log('DEPLOY ID (signature)', signature);

		if (node.network === 'localnet') {
			// Propose on local network, don't wait for result
			propose(node).catch((ex: any) => warn(ex));
		}

		// Progress dots
		const mkProgress = (i: number) => () => {
			i = i > 60 ? 0 : i + 3
			return `Checking result ${repeat_string('.', i)}`
		};

		const progressStep = mkProgress(0);
		const updateProgress = () => setStatus(progressStep());
		updateProgress();

		// Try to get result from next proposed block
		const {data, cost} = await getDataForDeploy(node, signature, updateProgress);
		// Extract data from response object
		const args = data ? rhoExprToJson(data.expr) : undefined;
		const costTxt = is_nil(cost) ? 'failed to retrive' : cost;
		const [success, message] = args || [false, 'deploy found in the block but failed to get confirmation data'];

		if (!success) throw Error(`Transfer error: ${message}. // cost: ${costTxt}`);
		return `✓ ${message} // cost: ${costTxt}`;
	}
}

export type AppSendDeployEff = SendDeployEff & GetDeployDataEff & ConsoleLog;
export type AppSendDeployArgs = {
	readonly node: NodeUrls;
	readonly code: string;
	readonly account: RevAccount;
	readonly phloLimit: string;
	setStatus(msg: string): any;
};

function appSendDeploy(effects: AppSendDeployEff) {
	return  async function asd({node, code, account, phloLimit, setStatus}: AppSendDeployArgs) {
		const {sendDeploy, getDataForDeploy, log} = effects;

		log('SENDING DEPLOY', {account: account.name, phloLimit, node: node.httpUrl, code});

		setStatus(`Deploying ...`);

		const phloLimitNum = is_nil(phloLimit) ? phloLimit : parseInt(phloLimit);

		const {signature} = await sendDeploy(node, account, code, phloLimitNum);
		log('DEPLOY ID (signature)', signature);

		// Progress dots
		const mkProgress = (i: number) => () => {
			i = i > 60 ? 0 : i + 3;
			return `Checking result ${repeat_string('.', i)}`;
		};

		const progressStep = mkProgress(0);
		const updateProgress = () => setStatus(progressStep());
		updateProgress();

		// Try to get result from next proposed block
		const {data, cost} = await getDataForDeploy(node, signature, updateProgress);
		// Extract data from response object
		const args = data ? rhoExprToJson(data.expr) : undefined;

		log('DEPLOY RETURN DATA', {args, cost, rawData: data});

		const costTxt =  is_nil(cost) ? 'failed to retrive' : cost;
		const [success, message] = is_nil(args) ?
			[false, 'deploy found in the block but data is not sent on `rho:rchain:deployId` channel'] :
			[true, is_type(args, Array) ? args.join(', ') : args];

		if (!success) throw Error(`Deploy error: ${message}. // cost: ${costTxt}`);
		return `✓ (${message}) // cost: ${costTxt}`;
	}
}

type AppProposeEff = ProposeEff & ConsoleLog;

function appPropose({propose, log}: AppProposeEff) {
	return async function ap({httpAdminUrl}: NodeUrls) {
		const resp = await propose({httpAdminUrl});

		log('Propose result', resp);

		return resp;
	}
}
