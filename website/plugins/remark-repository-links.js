import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { visit } from "unist-util-visit";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

// Keep relative source links useful in GitHub Markdown and in the rendered site.
export default function remarkRepositoryLinks({ repositoryUrl, revision }) {
  return (tree, file) => {
    visit(tree, ["link", "definition"], (node) => {
      if (!node.url.startsWith("../")) return;
      const target = new URL(node.url, "https://repository.invalid/docs/");
      const relativePath = decodeURIComponent(target.pathname).slice(1);
      if (relativePath.startsWith("docs/")) return;
      const sourcePath = path.join(repositoryRoot, relativePath);
      let source;
      try {
        source = statSync(sourcePath);
      } catch {
        file.fail(`Repository link target does not exist: ${node.url}`, node);
      }
      const kind = source.isDirectory() ? "tree" : "blob";
      node.url = `${repositoryUrl}/${kind}/${revision}${target.pathname}${target.hash}`;
    });
  };
}
