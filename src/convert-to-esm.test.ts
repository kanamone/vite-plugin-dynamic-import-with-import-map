import { describe, it, expect } from "vitest";
import { convertToESM } from "./convert-to-esm.js";

describe("convertToESM", () => {
  describe("when invalid js file", () => {
    it("should be return to Err", async () => {
      const actual = await convertToESM()(
        {
          name: "xxx",
          moduleType: "esm",
          entryPointPath: "foo",
        },
        [],
      );
      expect(actual.err).toMatchInlineSnapshot(`
        {
          "error": [Error: Build failed with 1 error:
        error: Could not resolve "foo"],
          "kind": "TransformError",
          "pkgName": "xxx",
        }
      `);
    });
  });

  describe("when commonjs named exported module", () => {
    it("should be output is named exported", async () => {
      const actual = await convertToESM()(
        {
          name: "react",
          moduleType: "cjs",
          entryPointPath: "./fixture/cjs-named-export.js",
        },
        [],
      );

      expect(actual.ok).toStrictEqual(true);
      // exclude sourcemap
      expect(actual.val?.body.split("\n")[0]).toMatchInlineSnapshot(
        `"var a=Object.create;var t=Object.defineProperty;var d=Object.getOwnPropertyDescriptor;var g=Object.getOwnPropertyNames;var i=Object.getPrototypeOf,m=Object.prototype.hasOwnProperty;var p=(f,o)=>()=>(o||f((o={exports:{}}).exports,o),o.exports);var s=(f,o,e,n)=>{if(o&&typeof o=="object"||typeof o=="function")for(let l of g(o))!m.call(f,l)&&l!==e&&t(f,l,{get:()=>o[l],enumerable:!(n=d(o,l))||n.enumerable});return f};var x=(f,o,e)=>(e=f!=null?a(i(f)):{},s(o||!f||!f.__esModule?t(e,"default",{value:f,enumerable:!0}):e,f));var r=p(c=>{"use strict";c.foo=function(){console.log("foo")}});var u=x(r());var export_default=u.default;var export_foo=u.foo;export{export_default as default,export_foo as foo};"`,
      );
    });
  });

  describe("when have external dependencies", () => {
    it("should be ignored external dependencies implementation", async () => {
      const actual = await convertToESM()(
        {
          name: "react",
          moduleType: "cjs",
          entryPointPath: "./fixture/has-external-dependency.js",
        },
        ["./external-dependency"],
      );

      expect(actual.ok).toStrictEqual(true);
      // exclude sourcemap
      expect(actual.val?.body.split("\n")[0]).toMatchInlineSnapshot(
        `"var d=Object.create;var a=Object.defineProperty;var i=Object.getOwnPropertyDescriptor;var l=Object.getOwnPropertyNames;var m=Object.getPrototypeOf,n=Object.prototype.hasOwnProperty;var p=(o=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(o,{get:(r,e)=>(typeof require<"u"?require:r)[e]}):o)(function(o){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+o+'" is not supported')});var q=(o,r)=>()=>(r||o((r={exports:{}}).exports,r),r.exports);var s=(o,r,e,t)=>{if(r&&typeof r=="object"||typeof r=="function")for(let f of l(r))!n.call(o,f)&&f!==e&&a(o,f,{get:()=>r[f],enumerable:!(t=i(r,f))||t.enumerable});return o};var x=(o,r,e)=>(e=o!=null?d(m(o)):{},s(r||!o||!o.__esModule?a(e,"default",{value:o,enumerable:!0}):e,o));var b=q(u=>{"use strict";var{bar:g}=p("./external-dependency");u.foo=()=>{g()}});var c=x(b());var export_default=c.default;var export_foo=c.foo;export{export_default as default,export_foo as foo};"`,
      );
    });
  });

  describe("when success", () => {
    it("should be return to Ok", async () => {
      const actual = await convertToESM()(
        {
          name: "vite",
          moduleType: "esm",
          entryPointPath: "src/module.ts",
        },
        [],
      );
      expect(actual.ok).toStrictEqual(true);
    });
  });
});
