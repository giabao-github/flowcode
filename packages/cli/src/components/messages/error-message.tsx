import { useTheme } from "../../providers/theme";
import { EmptyBorder } from "../border";

type Props = {
  message: string;
};

export function ErrorMessage({ message }: Props) {
  const { colors } = useTheme();

  return (
    <box width="100%" alignItems="center">
      <box
        width="100%"
        border={["left"]}
        borderColor={colors.error}
        customBorderChars={{
          ...EmptyBorder,
          vertical: "┃",
          bottomLeft: "╹",
        }}
      >
        <box
          width="100%"
          justifyContent="center"
          paddingX={2}
          paddingY={1}
          backgroundColor={colors.surface}
        >
          <text fg={colors.error}>{message}</text>
        </box>
      </box>
    </box>
  );
}
