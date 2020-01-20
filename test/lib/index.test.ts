import { parseClojureDeps, parseLein } from "../../lib";
import * as path from "path";
import * as fs from "fs";
import { createFromJSON, DepGraphData } from "@snyk/dep-graph";

test("Valid Clojure deps tree parsing", async () => {
  const validTreeContent = fs.readFileSync(
    path.resolve(__dirname, "../fixtures/valid-tree"),
    "utf-8"
  );
  const fixtureDepGraphContent = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../fixtures/valid-tree-dep-graph.json"),
      "utf-8"
    )
  ) as DepGraphData;
  const resDepGrah = parseClojureDeps("testing", "0.0.1", validTreeContent);
  const fixtureDepGraph = createFromJSON(fixtureDepGraphContent);

  expect(resDepGrah.equals(fixtureDepGraph)).toBeTruthy();
});

test("Valid lein deps tree parsing", async () => {
  const validTreeContent = fs.readFileSync(
    path.resolve(__dirname, "../fixtures/lein-tree"),
    "utf-8"
  );
  const fixtureDepGraphContent = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../fixtures/valid-lein-tree-dep-graph.json"),
      "utf-8"
    )
  ) as DepGraphData;
  const resDepGrah = parseLein("testing", "0.0.87", validTreeContent);
  const fixtureDepGraph = createFromJSON(fixtureDepGraphContent);
  expect(resDepGrah.equals(fixtureDepGraph)).toBeTruthy();
});
