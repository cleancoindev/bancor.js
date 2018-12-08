var AsciiTable = require('asciitable');
let b = require('./util');

function Bancor(s, s_locked, r, r_locked, f, precision, useBignumber) {
    let fp = 17;
    let rp = Math.pow(10, 4);
    let p = precision ? Math.pow(10, precision) : Math.pow(10, 4);

    var table = new AsciiTable('Bancor');
    table.setHeading(['action', 'supply', 'price', 'connector_balances', 'reserve_supply', 'reserve_balances', 'cw', 'vars']);
    table.addRow('origin', (s), price(), (r), s_locked, r_locked, f, "");

    function buy(e) {
        var t = (s + s_locked) * (Math.pow(1 + e / (r + r_locked), f) - 1);
        // var t = b["*"]((b["+"](s, s_locked)), b["-"]((Math.pow(b["+"](1, b["/"](e, (b["+"](r, r_locked)))), f)), 1));

        r += e;
        // r = Number(b["+"](r, e));

        t = Math.floor(t * p) / p;

        s += t;
        // s = Number(b["+"](s, t));

        r = Math.floor(r * rp) / rp;
        s = Math.floor(s * p) / p;
        market("buy", e, {
            t: t
        });
        return t;
    }

    function sell(t) {
        var e = (r + r_locked) * (1 - Math.pow(1 - t / (s + s_locked), 1 / f));
        // var e = b["*"]((b["+"](r, r_locked)), b["-"](1, Math.pow(b["-"](1, b["/"](t, b["+"](s, s_locked))), b["/"](1, f))));

        e = Math.floor(e * rp) / rp;

        r -= e;
        s -= t;
        // r = Number(b["-"](r, e));
        // s = Number(b["-"](s, t));

        r = Math.floor(r * rp) / rp;
        s = Math.floor(s * p) / p;
        market("sell", t, {
            e: e
        });
        return e;
    }

    function price() {
        let res = (r + r_locked) / ((s + s_locked) * f);
        return res;
    }

    function exshare(e) {
        var r_sum = r + r_locked + e;
        f = (r_sum) / (r + r_locked) * f;

        var _r = r_sum - r_locked;

        var t = (s + s_locked) * (1 - Math.pow((1 - _r / r_sum), f));

        var old_s_locked = s_locked;
        var old_s = s;
        s_locked = Math.round((s + s_locked - t) * p) / p;
        s = Math.round(t * p) / p;
        r += e;

        market("exshare", e, {
            "项目方锁仓通证": Math.round((s_locked - old_s_locked) * p) / p,
            "项目方流通通证": Math.round((t - old_s) * p) / p,
        });
    }

    function unlock(t) {
        var e0 = r_locked * (1 - Math.pow(1 - t / s_locked, 1 / f));
        // var e0 = b["*"](r_locked, b["-"](1, Math.pow(b["-"](1, b["/"](t, s_locked)), b["/"](1, f))));
        e0 = Math.ceil(e0 * p) / p;

        s_locked -= t; // 锁仓通证
        s += t; // 流通通证
        r_locked -= e0; // 锁仓保证金
        r += e0; // 流通保证资金

        r = Math.round(r * rp) / rp;
        r_locked = Math.round(r_locked * rp) / rp;
        market("unlock", t, {
            "项目方需要填充保证金": e0,
        });
    }

    // 销毁 t
    function retire(t) {
        f = (s + s_locked) / ((s + s_locked) - t) * f;
        // f = b["/"]((b["+"](s, s_locked)), (b["*"](b["-"](b["+"](s, s_locked), t), f)));

        let e = r;
        var t0 = ((s + s_locked) - t) * (1 - Math.pow((1 - e / (r + r_locked)), f));
        // var t0 = b["*"]((b["+"](s, s_locked)), b["-"](1, Math.pow(b["-"](1, b["/"](e, (b["+"](r, r_locked)))), f)));

        t0 = Math.round(t0 * p) / p;

        var t1 = s_locked + t0 - ((s + s_locked) - t);
        // var t1 = b["-"](b["+"](s_locked, t0), (b["-"](b["+"](s, s_locked), t)));

        t1 = Math.round(t1 * p) / p;

        s = s + t1 - t;
        // s = b["-"](b["+"](s, t1), t);

        s_locked -= t1;
        // s_locked = b["-"](s_locked, t1);

        s = Math.round(s * p) / p;
        s_locked = Math.floor(s_locked * p) / p;
        market("retire", t, {
            t0: t0,
            t1: t1,
            "t1 - t": (t1 - t).toFixed(4)
        });
    }

    // 增发 t
    function issue(t) {
        var e = r;
        var supply = ((s + s_locked) + t);
        // var supply = b["+"](b["+"](s, s_locked), t);

        f = (s + s_locked) / supply * f;
        // f = b["*"](b["/"](b["+"](s, s_locked), supply), f);

        f = (f * Math.pow(10, fp)) / Math.pow(10, fp);

        var t0 = supply * (1 - Math.pow((1 - e / (r + r_locked)), f));
        // var t0 = b["*"](supply, b["-"](1, Math.pow(b["-"](1, b["/"](e, b["+"](r, r_locked))), f)));

        t0 = Math.round(t0 * p) / p;

        var t1 = s_locked;

        let newsupply = s + t + s_locked;
        // let newsupply = b["+"](b["+"](s, t), s_locked);

        s = t0;
        s_locked = newsupply - s;

        t1 = s_locked - t1;
        t1 = Math.round(t1 * p) / p;
        // s_locked = b["-"](newsupply, s);

        market("issue", t, {
            t0: t0,
            t1: t1,
            "t - t1": (t - t1).toFixed(Math.pow(10, 1 / p))
        });
        return 10;
    }

    function market(fname, param, others) {
        let action = fname ? `${fname}:${param}` : "origin";
        others = others ? JSON.stringify(others) : "";
        others = others.replace("{", "");
        others = others.replace("}", "");
        others = others.replace(",", "; ");
        others = others.replace(/"/g, "")

        // table.addRow(action, (s).toFixed(precision), price().toFixed(precision), (r).toFixed(precision), s_locked.toFixed(precision), r_locked, f, others);
        table.addRow(action, (s), price().toFixed(4), (r), s_locked, r_locked, f, others);
    }

    return {
        buy: buy,
        sell: sell,
        price: price,
        unlock: unlock,
        retire: retire,
        issue: issue,
        exshare: exshare,
        market: market,
        printn: () => {
            console.notice(table.toString());
        },
        printw: () => {
            console.warn(table.toString());
        }
    }
}

module.exports = Bancor;