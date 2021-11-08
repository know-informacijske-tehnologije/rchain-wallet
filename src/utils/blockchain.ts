// shortname: bc
import { keccak256 } from "js-sha3";
import blake from "blakejs";
import { ec } from "elliptic";
import base58 from "bs58";
import * as bip39 from "bip39";
import * as eth_util from "ethereumjs-util";
import * as eth_wallet from "ethereumjs-wallet";
import { ethDetected, ethereumAddress } from "@tgrospic/rnode-http-js";
import { PublicWallet, PrivateWallet, MetaMaskWallet } from "./utils";

const Wallet = eth_wallet.default;
const eth = { util: eth_util, wallet: eth_wallet.default, hdkey: eth_wallet.hdkey };
const secp256k1 = new ec("secp256k1");
const prefix = { coinId: "000000", version: "00" } as const;

export const generate_mnemonic = bip39.generateMnemonic;

export function bytes_from_hex(hex_str: string): Uint8Array {
	let bytes = new Uint8Array(hex_str.length / 2);
	for (let i = 0; i < bytes.length; i++) {
		let pair = hex_str.substr(i*2, 2);
		bytes[i] = parseInt(pair, 16) || 0;
	}
	return bytes;
}

export function hex_from_bytes(bytes: Uint8Array) {
	let hex = "";
	for (let i = 0; i < bytes.length; i++) {
		hex += (bytes[i] >>> 4).toString(16);
		hex += (bytes[i] & 0xf).toString(16);
	}
	return hex;
}

function base58_from_hex(hex_str: string) {
	return base58.encode(bytes_from_hex(hex_str));
}

export function decode_base58(str: string) {
	try {
		return base58.decode(str);
	} catch {
		return undefined;
	}
}

export function create_blob(obj: any, mime?: string) {
	const str = typeof obj !== "string" ? JSON.stringify(obj) : obj;
	const blob = new Blob([str], { type: mime });
	return window.URL.createObjectURL(blob);
}

export interface KeystoreFile {
	blobUrl: string;
	name: string;
};

export async function create_keystore(password: string) {
	if (!password || password === '') { return null; }

	const wallet = Wallet.generate();
	const res = await wallet.toV3(password, {
		kdf: 'scrypt',
		n: 131072
	});

	return {
		blobUrl: create_blob(res),
		name: wallet.getV3Filename()
	} as KeystoreFile;
}

export async function generate_keystore(pkey: string, password: string) {
	if (!password || password === '') { return null; }

	if (!pkey.startsWith("0x")) { pkey = "0x" + pkey; }
	let buf: Buffer;
	try {
		buf = eth.util.toBuffer(pkey);
	} catch {
		return null;
	}

	const wallet = Wallet.fromPrivateKey(buf);
	const res = await wallet.toV3(password, {
		kdf: 'scrypt',
		n: 131072
	});

	return {
		blobUrl: create_blob(res),
		name: wallet.getV3Filename()
	};
}

async function unlock_keystore(
	file: Record<string, any>,
	password: string
) {
	const normalized: Record<string, any> = {};
	Object.keys(file).forEach(key => {
		normalized[key.toLowerCase()] = file[key];
	});

	try {
		if (normalized.encseed != null) {
			return Wallet.fromEthSale(normalized as any, password);
		}

		if (normalized.Crypto != null || normalized.crypto != null) {
			return await Wallet.fromV3(normalized as any, password, true);
		}
	} catch {
		return null;
	}

	return null;
}

export async function get_account_from_keystore(
	file: {[member: string]: any},
	password: string
) {
	const unlocked = await unlock_keystore(file, password);
	if (!unlocked) { return null; }
	const pkey = unlocked.getPrivateKeyString();

	return get_account_from_private_key(pkey);
}

function get_account_from_eth(eth_addr: string): PublicWallet | null {
	if (!eth_addr) { return null; }
	eth_addr = eth_addr.replace(/^0x/, "");
	if (eth_addr.length !== 40) { return null; }

	const eth_hash = keccak256(bytes_from_hex(eth_addr));
	const payload = `${prefix.coinId}${prefix.version}${eth_hash}`;
	const checksum = blake.blake2bHex(bytes_from_hex(payload), undefined, 32).slice(0, 8);

	let rev_addr = base58_from_hex(`${payload}${checksum}`);
	return {
		revAddr: rev_addr,
		ethAddr: eth_addr
	};
}

