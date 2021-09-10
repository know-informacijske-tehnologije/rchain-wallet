// shortname: g
import { makeRNodeWeb } from '@tgrospic/rnode-http-js';
import * as u from './utils';
import * as nw from './networks';
import * as rnode from './rnode';

type Node = nw.RNodeInfo;
type ReadonlyNode = nw.RNodeReadonlyInfo;

export let rnode_web = makeRNodeWeb({fetch, now: Date.now});

export let networks = [
	nw.main_net,
	nw.local_net,
	nw.test_net,
	nw.test_net_block_merge,
];

export async function check_balance(current_node: ReadonlyNode) {
	if (!user) { return null; }

	return await rnode.check_balance(current_node, user.revAddr);
}

export async function transfer(
	current_node: Node,
	amount: number,
	from_account: u.NamedWallet,
	target_account: u.NamedWallet,
	cancel?: ()=>boolean
) {
	if (!from_account) { return null; }
	if (!target_account) { return null; }

	return await rnode.transfer(current_node, from_account, target_account, amount, cancel);
}

export async function deploy_code(
	current_node: Node,
	code: string,
	phlo_limit: number,
	cancel?: ()=>boolean
) {
	if (!user) { return null; }
	return await rnode.deploy(current_node, user, code, phlo_limit, cancel);
}

export let user_list: u.UserWallet[] = [];
export let user: u.UserWallet | u.UserMetaMaskWallet | null = null;
export let wallet_list: u.NamedWallet[] = [];

export function restore_user_list() {
	let stored_user_list = u.get_local('user-list');
	if (stored_user_list !== null) {
		for (let user of stored_user_list) {
			user_list.push(user);
		}
	}

	let stored_wallet_list = u.get_local('wallet-list');
	if (stored_wallet_list !== null) {
		for (let wallet of stored_wallet_list) {
			wallet_list.push(wallet);
		}
	}
}

export function create_user(
	name: string,
	password: string,
	wallet: u.PrivateWallet
): u.UserWallet {
	return {
		...wallet,
		name, password,
	};
}

export function create_user_metamask(
	wallet: u.MetaMaskWallet
): u.UserMetaMaskWallet {
	return {
		...wallet,
		name: "My Wallet",
		password: "",
		is_metamask: true
	};
}

export function wallet_index(wallets: u.NamedWallet[], wallet: u.NamedWallet | string) {
	let index = -1;

	if (typeof wallet == "string") {
		index = wallets.findIndex(w => {
			return w.name === wallet ||
				w.revAddr === wallet;
		});
	} else {
		index = wallets.findIndex(w => {
			return w.name === wallet.name ||
				w.revAddr === wallet.revAddr;
		});
	}

	return index;
}

export function wallet_exists(wallets: u.NamedWallet[], wallet: u.NamedWallet | string) {
	return wallet_index(wallets, wallet) !== -1;
}

export function set_active_user(account: u.UserWallet | u.UserMetaMaskWallet) {
	if (account.password || u.wallet_is_metamask(account)) {
		user = account;
		return;
	}

	let existing = user_list.find(u => u.privKey === account.privKey);
	if (existing) {
		user = existing;
		return;
	}

	user = account;
}

export function remove_user(user: u.UserWallet) {
	let index = wallet_index(user_list, user);
	if (index !== -1) {
		user_list.splice(index, 1);
	}
}

export function clear_users() {
	while (user_list.length > 0) {
		user_list.pop();
	}
	u.set_local('user-list', user_list);
}

export function add_user(wallet: u.UserWallet) {
	if (!wallet_exists(user_list, wallet)) {
		user_list.push(wallet);
		u.set_local('user-list', user_list);
		return true;
	}

	return false;
}

export function add_wallet(wallet: u.NamedWallet) {
	if (!wallet_exists(wallet_list, wallet)) {
		wallet_list.push(wallet);
		u.set_local('wallet-list', wallet_list);
	}
}
