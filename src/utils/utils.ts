import { RevAddress } from '@tgrospic/rnode-http-js';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
export type History = ReturnType<typeof useHistory>;

export type Unbox<T> = T extends PromiseLike<infer U> ? Unbox<U> : T;

export enum OPERATION {
	INITIAL,
	PENDING,
	DONE
};

export interface AccountData extends RevAddress { mnemonic?: string; };

export interface AccountType extends AccountData {
	username: string;
	password: string;
};

interface _LocallyStored {
	"private-key": string,
	"mnemonic": string,
	"user-list": AccountType[]
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

export function useWritable<T>(init_data: T) {
	let [value, set_value] = useState(init_data);
	let prop = {
		value: value,
		set: set_value,
		write: write_prop(set_value)
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
