import { makeRNodeWeb, RevAccount } from '@tgrospic/rnode-http-js';
import * as u from './utils';
import * as rc from './rchain';
import * as utils from './utils';

type AccountType = u.AccountType;
type AccountData = u.AccountData;

export let rnode_web = makeRNodeWeb({fetch, now: Date.now});
export let app_node_actions = rc.make_rnode_actions(rnode_web);

export let networks = [
	rc.main_net,
	rc.local_net,
	rc.test_net,
	rc.test_net_block_merge,
];

export async function check_balance(current_node: rc.RNodeInfo) {
	if (!user) { return null; }
	let node = rc.get_node_urls(current_node);

	return await app_node_actions.appCheckBalance({
		node: node,
		revAddr: user.revAddr
	});
}

function is_account_type(obj: any): obj is AccountType {
	if (obj["username"]) {
		return true;
	}
	return false;
}

function adapt_account(acc: AccountType | AccountData, default_username: string): RevAccount {
	let name = default_username;
	if (is_account_type(acc)) {
		name = acc.username;
	}

	return {
		name: name,
		privKey: acc.privKey,
		pubKey: acc.pubKey,
		revAddr: acc.revAddr,
		ethAddr: acc.ethAddr,
	};
}

export async function transfer(
	current_node: rc.RNodeInfo,
	amount: number,
	from_account: AccountData,
	target_account: AccountData
) {
	if (!from_account) { return null; }
	if (!target_account) { return null; }

	let node = rc.get_node_urls(current_node);
	return await app_node_actions.appTransfer({
		node: node,
		fromAccount: adapt_account(from_account, "From"),
		toAccount: adapt_account(target_account, "To"),
		amount: amount + "",
		setStatus: console.log
	});
}

export let user_list: AccountType[] = [];
export let user: AccountType | null = null;

export function restore_user_list() {
	let stored_list = utils.get_local('user-list');
	if (stored_list === null) { return; }
	for (let user of stored_list) {
		user_list.push(user);
	}
}

export function create_user(
	username: string,
	password: string,
	account_data: AccountData
): AccountType {
	return {
		...account_data,
		username, password,
	};
}

export function set_active_user(account: AccountType) {
	user = account;
	console.log("Setting active user", user);
}

export function remove_user(user: AccountType) {
	let index = user_list.findIndex(u => u.username === user.username);
	if (index !== -1) {
		user_list.splice(index, 1);
	}
}

export function clear_users() {
	while (user_list.length > 0) {
		user_list.pop();
	}
}

export function add_user(account: AccountType) {
	user_list.push(account);
	utils.set_local('user-list', user_list);
}

export function cancel_restore_account(history: utils.History) {
	utils.set_local('mnemonic', undefined);
	utils.set_local('private-key', undefined);
	history.push("/restore");
}
