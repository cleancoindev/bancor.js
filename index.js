let supply = 0;
let reserve_supply = 500;
let connector_balance = 0;
let reserve_balance = 10000;
let f = 0.5;

let Bancor = require('./bancor');
let bancor = Bancor(supply, reserve_supply, connector_balance, reserve_balance, f);

bancor.buy(10000);
bancor.sell(100);
bancor.issue(30);
bancor.retire(10);
bancor.unlock(100);
bancor.exshare(10);
bancor.printn();