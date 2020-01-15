import 'source-map-support/register';
import {DepGraph, DepGraphBuilder, PkgInfo} from "@snyk/dep-graph";
import * as os from "os";

export function parseClojureDeps(name: string, version: string, depsEdnContent: string): DepGraph {
  const rootPackage: PkgInfo = {name, version};
  const depGraph = new DepGraphBuilder({name: 'clojure-deps'}, rootPackage);
  const parentsStack: string[] = [];
  for (const line of depsEdnContent.trimRight().split(os.EOL)) {
    // count level of nesting
    const currentLevel = countSpaces(line) / 2;
    const trimmedLine = line.trimLeft();

    // go back in stack to the last parent of same level
    parentsStack.splice(currentLevel);

    // parse package and add it to the graph
    const [pkgName, pkgVersion] = trimmedLine.split(' ');
    const pkg: PkgInfo = {name: pkgName, version: pkgVersion};
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
  while (input[i] === ' ') {
    i++;
  }

  return i;
}
