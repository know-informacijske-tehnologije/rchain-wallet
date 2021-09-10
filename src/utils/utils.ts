import { useState, useContext } from 'react';
import { LayoutContext, NodeContext } from 'index';
import { useHistory } from 'react-router-dom';

export type History = ReturnType<typeof useHistory>;

export type Unbox<T> = T extends PromiseLike<infer U> ? Unbox<U> : T;

export enum OPERATION {
	INITIAL,
	PENDING,
	DONE
};

export interface PublicWallet {
	revAddr: string;
	ethAddr?: string;
};

export interface PrivateWallet extends PublicWallet {
	pubKey: string;
	privKey: string;
	mnemonic?: string;
};

export interface MetaMaskWallet extends PublicWallet {
	ethAddr: string;
	is_metamask: boolean;
};

export function wallet_normalize(wallet: PublicWallet) {
	if (wallet.ethAddr) {
		wallet.ethAddr = wallet.ethAddr.replace(/^0x/, "");
	}
}

export function wallet_is_metamask(obj: any): obj is MetaMaskWallet {
	if (!obj) { return false; }
	let has_rev_addr = typeof obj["revAddr"] == "string";
	let has_eth_addr = typeof obj["ethAddr"] == "string";
	let has_metamask = typeof obj["is_metamask"] == "boolean";
	let is_metamask = obj["is_metamask"];
	return has_rev_addr && has_eth_addr &&
			has_metamask && is_metamask;
}

export function wallet_is_private(obj: any): obj is PrivateWallet {
	if (!obj) { return false; }
	let has_rev_addr = typeof obj["revAddr"] == "string";
	let has_eth_addr = typeof obj["ethAddr"] == "string";
	let has_pub_addr = typeof obj["pubKey"] == "string";
	let has_priv_addr = typeof obj["privKey"] == "string";
	return has_rev_addr && has_eth_addr &&
			has_pub_addr && has_priv_addr;
}

export interface NamedWallet extends PublicWallet {
	name: string;
	password?: string;
};

export interface UserWallet extends PrivateWallet {
	name: string;
	password: string;
};

export type UserMetaMaskWallet = NamedWallet & MetaMaskWallet;

interface _LocallyStored {
	"user-list": UserWallet[],
	"wallet-list": NamedWallet[],
};

type LocallyStored = Partial<_LocallyStored>;

export function set_local<K extends keyof LocallyStored>(
	key: K,
	val: LocallyStored[K]
) {
	if (val === null || val === undefined) {
		localStorage.removeItem(key);
	} else {
		localStorage.setItem(key, JSON.stringify(val));
	}
}

export function get_local<K extends keyof LocallyStored>(
	key: K,
	default_value?: LocallyStored[K]
): _LocallyStored[K] | null {
	if (!(key in localStorage) && default_value !== undefined) {
		set_local(key, default_value);
	}

	let val = localStorage.getItem(key);

	if (val === null || val === undefined) {
		return null;
	}

	return JSON.parse(val);
}

export function navigate(history: History, route: string) {
	return () => history.push(route);
}

export function write_prop(set_prop: any) {
	return (evt: any) => {
		set_prop(evt.target.value);
	}
}

export function toggle(prop: any, set_prop: any) {
	return () => {
		set_prop(!prop);
	}
}

export async function Get<T>(url: string, headers: {[key: string]: string} = {}) {
	let response = await fetch(url, { method: "GET", headers });
	return (await response.json()) as T;
}

export async function Post<T>(url: string, body: any, headers: {[key: string]: string} = {}) {
	let response = await fetch(url, { body: JSON.stringify(body), method: "POST", headers });
	return (await response.json()) as T;
}

export function useToggle(init: boolean) {
	let [value, set] = useState(init);
	let prop = {
		value, set,
		toggle: toggle(value, set)
	};
	return prop;
}

export function useWritable<T>(init_data: T) {
	let [value, set_value] = useState(init_data);
	let prop = {
		value: value,
		set: set_value,
		write: write_prop(set_value)
	};
	return prop;
}

let number_regex = /^(?:(?:\d+)|(?:\.\d+)|(?:\d+\.)|(?:\d+\.\d+))$/;

export function useWritableNumber(init_data: number) {
	let [value, set_value] = useState(init_data);
	let [str, set_str] = useState(init_data.toString());
	let prop = {
		str: str,
		value: value,
		set: set_str,
		correct: (newstr: any=str) => {
			if (typeof newstr !== "string") { newstr = str; }
			let str_proper = newstr.replace(/[^\d.,\s]/g, "");
			let val = newstr.replaceAll(",", ".").replaceAll(" ", "").replace(/[^\d.]/g, "")
			if (val.match(number_regex)) {
				set_value(+val);
				set_str(str_proper);
			} else {
				set_value(0);
				set_str("0");
			}
		},
		write: write_prop(set_str)
	};
	return prop;
}

export function useWritableWithToggle<T>(
	init_data: T,
	init_toggle: boolean
) {
	let [value, set_value] = useState(init_data);
	let [toggle_value, set_toggle] = useState(init_toggle);

	let prop = {
		value: value,
		set: set_value,
		write: write_prop(set_value),
		toggle_value: toggle_value,
		set_toggle: set_toggle,
		toggle: toggle(toggle_value, set_toggle)
	};

	return prop;
}

export function useLayout() {
	return useContext(LayoutContext);
}

export function useNodes() {
	return useContext(NodeContext);
}

type Func<P extends Parameters<any>=any, R=any> = (...args: P) => R;
type FuncFrom<T extends Func> = Func<Parameters<T>, ReturnType<T>>;

export function memoize<T extends Func>(fn: T): FuncFrom<T> {
	let cache: Record<string, ReturnType<T>> = {};

	return (...args: Parameters<T>) => {
		let args_str = JSON.stringify(args);
		if (cache[args_str]) {
			return cache[args_str] as ReturnType<T>;
		} else {
			let res = fn(...args);
			cache[args_str] = res;
			return res as ReturnType<T>;
		}
	};
}

export async function read_json_file(file: File) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();
		reader.onerror = reject;
		reader.onload = () => {
			let res = reader.result;
			if (typeof res !== "string") {
				reject();
				return;
			}

			try {
				resolve(JSON.parse(res));
			} catch(err) {
				reject(err);
			}
		}
		reader.readAsText(file);
	});
}

export async function download_blob(blob_url: string, filename: string) {
	let link = document.createElement("a");
	link.style.display = "none";
	link.href = blob_url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
}

export type Constructor<T> = (new (...args: any[]) => T) | ((...args: any[]) => T);

export function range(a: number=0, b: number=a) {
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

export function repeat_string(str: string, times: number) {
	return new Array(times).fill(str).join("");
}

export function is_nil(obj: any): obj is null {
	return obj === null || obj === undefined;
}

export function is_type<T>(obj: any, type_: Constructor<T>): obj is T {
	if (is_nil(obj)) { return false; }
	return obj.constructor === type_ || obj instanceof type_;
}

export function has_prop<S extends string>(obj: any, prop: S): obj is Record<S, any> {
	if (!obj) { return false; }
	if (typeof obj !== "object") { return false; }
	return prop in obj;
}

export function error_string(obj: any) {
	if (typeof obj === "string") {
		return obj;
	}

	if (has_prop(obj, "message")) {
		return obj.message;
	}

	if (!obj) {
		return null;
	}

	return String(obj);
}
