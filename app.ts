import gs = GoogleAppsScript.Spreadsheet;

const getColumnIndexByName = (rows: any[][], columnName: string): number => {
  let index = rows[0].indexOf(columnName);
  if (index < 0) {
    throw new Error(`Can't find column index of '${columnName}'`);
  }
  return index;
};

interface AppProps {
  inputSheetName: string;
  inputColumnNames: {
    code: string;
    name: string;
    date: string;
    price: string;
    shares: string;
    fee: string;
    tax: string;
  };
}

const defaultAppProps: AppProps = {
  inputSheetName: "tw-transactions",
  inputColumnNames: {
    code: "代號",
    name: "名稱",
    date: "交易日期",
    price: "成交價",
    shares: "股數",
    fee: "交易手續費",
    tax: "交易稅",
  },
};

class App {
  readonly spreadsheet: gs.Spreadsheet;
  readonly props: AppProps;

  constructor(props: Partial<AppProps> = {}) {
    this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    this.props = { ...defaultAppProps, ...props };
  }

  private createTransactions = (): Model.Transaction[] => {
    const inputSheet = this.spreadsheet.getSheetByName(this.props.inputSheetName);
    if (inputSheet === null) {
      throw new Error(`Failed to get sheet '${this.props.inputSheetName}`);
    }

    const rows = inputSheet.getDataRange().getValues();

    let codeColIdx = getColumnIndexByName(rows, this.props.inputColumnNames.code);
    let nameColIdx = getColumnIndexByName(rows, this.props.inputColumnNames.name);
    let dateColIdx = getColumnIndexByName(rows, this.props.inputColumnNames.date);
    let priceColIdx = getColumnIndexByName(rows, this.props.inputColumnNames.price);
    let sharesColIdx = getColumnIndexByName(rows, this.props.inputColumnNames.shares);
    let feeColIdx = getColumnIndexByName(rows, this.props.inputColumnNames.fee);
    let taxColIdx = getColumnIndexByName(rows, this.props.inputColumnNames.tax);

    const transactions: Model.Transaction[] = [];

    rows.map((row) => {
      let code = row[codeColIdx];
      let name = row[nameColIdx];
      let date = new Date(row[dateColIdx]);
      let price = row[priceColIdx];
      let shares = row[sharesColIdx];
      let fee = row[feeColIdx];
      let tax = row[taxColIdx];

      transactions.push({ name, code, date, price, shares, fee, tax, label: "" });
    });

    return transactions;
  };

  private groupTransactionsByCode = (transactions: Model.Transaction[]): Model.TransactionGroup[] => {
    const groups: { [label: string]: Model.Transaction[] } = {};

    transactions.map((transaction) => {
      if (!(transaction.code in groups)) {
        groups[transaction.code] = [];
      }

      groups[transaction.code].push(transaction);
    });

    return Object.keys(groups).map((label) => new Model.TransactionGroup(label, groups[label]));
  };

  run = () => {
    const transactions = this.groupTransactionsByCode(this.createTransactions());
    Logger.log(transactions.length);
  };
}

export const run = (props: Partial<AppProps> = {}) => {
  new App(props).run();
};
