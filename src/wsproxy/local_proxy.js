const DEBUG = process.env.DEBUG|| false;
const port = process.env.PORT|| 5050;
let web = null;
console.log("unpacked");
web = require('./web');
web("0.0.0.0", port, "http://localhost");
