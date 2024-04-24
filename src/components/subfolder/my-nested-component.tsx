// With the setup in this repo (see package.json and build.js), you can import
// individual files from src/includes/ folder. They will be inlined here
// before publishing.
import { someFunction } from "@/includes/common";

interface Props {
  color?: "red" | "green";
}

export default function (props: Props) {
  if (!props.color) {
    return "No color is specified!";
  }

  return (
    <>
      <h2 style={{ color: props.color }}>Component color is {props.color}.</h2>
      <p> Let's see someFunction output: {someFunction()}</p>
      <p> Let's see actual value of REPL_TEST: {"${REPL_TEST}"}</p>
    </>
  );
}
