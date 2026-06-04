export function Header() {
  return (
    <box justifyContent="center" alignItems="center">
      <box
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        gap={0.5}
      >
        <ascii-font font="tiny" text="Flow" color="orange" />
        <ascii-font font="tiny" text="Code" />
      </box>
    </box>
  );
}
