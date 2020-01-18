import "source-map-support/register";
import { DepGraph, DepGraphBuilder, PkgInfo } from "@snyk/dep-graph";
import * as os from "os";

export function parseLein(
  name: string,
  version: string,
  leinDepsTreeContent: string
): DepGraph {
  function parseLine(line: string) {
    return line
      .replace("[", "")
      .trimLeft()
      .split(" ")
      .slice(0, 2);
  }
  function calcDepth(line: string) {
    return (countSpaces(line) - 1) / 2;
  }

  return parseTextTree(
    name,
    version,
    leinDepsTreeContent,
    calcDepth,
    parseLine
  );
}

export function parseClojureDeps(
  name: string,
  version: string,
  depsEdnDepsTreeContent: string
): DepGraph {
  function parseLine(line: string) {
    return line.split(" ").slice(0, 2);
  }
  function calcDepth(line: string) {
    return countSpaces(line) / 2;
  }

  return parseTextTree(
    name,
    version,
    depsEdnDepsTreeContent,
    calcDepth,
    parseLine
  );
}

function parseTextTree(
  name: string,
  version: string,
  treeContent: string,
  calcDepth: (input: string) => number,
  parseLine: (line: string) => string[]
): DepGraph {
  const rootPackage: PkgInfo = { name, version };
  const depGraph = new DepGraphBuilder({ name: "clojure-deps" }, rootPackage);
  const parentsStack: string[] = [];
  for (const line of treeContent.trimRight().split(os.EOL)) {
    // count level of nesting
    const currentLevel = calcDepth(line);
    const trimmedLine = line.trimLeft(); // ASSUMPTION: depth is only whitespaces/tabs

    // go back in stack to the last parent of same level
    parentsStack.splice(currentLevel);

    // parse package and add it to the graph
    const [pkgName, pkgVersion] = parseLine(trimmedLine);
    const pkg: PkgInfo = { name: pkgName, version: pkgVersion };
    const currentNodeId = `${pkgName}@${pkgVersion}`;
    depGraph.addPkgNode(pkg, currentNodeId);
    if (currentLevel === 0) {
      depGraph.connectDep(depGraph.rootNodeId, currentNodeId);
    } else {
      depGraph.connectDep(parentsStack.slice(-1)[0], currentNodeId);
    }
    // save current node as potential parent
    parentsStack.push(currentNodeId);
  }

  return depGraph.build();
}

function countSpaces(input: string): number {
  let i = 0;
  while (input[i] === " ") {
    i++;
  }

  return i;
}
