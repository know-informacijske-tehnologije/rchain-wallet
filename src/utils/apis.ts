export namespace RevDefine {
    export interface PageInfo {
      totalPage: number;
      currentPage: number;
    }

    export interface Transaction {
      transactionType: string;
      fromAddr: string;
      toAddr: string;
      amount: number;
      blockHash: string;
      blockNumber: number;
      deployId: string;
      timestamp: number;
      isFinalized: boolean;
      isSucceeded: boolean;
      reason: string;
    }

    export interface TransactionsResponse {
      transactions: Transaction[];
      pageInfo: PageInfo;
    }

    const api_url = "https://revdefine.io/define/api";

    export async function transactions(rev_addr: string, page=1, rows=20) {
      let res = await fetch(`${api_url}/transactions/${rev_addr}/transfer?rowsPerPage=${rows}&page=${page}`);
      let data: TransactionsResponse = await res.json();
      return data.transactions;
    }
}

export namespace CoinGecko {
    const api_url = "https://api.coingecko.com/api/v3";
    let last_price: null|number = null;

    export interface PriceResponse {
        rchain: { usd: number }
    }

    export async function price() {
        if (last_price !== null) { console.log("LAST PRICE", last_price); return last_price; }
        let res = await fetch(`${api_url}/simple/price?ids=rchain&vs_currencies=usd`);
        let data: PriceResponse = await res.json();
        last_price = data.rchain.usd;
        return data.rchain.usd;
    }
}
