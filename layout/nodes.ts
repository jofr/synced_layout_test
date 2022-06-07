import { SceneGraphNode } from "../scene_graph/scene_graph";
import { Typed } from "./nodes/typed";
import { Root } from "./nodes/root";
import { Binding } from "./nodes/binding";
import { Page } from "./nodes/page";
import { Transform } from "./nodes/transform";
import { Group } from "./nodes/group";
import { Shape } from "./nodes/shape";
import { Rectangle } from "./nodes/rectangle";
import { Circle } from "./nodes/circle";
import { Ellipse } from "./nodes/ellipse";

export type LayoutData = Typed | Transform | Group | Shape | Rectangle | Circle | Ellipse |
                         Binding | Page;

export type TypedNode = SceneGraphNode & Typed;
export type RootNode = TypedNode & Root;
export type BindingNode = TypedNode & Binding;
export type PageNode = TypedNode & Page;
export type TransformNode = TypedNode & Transform;
export type GroupNode = TransformNode & Group;
export type ShapeNode = TransformNode & Shape;
export type RectangleNode = ShapeNode & Rectangle;
export type CircleNode = ShapeNode & Circle;
export type EllipseNode = ShapeNode & Ellipse;
export type LayoutNode = TypedNode | TransformNode | ShapeNode |
                         RectangleNode | CircleNode | EllipseNode |
                         BindingNode | PageNode;