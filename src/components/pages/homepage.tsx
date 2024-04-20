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
        src="dev.near/widget/components.subfolder.my-nested-component"
        props={{ color: "green" }}
      />
    </>
  );
}
