import { keccak256 } from "js-sha3";
import blake from "blakejs";
import { ec } from "elliptic";
import base58 from "bs58";
import * as bip39 from "bip39";
import * as eth_util from "ethereumjs-util";
import * as eth_wallet from "ethereumjs-wallet";
import { get_local, AccountData } from "./utils";

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

function get_account_from_eth(eth_addr: string): AccountData | null {
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

export function get_account_from_public_key(pub_key: string): AccountData | null {
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
	// @TODO: ethereumjs-wallet does not include the type of the HDKey.
	// Instead, it is typed as "any". The above interface
	// and this function are a temporary measure to mitigate this.
	// The properties of the _hdkey object can be seen at
	// https://github.com/cryptocoinjs/hdkey, in hdkey/lib/hdkey.js,
	// if more needs to be exposed.
	// @TODO: Might be worth it to get rid of ethereumjs-wallet, as we
	// currently only use it when working with mnemonics.
	return key["_hdkey"];
}

export function get_account_from_mnemonic(mnemonic: string): AccountData | null {
	let seed = bip39.mnemonicToSeedSync(mnemonic);
	let hd_wallet = eth.hdkey.fromMasterSeed(seed);
	let key = hd_wallet.derivePath("m/44'/60'/0'/0/0");
	let hdkey = get_hdkey(key);

	let private_key = eth.util.bufferToHex(hdkey._privateKey);
	let public_key = eth.util.bufferToHex(hdkey._publicKey);

	const eth_address_buffer = eth.util.pubToAddress(hdkey._publicKey, true);
	const eth_addr_hex = eth_address_buffer.toString('hex');
	const to_checksum = eth_addr_hex.startsWith('0x') ? eth_addr_hex : '0x' + eth_addr_hex;
	const eth_addr = eth.util.toChecksumAddress(to_checksum);

	const acc = get_account_from_eth(eth_addr);
	if (!acc) { return null; }

	return {
		...acc,
		privKey: private_key,
		pubKey: public_key
	};
}

export function get_account_from_private_key(private_key: string): AccountData | null {
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

export function create_account(): AccountData | null {
	const key = secp256k1.genKeyPair();
	const private_key = key.getPrivate('hex');
	return get_account_from_private_key(private_key);
}

export function get_restore_account(): AccountData | null {
	let mnemonic = get_local('mnemonic');
	let private_key = get_local('private-key');

	if (mnemonic !== null) {
		return get_account_from_mnemonic(mnemonic);
	} else if (private_key !== null) {
		return get_account_from_private_key(private_key);
	} else {
		return null;
	}
}

export function get_account(text: string): AccountData | null {
	const val = text.replace(/^0x/, '').trim();
	const is_rev = is_valid_rev_address(val);
	if (is_rev) {
		return { revAddr: val };
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
