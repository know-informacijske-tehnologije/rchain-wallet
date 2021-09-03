import { useState } from 'react';
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

export function wallet_is_private(obj: any): obj is PrivateWallet {
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
