import { describe, expect, test } from "vitest";
import { checkClipSource } from "./clip-source";

const W = "app/blog/x/clips/clip-1.tsx";
const ok = `"use client";
// Construido a partir de: la traza (#fff in a comment is fine)
import { useMemo } from "react";
import { defineClip } from "@/app/components/blog/clips/clip-def";
import { Node } from "@/app/components/blog/clips/primitives";
import { Box, Label, useClipFrame } from "@/app/components/blog/clips/draw";
import { sec } from "@/app/components/blog/clips/timing";
/* block comment: <rect style="x"> */
function Scene() {
  const f = useClipFrame();
  return (<>
    <g key="a" transform="translate(1 2)" opacity={0.5}><Box x={1} y={2} w={3} h={4} /></g>
    <Label x={1} y={2}>Hola {f}</Label><Node x={1} y={2} label="a" />
  </>);
}
export default defineClip({ id: "clip-1", title: "t", durationInFrames: sec(10), captions: [], Scene });
`;
const err = (src: string) => checkClipSource(W, src);

describe("checkClipSource", () => {
  test("a clip using only allowed modules passes", () => expect(err(ok)).toEqual([]));

  test("remotion import is rejected", () => {
    const e = err(ok.replace(`import { useMemo } from "react";`, `import { useCurrentFrame } from "remotion";`));
    expect(e).toHaveLength(1);
    expect(e[0]).toContain(W);
    expect(e[0]).toContain(`import "remotion" not allowed`);
  });
  test.each(["../palette", "./helpers", "@/app/components/blog/clips/palette"])("import %s is rejected", (m) =>
    expect(err(`import x from "${m}";`)[0]).toContain(`import "${m}" not allowed`));

  test.each([`fill={\`#\${x}\`}`, `const red = "#f00";`, `stroke="#1b2238"`, `fill="rgb(1,2,3)"`, `hsla(1, 2%, 3%, .5)`])(
    "colour literal %s is rejected",
    (s) => expect(err(s).join()).toContain("colour literal"),
  );

  test.each(["rect", "path", "text", "circle", "line", "polyline", "svg", "defs"])("raw <%s> is rejected", (t) =>
    expect(err(`<${t} x={1} />`).join()).toContain(`raw <${t}> not allowed`));

  test("<g> with styling is rejected", () => {
    expect(err(`<g fill="x">`).join()).toContain("<g> may only set key, transform or opacity");
    expect(err(`<g>`)).toEqual([]);
  });

  test("style= is rejected", () => expect(err(`<Box style={{}} />`).join()).toContain("style= not allowed"));
});
