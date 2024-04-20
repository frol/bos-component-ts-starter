import { rename } from "fs/promises";
import { readFileSync } from "fs";
import replaceInFiles from "replace-in-files";
import { colorize } from "colorize-node";
import { relative } from "path";
import { exit } from "process";

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

  // Check for default exports in includes
  await replaceInFiles({
    files: [`${transpiledPathPrefix}/../includes/**/*.jsx`],
    from: /^export default function\s?([^(]*)/gm,
    to: (match, defaultFunctionName, _num, _text, filePath) => {
      const relativeFilePath = relative(".bos/transpiled", filePath);
      console.warn(
        colorize.yellow(
          `Using default exports for utils functions isn't recommended as it may cause unexpected import issues - please replace "export default function ${defaultFunctionName}" with "export function ${defaultFunctionName}" in the "${relativeFilePath}" file`
        )
      );

      return match;
    },
  });

  // check for exports across the whole project
  await replaceInFiles({
    files: [
      `${transpiledPathPrefix}/**/*.jsx`,
      `${transpiledPathPrefix}/../includes/**/*.jsx`,
    ],
    from: /^export .* from ".*";/gm,
    to: (match, _num, _text, filePath) => {
      const relativeFilePath = relative(".bos/transpiled", filePath);
      console.error(
        colorize.redBright(
          `Exports aren't allowed as this may lead to undefined behavior - please remove '${match}' in the '${relativeFilePath}' file`
        )
      );

      exit(1);
    },
  });

  // check for import in includes
  await replaceInFiles({
    files: [`${transpiledPathPrefix}/../includes/**/*.jsx`],
    from: /^import .* from ".*";/gm,
    to: (match, _num, _text, filePath) => {
      const relativeFilePath = relative(".bos/transpiled", filePath);
      console.error(
        colorize.redBright(
          `Imports in includes aren't allowed as this may lead to undefined behavior - please remove "${match}" in the "${relativeFilePath}" file`
        )
      );

      exit(1);
    },
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
