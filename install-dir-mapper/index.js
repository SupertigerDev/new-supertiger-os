const glob = require("fast-glob")
const path = require("path")
const fs = require("fs/promises");

const main = async () => {
  const paths = await glob("../install-files/**")
  const transformedPaths = paths.map((p) => ({
    path: path.relative("../install-files", p).replace(/\\/g, "/"),
    name: path.basename(p)
  }));
  await fs.writeFile("../install-map.json", JSON.stringify(transformedPaths))
}


main()