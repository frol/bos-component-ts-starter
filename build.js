import { rename } from "fs/promises";
import { readFileSync } from "fs";
import replaceInFiles from "replace-in-files";

const transpiledPathPrefix = ".bos/transpiled/src";

async function build() {
  // WARNING: Don't allow "imports" in includes as this may lead to undefined
  // behavior as replacements are done in parallel and one file may be getting
  // replacements saved while the other file needs to include it, which ends up
  // with empty content includes.
  await rename(
    `${transpiledPathPrefix}/includes`,
    `${transpiledPathPrefix}/../includes`
  );

  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /export\s+default\s+function[^(]*\((.*)/gms,
    to: (_match, rest) =>
      `function MainComponent(${rest}\nreturn MainComponent(props, context);`,
  });

  await replaceInFiles({
    files: [`${transpiledPathPrefix}/../includes/**/*.jsx`],
    from: /^export.*function/gm,
    to: "function",
  });

  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /import .* from "@\/includes\/([^"]*)";/gm,
    to: (_match, importPath) => {
      const importedFileContent = readFileSync(
        `${transpiledPathPrefix}/../includes/${importPath}.jsx`,
        "utf8"
      );
      return `/* INCLUDE: "includes/${importPath}.jsx" */\n${importedFileContent}/* END_INCLUDE: "includes/${importPath}.jsx" */`;
    },
  });

  const packageJson = JSON.parse(
    readFileSync(new URL("./package.json", import.meta.url)).toString()
  );

  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /^/m,
    to: `/*\nLicense: ${packageJson.license}\nAuthor: ${packageJson.author}\nHomepage: ${packageJson.homepage}\n*/\n`,
  });

  console.log("DONE");
}

build();