export async function get_account_from_metamask() {
	if (!ethDetected) { return null; }
	try {
		let eth_addr = await ethereumAddress();

		let acc = get_account_from_eth(eth_addr);
		if (!acc) { return null; }

		let mm_acc: MetaMaskWallet = { ...acc, ethAddr: eth_addr, is_metamask: true };
		return mm_acc;
	} catch (err) {
		console.log(err);
		return null;
	}
}

export function get_account_from_public_key(pub_key: string) {
	if (!pub_key) { return null; }

	pub_key = pub_key.replace(/^0x/, "");

	if (pub_key.length !== 130) { return null; }

	const pub_key_bytes = bytes_from_hex(pub_key).slice(1);
	const pub_key_hash = keccak256(pub_key_bytes).slice(-40);

	const acc = get_account_from_eth(pub_key_hash);
	return acc;
}

interface HDKey {
	_privateKey: Buffer;
	_publicKey: Buffer;
};

function get_hdkey(key: eth_wallet.hdkey): HDKey {
	// @NOTE: Probably should find a cleaner way of doing this.
	// Using private api could break at any point...
	return key["_hdkey"];
}

export function get_account_from_mnemonic(mnemonic: string): PrivateWallet | null {
	let seed = bip39.mnemonicToSeedSync(mnemonic);
	let hd_wallet = eth.hdkey.fromMasterSeed(seed);
	let key = hd_wallet.derivePath("m/44'/60'/0'/0/0");
	let hdkey = get_hdkey(key);
	let private_key = eth.util.bufferToHex(hdkey._privateKey);

	const acc = get_account_from_private_key(private_key);
	if (!acc) { return null; }

	return {
		...acc,
		mnemonic: mnemonic
	};
}

export function get_account_from_private_key(private_key: string): PrivateWallet | null {
	if (!private_key) { return null; }
	private_key = private_key.replace(/^0x/, "");
	if (private_key.length !== 64) { return null; }

	const key = secp256k1.keyFromPrivate(private_key);
	const pub_key = key.getPublic('hex');
	const addr = get_account_from_public_key(pub_key);

	if (!addr) { return null; }
	return {
		pubKey: pub_key,
		privKey: private_key,
		ethAddr: addr.ethAddr,
		revAddr: addr.revAddr,
	};
}

export function is_valid_rev_address(rev_addr: string): boolean {
	const rev_bytes = decode_base58(rev_addr);
	if (!rev_bytes) { return false; }

	const rev_hex = hex_from_bytes(rev_bytes);
	const payload = rev_hex.slice(0, -8);
	const checksum = rev_hex.slice(-8);

	const payload_bytes = bytes_from_hex(payload);
	const checksum_calc = blake.blake2bHex(payload_bytes, undefined, 32).slice(0, 8);

	return checksum === checksum_calc;
}

export function is_valid_private_key(private_key: string) {
	try {
		if (eth.util.isValidPrivate(eth.util.toBuffer(private_key))) {
			return private_key;
		}
	} catch {
		let private_key_with_hex = eth.util.addHexPrefix(private_key);
		if (eth.util.isValidPrivate(eth.util.toBuffer(private_key))) {
			return private_key_with_hex;
		}
	}

	return "";
}

export function is_valid_mnemonic(phrase: string) {
	return bip39.validateMnemonic(phrase);
}

export function create_account() {
	const key = secp256k1.genKeyPair();
	const private_key = key.getPrivate('hex');
	return get_account_from_private_key(private_key);
}

export function get_account(text: string) {
	const val = text.replace(/^0x/, '').trim();
	const is_rev = is_valid_rev_address(val);
	if (is_rev) {
		return {
			revAddr: val,
		};
	}

	const from_private = get_account_from_private_key(val);
	if (from_private) {
		return from_private;
	}

	const from_public  = get_account_from_public_key(val);
	if (from_public) {
		return from_public;
	}

	const from_eth = get_account_from_eth(val);
	if (from_eth) {
		return from_eth;
	}

	return null;
}
