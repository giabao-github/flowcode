export function setTerminalBgColor(hex: string) {
  try {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
      console.warn(`Invalid hex color format: ${hex}`);
      return;
    }
    process.stdout.write(`\x1b]11;${hex}\x07`);
  } catch (error) {
    console.error("Error setting terminal background color:", error);
  }
}

export function resetTerminalBgColor() {
  try {
    process.stdout.write("\x1b]111\x07");
  } catch (error) {
    console.error("Error resetting terminal background color:", error);
  }
}
