// Brand diagram primitives for clip scenes. Coordinates are in the 1280×720 stage,
// timings in frames (use `sec()`). Every primitive renders SVG into the stage `ClipFrame`
// provides, so a Scene is just `() => <>...primitives...</>`.
export { Node, type NodeProps, type NodeTone } from "./node";
export { Connector, type ConnectorProps, type ConnectorTone } from "./connector";
export { FlowDot, type FlowDotProps, type FlowDotTone } from "./flow-dot";
export { Highlight, type HighlightProps } from "./highlight";
export { Dim, type DimProps } from "./dim";
export { Counter, type CounterProps } from "./counter";
export { Title, type TitleProps } from "./title";
export { Text, type TextProps } from "./text";
