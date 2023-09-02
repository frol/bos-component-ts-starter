import { someFunction } from "@/includes/common";

interface Props {
  color?: "red" | "green";
}

export default function (props: Props) {
  if (!props.color) {
    return "No color is specified!";
  }

  return (
    <h2 style={{ color: props.color }}>
      Component color is {props.color}. Let's see someFunction output:{" "}
      {someFunction()}
    </h2>
  );
}
