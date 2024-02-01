
const res = await fetch("./config.json?test=" + Math.random()).then(res => res.json());
export default res