var fs = require("fs");
const rootFiles = fs.readdirSync("/");
console.log(JSON.parse(fs.readFileSync("module.json", "utf8")).url + "/blob/master/" + rootFiles.filter((file) => file.toLowerCase().includes("changelog"))?.[0]);
