namespace Model {
  export interface Transaction {
    name: string;
    code: string;
    date: Date;
    price: number;
    shares: number;
    fee: number;
    tax: number;
    label: string;
  }

  export class TransactionGroup {
    readonly label: string;
    readonly transactions: ReadonlyArray<Transaction>;

    constructor(label: string, transactions: ReadonlyArray<Transaction>) {
      this.label = label;
      this.transactions = transactions;
    }
  }
}
