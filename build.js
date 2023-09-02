const fs = require("fs");
const replaceInFiles = require("replace-in-files");

const packageJson = require('./package.json');

const transpiledPathPrefix = ".bos/transpiled/src/npm_package_name";

async function build() {
  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /export\s+default\s+function[^(]*\((.*)/gms,
    to: (_match, rest) => `function MainComponent(${rest}\nreturn MainComponent(props, context);`,
  });

  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /^export /,
    // NOTE: Empty string is ignored, so we use a function workaround it
    to: () => ''
  })
  
  // WARNING: Don't allow "imports" in includes as this may lead to undefined
  // behavior as replacements are done in parallel and one file may be getting
  // replacements saved while the other file needs to include it, which ends up
  // with empty content includes.
  await new Promise((resolve) => {
    fs.rename(`${transpiledPathPrefix}/includes`, `${transpiledPathPrefix}/../includes`, () => { resolve() });
  });
  
  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /import .* from "@\/includes\/([^"]*)";/gms,
    to: (_match, importPath, a, b, c) => {
      const importedFileContent = fs.readFileSync(
        `${transpiledPathPrefix}/../includes/${importPath}.jsx`,
        "utf8"
      );
      console.log(c, _match, importPath, importedFileContent)
      return `/* INCLUDE: "includes/${importPath}.jsx" */\n${importedFileContent}/* END_INCLUDE: "includes/${importPath}.jsx" */`;
    },
  });

  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /^/m,
    to: `/*\nLicense: ${packageJson.license}\nAuthor: ${packageJson.author}\nHomepage: ${packageJson.homepage}\n*/\n`,
  })

  await new Promise((resolve) => {
    fs.rename(transpiledPathPrefix, `.bos/transpiled/src/${packageJson.name}`, () => { resolve() });
  });

  console.log("DONE");
}

build();
