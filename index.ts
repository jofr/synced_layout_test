import { Layout } from "./layout/layout";
import { LayoutSelection } from "./layout/layout_selection";
import { LayoutViewportEditor } from "./view/layout_viewport_editor/layout_viewport_editor";
import "./view/layout_viewport_editor/layout_viewport_editor";
import "./view/layout_tree_editor";
import "./view/tabbed_area";
import "./view/node_properties_editor";
import "./view/node_metadata_view";

declare global {
    interface Window {
        layout: Layout;
        selection: LayoutSelection;
        editor: LayoutViewportEditor;
        new: any;
        sync: any;
    }
}

const init = function() {
    window.selection = new LayoutSelection(window.layout);
    document.querySelector("layout-viewport-editor").layout = window.layout;
    document.querySelector("layout-tree-editor").sceneGraph = window.layout.sceneGraph;
    document.querySelector("layout-tree-editor").selection = window.selection;
    window.selection.on("changed", () => {
        const selection = window.selection.get();
        if (selection === null) {
            document.querySelector("node-properties-editor").node = null;
            document.querySelector("node-metadata-view").node = null;
        } else if (selection.length === 1) {
            document.querySelector("node-properties-editor").node = selection[0];
            document.querySelector("node-metadata-view").node = selection[0];
        } else {
            document.querySelector("node-properties-editor").node = null;
            document.querySelector("node-metadata-view").node = null;
        }
    });
    
    document.querySelector("#actor-id").innerHTML = window.layout.sceneGraph.actorId;
    document.querySelector("#document-id").innerHTML = window.layout.sceneGraph.documentId; 
}

window.new = function(testData: boolean = false) {
    window.layout = new Layout();
    if (testData) {
        window.layout.createTestData();
    }
    init();
}

window.sync = function(documentId: string) {
    window.layout = new Layout(documentId);
    init();
}
