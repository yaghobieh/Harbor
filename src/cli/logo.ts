const STOPS: Array<[number, number, number]> = [
  [232, 121, 249],
  [192, 38, 211],
  [124, 58, 237],
];

export const HARBOR_LOGO = `
██╗  ██╗ █████╗ ██████╗ ██████╗  ██████╗ ██████╗
██║  ██║██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
███████║███████║██████╔╝██████╔╝██║   ██║██████╔╝
██╔══██║██╔══██║██╔══██╗██╔══██╗██║   ██║██╔══██╗
██║  ██║██║  ██║██║  ██║██████╔╝╚██████╔╝██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝
`;

function colorAt(t: number): string {
  const scaled = Math.min(1, Math.max(0, t)) * (STOPS.length - 1);
  const index = Math.min(STOPS.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const [r1, g1, b1] = STOPS[index];
  const [r2, g2, b2] = STOPS[index + 1];
  const channel = (from: number, to: number) => Math.round(from + (to - from) * local);
  return `\x1b[38;2;${channel(r1, r2)};${channel(g1, g2)};${channel(b1, b2)}m`;
}

export function paint(text: string): string {
  const lines = text.replace(/^\n/, '').replace(/\n$/, '').split('\n');
  const width = Math.max(...lines.map((line) => line.length), 1);

  return lines
    .map((line) => {
      let painted = '';
      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        painted += char === ' ' ? char : `${colorAt(i / (width - 1))}${char}`;
      }
      return `${painted}\x1b[0m`;
    })
    .join('\n');
}

export function printLogo(): void {
  console.log(paint(HARBOR_LOGO));
}

export function printWelcome(version: string): void {
  console.log();
  printLogo();
  console.log(paint('  ⚓  Harbor CLI'));
  console.log(`\x1b[38;2;113;113;122m  Node.js backends   v${version}\x1b[0m`);
  console.log();
}
