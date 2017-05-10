/**
 * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * @returns {string}
 */
export function mm_uid() {
    let s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toLowerCase();
    //return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    return s4() + s4(); // would be enough for this demo
}


/**
 * Returns a random number between min and max
 * @param min
 * @param max
 * @returns {*}
 */
export function mm_getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min and max
 * @param min
 * @param max
 * @returns {*}
 */
export function mm_getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * credit: somewhere I don't remember...
 * @param number
 * @param decimals
 * @param decimalSep
 * @param thousandSep
 * @returns {string}
 */
export function mm_formatMoney(number, decimals, decimalSep, thousandSep) {
    let n = number;
    let c = decimals;
    let d = decimalSep;
    let t = thousandSep;

    c = isNaN(c = Math.abs(c)) ? 2 : c; // number of decimals
    d = d === undefined ? "." : d;       // decimal separator
    t = t === undefined ? " " : t;       // thousands separator
    let s = n < 0 ? "-" : "";           // sign
    let i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "";
    let j = i.length;
    j = j > 3 ? j % 3 : 0;

    return (
        s
        + (j ? i.substr(0, j) + t : "")
        + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t)
        + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "")
    );
}