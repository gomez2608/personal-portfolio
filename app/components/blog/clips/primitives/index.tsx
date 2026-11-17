// Brand diagram primitives for clip scenes. Coordinates are in the 1280×720 stage,
// timings in frames (use `sec()`). Every primitive renders SVG into the stage `ClipFrame`
// provides, so a Scene is just `() => <>...primitives...</>`.
//
// 34px is the readable floor at phone width: on a 375px phone the 1280px stage is drawn at
// about 0.27×, so 34px text ends up around 9px. 34px for every label, sub-labels included;
// scenes may use the full 1280×720 stage. Node labels and sub-labels and Text default to
// 34px; never pass a Text or Counter `size` below 34. Captions are never drawn in the stage:
// they appear as HTML in a bar under it (in the page and in snapshots). Keep ~40px clear of
// every edge.
export { Node, type NodeProps, type NodeTone } from "./node";
export { Connector, type ConnectorProps, type ConnectorTone } from "./connector";
export { FlowDot, type FlowDotProps, type FlowDotTone } from "./flow-dot";
export { Highlight, type HighlightProps } from "./highlight";
export { Dim, type DimProps } from "./dim";
export { Counter, type CounterProps } from "./counter";
export { Title, type TitleProps } from "./title";
export { Text, type TextProps } from "./text";
