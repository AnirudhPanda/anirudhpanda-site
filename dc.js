/* tiny renderer for the portfolio pages: {{ holes }}, sc-for, sc-if and event bindings */
(function () {
  var VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, source: 1, track: 1, wbr: 1 };
  var EVENTS = { onclick: "click", onchange: "input", onsubmit: "submit", oninput: "input" };
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;

  function esc(v) {
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function lookup(path, scope) {
    path = path.trim();
    if (path === "true") return true;
    if (path === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^(['"]).*\1$/.test(path)) return path.slice(1, -1);
    var parts = path.split(".");
    var cur = scope;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) {
      var v = lookup(p, scope);
      return v == null ? "" : String(v);
    });
  }
  function wholeHole(str) {
    var m = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/.exec(str);
    return m ? m[1] : null;
  }

  function renderNodes(nodes, scope, ctx) {
    var out = "";
    for (var i = 0; i < nodes.length; i++) out += renderNode(nodes[i], scope, ctx);
    return out;
  }

  function renderNode(node, scope, ctx) {
    if (node.nodeType === 3) return esc(interp(node.nodeValue, scope));
    if (node.nodeType !== 1) return "";
    var tag = node.localName;

    if (tag === "sc-for") {
      var list = lookup(wholeHole(node.getAttribute("list")) || "", scope) || [];
      var as = node.getAttribute("as") || "item";
      var html = "";
      for (var i = 0; i < list.length; i++) {
        var s = Object.create(scope);
        s[as] = list[i];
        s.$index = i;
        html += renderNodes(node.childNodes, s, ctx);
      }
      return html;
    }
    if (tag === "sc-if") {
      var val = lookup(wholeHole(node.getAttribute("value")) || "", scope);
      return val ? renderNodes(node.childNodes, scope, ctx) : "";
    }

    var attrs = "";
    var textareaValue = null;
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a];
      var name = at.name;
      if (name.indexOf("hint-") === 0) continue;
      var lname = name.toLowerCase();
      if (EVENTS[lname]) {
        var hp = wholeHole(at.value);
        var fn = hp ? lookup(hp, scope) : null;
        if (typeof fn === "function") {
          ctx.handlers.push(fn);
          attrs += " data-dc-" + EVENTS[lname] + '="' + (ctx.handlers.length - 1) + '"';
        }
        continue;
      }
      var v = interp(at.value, scope);
      if (tag === "textarea" && lname === "value") { textareaValue = v; continue; }
      attrs += " " + name + '="' + esc(v) + '"';
    }
    if (VOID[tag]) return "<" + tag + attrs + ">";
    var inner = textareaValue !== null ? esc(textareaValue) : renderNodes(node.childNodes, scope, ctx);
    return "<" + tag + attrs + ">" + inner + "</" + tag + ">";
  }

  function DCLogic(props) {
    this.props = props || {};
  }
  DCLogic.prototype.setState = function (patch) {
    this.state = Object.assign({}, this.state || {}, typeof patch === "function" ? patch(this.state || {}) : patch);
    if (this.__render) this.__render();
  };
  DCLogic.prototype.forceUpdate = function () { if (this.__render) this.__render(); };
  window.DCLogic = DCLogic;

  window.DC = {
    mount: function (Component) {
      var tpl = document.getElementById("tpl");
      var root = document.getElementById("app");
      var nodes = tpl.content.childNodes;
      var comp = Component ? new Component({}) : null;
      var ctx = { handlers: [] };
      var first = true;

      function render() {
        ctx.handlers = [];
        var vals = comp && comp.renderVals ? comp.renderVals() : {};
        var html = renderNodes(nodes, vals || {}, ctx);
        if (first) { root.innerHTML = html; first = false; }
        else {
          var next = document.createElement("div");
          next.id = "app";
          next.innerHTML = html;
          morphdom(root, next, {
            childrenOnly: true,
            onBeforeElUpdated: function (from, to) {
              if (from === document.activeElement && (from.tagName === "INPUT" || from.tagName === "TEXTAREA")) {
                to.value = from.value;
              }
              return true;
            }
          });
        }
      }
      if (comp) comp.__render = render;

      ["click", "input", "submit"].forEach(function (type) {
        root.addEventListener(type, function (e) {
          var el = e.target.closest ? e.target.closest("[data-dc-" + type + "]") : null;
          if (!el || !root.contains(el)) return;
          if (type === "submit") e.preventDefault();
          var fn = ctx.handlers[Number(el.getAttribute("data-dc-" + type))];
          if (fn) fn(e);
        });
      });

      render();
      if (comp && comp.componentDidMount) comp.componentDidMount();
      if (location.hash) {
        var t = document.getElementById(location.hash.slice(1));
        if (t) t.scrollIntoView();
      }
    }
  };
})();
