export const monacoThemes = {
  "vs-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: "d4d4d4" },
      { token: "keyword", foreground: "569cd6" },
      { token: "string", foreground: "ce9178" },
      { token: "number", foreground: "b5cea8" },
      { token: "comment", foreground: "6a9955" },
      { token: "function", foreground: "dcdcaa" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#d4d4d4",
    },
  },

  "light": {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#000000",
    },
  },
};