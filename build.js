import fs from "fs";
import replaceInFiles from "replace-in-files";

const transpiledPathPrefix = ".bos/transpiled/src/npm_package_name";

async function build() {
  const network = process.env.NETWORK || "dev";
  const replacementsFile = `replacements.${network}.json`;

  console.log(`Reading configuration from ${replacementsFile} file`);

  if (!fs.existsSync(replacementsFile)) {
    console.error(`Error: ${replacementsFile} file not found.`);
    process.exit(1);
  }

  // Read the content of the .json file
  let replacements = JSON.parse(fs.readFileSync(replacementsFile, "utf8"));

  // iterate over each .jsx file to update replacements
  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /\$\{(REPL_[^}]*)\}/gm,
    to: (_match, variableName) => {
      const value = replacements[variableName];

      if (typeof value === "undefined") {
        console.warn(
          `Missing value in replacements file for ${variableName} key`
        );
        return _match;
      }

      return value;
    },
  });

  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /export\s+default\s+function[^(]*\((.*)/gms,
    to: (_match, rest) =>
      `function MainComponent(${rest}\nreturn MainComponent(props, context);`,
  });

  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /^export /gm,
    // NOTE: Empty string is ignored, so we use a function workaround it
    to: () => "",
  });

  // WARNING: Don't allow "imports" in includes as this may lead to undefined
  // behavior as replacements are done in parallel and one file may be getting
  // replacements saved while the other file needs to include it, which ends up
  // with empty content includes.
  await new Promise((resolve) => {
    fs.rename(
      `${transpiledPathPrefix}/includes`,
      `${transpiledPathPrefix}/../includes`,
      () => {
        resolve();
      }
    );
  });

  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /import .* from "@\/includes\/([^"]*)";/gm,
    to: (_match, importPath) => {
      const importedFileContent = fs.readFileSync(
        `${transpiledPathPrefix}/../includes/${importPath}.jsx`,
        "utf8"
      );
      return `/* INCLUDE: "includes/${importPath}.jsx" */\n${importedFileContent}/* END_INCLUDE: "includes/${importPath}.jsx" */`;
    },
  });

  const packageJson = JSON.parse(
    fs.readFileSync(new URL("./package.json", import.meta.url))
  );

  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /^/m,
    to: `/*\nLicense: ${packageJson.license}\nAuthor: ${packageJson.author}\nHomepage: ${packageJson.homepage}\n*/\n`,
  });

  await new Promise((resolve) => {
    fs.rename(
      transpiledPathPrefix,
      `${transpiledPathPrefix}/../${packageJson.name}`,
      () => {
        resolve();
      }
    );
  });

  console.log("DONE");
}

build();
