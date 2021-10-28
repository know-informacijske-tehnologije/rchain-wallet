// shortname: rnode

import * as u from './utils';
import * as rho from './rho';
import * as nw from './networks';
import { makeRNodeWeb, rhoExprToJson } from '@tgrospic/rnode-http-js';

type Node = nw.RNodeInfo;
type ReadonlyNode = nw.RNodeReadonlyInfo;

let rnode_web = makeRNodeWeb({ fetch, now: Date.now });
let rnode_http = rnode_web.rnodeHttp;
let send_deploy = rnode_web.sendDeploy;
let get_data_for_deploy = rnode_web.getDataForDeploy;
let propose = rnode_web.propose;

export type NetworkName = 'localnet' | 'testnet-bm' | 'testnet' | 'mainnet';

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

export async function check_balance(node: ReadonlyNode, rev_addr: string) {
    const code = rho.fn_check_balance(rev_addr);

    let urls = nw.get_node_urls(node);

    try {
        const res = await rnode_http(urls.httpUrl, 'explore-deploy', code);
        const expr = res.expr[0];
        if (!expr) {
            return { balance: null, error: "Unknown error" };
        }

        const balance = expr?.ExprInt?.data;
        const err = expr?.ExprString?.data;

        return {
            balance: balance || null,
            error: err || null
        };
    } catch (err) {
        return {
            balance: null,
            error: String(err)
        };
    }
}

export async function transfer(
    node: Node,
    from_wallet: u.NamedWallet,
    to_wallet: u.NamedWallet,
    amount: number,
    cancel: ()=>boolean = ()=>false
) {
    const urls = nw.get_node_urls(node);
    u.wallet_normalize(from_wallet);
    u.wallet_normalize(to_wallet);
    const code = rho.fn_transfer_funds(from_wallet.revAddr, to_wallet.revAddr, amount);

    let signature: string|null;
    try {
        signature = (await send_deploy(urls, from_wallet, code, 500000)).signature;
    } catch (err) {
        return {
            cost: null,
            error: String(err)
        };
    }

    if (urls.network === "localnet") {
        propose(urls).catch((e) => console.warn(e));
    }

    let data: any;
    let cost: number | null;
    try {
        let res = await get_data_for_deploy(urls, signature, cancel);
        data = res.data;
        cost = res.cost;
    } catch (err) {
        return {
            cost: null,
            error: String(err)
        };
    }

    const args = data ? rhoExprToJson(data.expr) : null;

    if (!args) {
        return {
            cost: null,
            error: "Deploy found in the block, but failed to get confirmation data."
        };
    }

    if (!args[0]) {
        return {
            cost: cost || null,
            error: args[0]
        };
    }

    return {
        cost: cost,
        error: null
    };
}

export async function deploy(
    node: Node,
    wallet: u.NamedWallet,
    code: string,
    phlo_limit: number,
    cancel: ()=>boolean = ()=>false
) {
    let urls = nw.get_node_urls(node);
    let signature: string;

    u.wallet_normalize(wallet);

    try {
        signature = (await send_deploy(urls, wallet, code, phlo_limit)).signature;
    } catch (err) {
        return {
            message: null,
            cost: null,
            error: u.error_string(err)
        };
    }

    let data: any;
    let cost: number | null;
    try {
        let res = await get_data_for_deploy(urls, signature, cancel);
        data = res.data;
        cost = res.cost;
    } catch (err) {
        return {
            message: null,
            cost: null,
            error: u.error_string(err)
        };
    }

    const args = data ? rhoExprToJson(data.expr) : null;

    if (!args) {
        return {
            message: null,
            cost: cost || null,
            error: "Deploy found in the block, but data is not sent on `rho:rchain:deployId` channel."
        };
    }

    return {
        message: u.is_type(args, Array) ? args.join(", ") : args,
        cost: cost || null,
        error: null
    };
}
