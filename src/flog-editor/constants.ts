export const DEFAULT_SCHEME_NAME = "untitled" as const;

export const VSCODE_COMMANDS = {
  OPEN_WITH: "vscode.openWith" as const,
} as const;

export const POST_TYPES = {
  INIT: "init" as const,
  UPDATE: "update" as const,
  GET_FILE_DATA: "getFileData" as const,
} as const;

export const FILES = {
  JavaScript: {
    FLOG_EDITOR: "flog-editor.js" as const
  } as const,

  CSS: {
    RESET: "reset.css" as const,
    VSCODE: "vscode.css" as const,
    FLOG_EDITOR: "flog-editor.css" as const,
  } as const,
} as const;

export const DEFAULT_REQUEST_ID = 1 as const;

export const VIEW_TYPE = "some-log.f.log" as const;