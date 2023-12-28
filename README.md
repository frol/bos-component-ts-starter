# TypeScript Starter Project for NEAR BOS

[NEAR BOS (Blockchain OS)](https://docs.near.org/bos/) is an excellent foundation for decentralized front-end apps.
Since BOS expects JSX to run, I always wanted to bring it to another level with TypeScript support.

Here is a TSX BOS component (you can also find it in [`src/components/pages/homepage.tsx`](https://github.com/frol/bos-component-ts-starter/blob/main/src/components/pages/homepage.tsx)):

```tsx
// Welcome to the home page of the first TypeScript BOS component!

// TypeScript! Yay!
interface Props {
  customWelcomeMessage?: string;
}

// Just create a default export function (no need to `return` it, see `.bos`
// folder after `npm run build` if you want to understand what is happening)
export default function (props: Props, context: BosContext) {
  return (
    <>
      <h1>
        {props.customWelcomeMessage ??
          "Welcome to the home page of the first TypeScript BOS component"}
        , {context.accountId ?? "anonymous user"}
      </h1>
      <p>
        Learn more at{" "}
        <a href="https://github.com/frol/bos-component-ts-starter">
          BOS Component TypeScript Starter repo
        </a>
      </p>
      <Widget
        src="frol.near/widget/bos-component-ts-starter.components.subfolder.my-nested-component"
        props={{ color: "green" }}
      />
    </>
  );
}
```

This is a preconfigured project that puts things together:

* [sucrase](https://sucrase.io/) is the heart of this starter project that transpiles TSX syntax to JSX
* [near-social-vm-types](https://www.npmjs.com/package/near-social-vm-types) defines BOS VM API as TypeScript types
* [bos CLI](https://bos.cli.rs) helps to deploy local files all at once to [SocialDB](https://github.com/NearSocial/social-db) (use [`npm run deploy`](https://github.com/frol/bos-component-ts-starter/blob/beb7e6722c46dc53282c9e42b5388fe4ad16819e/package.json#L18))
* [prettier](https://prettier.io/) helps to keep the code nicely formatted (use [`npm run fmt` and `npm run fmt:check`](https://github.com/frol/bos-component-ts-starter/blob/beb7e6722c46dc53282c9e42b5388fe4ad16819e/package.json#L14-L15))

You can also find several auxiliary files in this repo:

* [`build.js`](https://github.com/frol/bos-component-ts-starter/blob/main/build.js) handles several useful features:
  * [X]  automatically returns the `export default function` as BOS component, so you don't need to have a free-standing `return <MyComponent props={props} />` statement at the end of your file.
  * [X]  mimics standard `import ... from ...` syntax for files saved in `src/includes/` folder (see how to use imports [here](https://github.com/frol/bos-component-ts-starter/blob/main/src/components/subfolder/my-nested-component.tsx))
  * [X]  automatically adds license, author, and homepage link from package.json to the headers of each BOS component
* [`tsconfig.json`](https://github.com/frol/bos-component-ts-starter/blob/main/tsconfig.json) is used by VS Code to properly resolve types and project structure
* [`global.d.ts`](https://github.com/frol/bos-component-ts-starter/blob/main/global.d.ts) is used to inject types of `<Widget>` and `BosContext`, and ignore non-existing React dependency.

Putting all those pieces together, a fully working starter project in TypeScript was born.
If you develop in VS Code, it should properly highlight issues with types now, and allow you to define your own types to ensure consistency of your code-base.
Please, [report any problems](https://github.com/frol/bos-component-ts-starter/issues) with VS Code or your editor of choice and contribute fixed by proposing pull requests.

## How to run locally

Learn about [BOS-LOADER](https://docs.near.org/bos/dev/bos-loader) more

1. Change devgovgigs.near to your account name in `package.json`
   `"dev": "~/.cargo/bin/bos-loader devgovgigs.near --path ./.bos/transpiled/src",`
2. Open https://near.org/flags, and set the loader URL to http://127.0.0.1:3030
3. Run `yarn build`
4. Then run `yarn dev`
5. Open `https://near.org/<youraccount.near>/widget/<component name>` (case sensitive)
   For example `https://near.org/devgovgigs.near/widget/bos-component-ts-starter.components.pages.homepage`
6. Make changes to the component's code. Repeate steps 2-5 to see the changes.

## How to Use

Learn about [BOS](https://docs.near.org/bos/), and consider building your first components without this starter project as it will be easier to get started with an in-browser playground.
Once you are ready to build a complex app on BOS using TypeScript:

1. Fork this project
2. Install dependencies: `npm install`
3. Edit components
4. Deploy: `npm run deploy` - [bos CLI](https://bos.cli.rs) will interactively ask for the details like which account you want to deploy the components to and how to sign the transaction

## Troubleshooting

[`npm run build`](https://github.com/frol/bos-component-ts-starter/blob/beb7e6722c46dc53282c9e42b5388fe4ad16819e/package.json#L17) command will create `.bos` folder in the root of the project, and you can inspect the generated JSX code there.

## License

This repository is distributed under the terms of the MIT license. See [LICENSE-MIT](LICENSE-MIT) for details.
