import { Node, mergeAttributes } from '@tiptap/core';
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import {
  Schema,
  DOMParser,
  DOMSerializer,
  Node as PmNode,
} from '@tiptap/pm/model';
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view';
import { ChangeSet } from 'prosemirror-changeset';
import { recreateTransform } from '@z-editor/prosemirror-recreate-steps';
// https://tiptap.dev/guide/custom-extensions
const Test = Node.create({
  name: 'test',
  // 优先级
  priority: 1000,
  // 允许任何marks在当前属性上
  marks: '_',
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  inline: true,
  // 这是一个inline的元素
  group: 'inline',
  // https://tiptap.dev/api/schema#content
  // 里面只能放inline的元素
  content: 'inline*',
  // 匹配什么规则的元素
  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (element) => {
          return element.hasAttribute('class');
        },
      },
    ];
  },
  // 渲染什么样的元素到编辑器里
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
  // 允许有什么属性
  addAttributes() {
    // Return an object with attribute configuration
    return {
      class: {
        default: null,
      },
    };
  },
  // 额外的命令
  addCommands() {
    return {
      toggleDiff:
        () =>
        ({ commands }) => {
          let doc1 = PmNode.fromJSON(this.editor.schema, {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '原始文档' }],
              },
            ],
          });
          console.log('原始文档', JSON.stringify(doc1.toJSON()));
          let doc2 = this.editor.view.state.doc;
          console.log('当前文档', JSON.stringify(doc2.toJSON()));
          let mySchema = this.editor.schema;
          let tr = recreateTransform(doc1, doc2, false, true);
          // tr.doc
          // tr.docs
          // tr.steps
          console.log('tr', tr);
          console.log('差异', JSON.stringify(tr.doc.toJSON()));
          let decos = DecorationSet.empty; // decorations 的空集合。
          let changeSet = ChangeSet.create(doc1).addSteps(
            tr.doc,
            tr.mapping.maps
          );
          console.log('changeSet', changeSet);
          let { startDoc, changes, simplifyChanges } = changeSet;
          changes.forEach((ccc) => {
            // 添加的元素
            ccc.inserted.forEach((insertion) => {
              decos = decos.add(tr.doc, [
                // 添加行内元素span, 添加class
                Decoration.inline(
                  ccc.fromB,
                  ccc.toB,
                  { class: 'insertion' },
                  {}
                ),
              ]);
            });

            // 删除的元素
            ccc.deleted.forEach((deletion) => {
              let dom = document.createElement('span');
              // 添加行内元素span, 添加class
              dom.setAttribute('class', 'deletion');

              dom.appendChild(
                DOMSerializer.fromSchema(mySchema).serializeFragment(
                  startDoc.slice(ccc.fromA, ccc.toA).content
                )
              );

              decos = decos.add(tr.doc, [
                // Decoration.widget({widget: dom, side: -1, marks: []}).range(deletion.from, deletion.to)
                Decoration.widget(ccc.toB, dom, { marks: [] }),
              ]);
            });
          });
          let historyState = EditorState.create({
            doc: tr.doc,
            plugins: [
              new Plugin({
                key: new PluginKey('diffs'),
                props: {
                  decorations(state) {
                    return decos;
                  },
                },
                filterTransaction: (tr) => false,
              }),
            ],
          });
          console.log('historyState', historyState);
          // 新建一个div,
          let historyViewDiv = document.createElement('div');
          // 获取页面展示历史记录区域的id, 即#history
          let historyDiv = document.getElementById('history');

          // 将刚才新建的div添加到#history中
          historyDiv.insertBefore(
            historyViewDiv,
            historyDiv.firstElementChild
          );

          // 创建新的editorView, 展示差异
          new EditorView(historyViewDiv, {
            state: historyState,
          });
          return true;
        },
    };
  },
});
export default Test;
