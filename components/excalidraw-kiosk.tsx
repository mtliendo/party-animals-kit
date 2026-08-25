"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExcalidrawAPI = any;

export function ExcalidrawKiosk({
  onApi,
}: {
  onApi: (api: ExcalidrawAPI) => void;
}) {
  return (
    <div
      className="kiosk-excalidraw absolute inset-0 touch-none"
      onWheelCapture={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <Excalidraw
        excalidrawAPI={onApi}
        theme="light"
        zenModeEnabled
        UIOptions={{
          welcomeScreen: false,
          canvasActions: {
            changeViewBackgroundColor: false,
            clearCanvas: false,
            export: false,
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: false,
            saveAsImage: false,
          },
          tools: {
            image: false,
          },
        }}
        initialData={{
          appState: {
            activeTool: {
              type: "freedraw",
              lastActiveTool: null,
              locked: true,
              customType: null,
            },
            currentItemStrokeWidth: 6,
            currentItemOpacity: 100,
            viewBackgroundColor: "#fffdf6",
            zenModeEnabled: true,
          },
        }}
      />
    </div>
  );
}
