const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const vm = require("node:vm");

let bundledPostcssTokenizer;
let bundledSelectorTokenizer;
let bundledSelectorTokenTypes;

function loadBundledPeerTokenizers() {
  if (bundledPostcssTokenizer && bundledSelectorTokenizer && bundledSelectorTokenTypes) {
    return;
  }

  const peersPath = require.resolve("tailwindcss/peers");
  const source = fs.readFileSync(peersPath, "utf8");
  const context = {
    Buffer,
    console,
    global,
    module: { exports: {} },
    exports: {},
    process,
    require,
    setImmediate,
    setTimeout,
    clearImmediate,
    clearTimeout,
  };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: peersPath });

  if (typeof context.require_tokenize !== "function") {
    throw new Error("Unable to locate bundled PostCSS tokenizer in tailwindcss/peers.");
  }
  if (typeof context.require_tokenize2 !== "function") {
    throw new Error("Unable to locate bundled selector parser tokenizer in tailwindcss/peers.");
  }
  if (typeof context.require_tokenTypes !== "function") {
    throw new Error("Unable to locate bundled selector parser token types in tailwindcss/peers.");
  }

  bundledPostcssTokenizer = context.require_tokenize();
  bundledSelectorTokenizer = context.require_tokenize2();
  bundledSelectorTokenTypes = context.require_tokenTypes();
}

function isPostcssTokenizerRequest(request, parentFile) {
  return (
    request === "./tokenize" &&
    parentFile &&
    parentFile.includes(`${path.sep}node_modules${path.sep}postcss${path.sep}lib${path.sep}`)
  );
}

function isSelectorTokenizerRequest(request, parentFile) {
  return (
    request === "./tokenize" &&
    parentFile &&
    parentFile.includes(
      `${path.sep}node_modules${path.sep}postcss-selector-parser${path.sep}dist${path.sep}`,
    )
  );
}

function isSelectorTokenTypesRequest(request, parentFile) {
  return (
    request === "./tokenTypes" &&
    parentFile &&
    parentFile.includes(
      `${path.sep}node_modules${path.sep}postcss-selector-parser${path.sep}dist${path.sep}`,
    )
  );
}

const originalLoad = Module._load;

Module._load = function patchedLoad(request, parent, isMain) {
  const parentFile = parent && parent.filename ? parent.filename : "";

  if (request === "sucrase") {
    return {
      transform(source) {
        return { code: source };
      },
    };
  }

  if (isPostcssTokenizerRequest(request, parentFile)) {
    loadBundledPeerTokenizers();
    return bundledPostcssTokenizer;
  }

  if (isSelectorTokenizerRequest(request, parentFile)) {
    loadBundledPeerTokenizers();
    return bundledSelectorTokenizer;
  }

  if (isSelectorTokenTypesRequest(request, parentFile)) {
    loadBundledPeerTokenizers();
    return bundledSelectorTokenTypes;
  }

  return originalLoad.apply(this, arguments);
};
