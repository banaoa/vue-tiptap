<template>
  <div class="editor">
    <button @click="test">对比</button>
    <div class="menubar">
      <span v-for="actionName in activeButtons" :key="actionName">
        <button
          v-if="actionName === 'bold'"
          class="menubar__button"
          :class="{ 'is-active': editor.isActive('bold') }"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <icon name="bold" />
        </button>
        <button
          v-if="actionName === 'italic'"
          class="menubar__button"
          :class="{ 'is-active': editor.isActive('italic') }"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <icon name="italic" />
        </button>

        <button
          v-if="actionName === 'strike'"
          class="menubar__button"
          :class="{ 'is-active': editor.isActive('strike') }"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <icon name="strike" />
        </button>

        <button
          v-if="actionName === 'underline'"
          class="menubar__button"
          :class="{ 'is-active': editor.isActive('underline') }"
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          <icon name="underline" />
        </button>

        <button
          v-if="actionName === 'link'"
          class="menubar__button"
          :class="{ 'is-active': editor.isActive('link') }"
          @click="editor.chain().focus().toggleLink().run()"
        >
          <icon name="link" />
        </button>

        <button
          v-if="actionName === 'code'"
          class="menubar__button"
          :class="{ 'is-active': editor.isActive('code') }"
          @click="editor.chain().focus().toggleCode().run()"
        >
          <icon name="code" />
        </button>

        <button
          v-if="actionName === 'h1'"
          class="menubar__button"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          H1
        </button>

        <button
          v-if="actionName === 'h2'"
          class="menubar__button"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          H2
        </button>

        <button
          v-if="actionName === 'h3'"
          class="menubar__button"
          :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          H3
        </button>

        <button
          v-if="actionName === 'bulletList'"
          class="menubar__button"
          :class="{ 'is-active': editor.isActive('bulletList') }"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          <icon name="ul" />
        </button>

        <button
          v-if="actionName === 'orderedList'"
          class="menubar__button"
          :class="{ 'is-active': editor.isActive('orderedList') }"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          <icon name="ol" />
        </button>

        <button
          v-if="actionName === 'blockquote'"
          class="menubar__button"
          :class="{ 'is-active': editor.isActive('blockquote') }"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          <icon name="quote" />
        </button>

        <button
          v-if="actionName === 'codeBlock'"
          class="menubar__button"
          :class="{ 'is-active': editor.isActive('codeBlock') }"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        >
          <icon name="code" />
        </button>

        <button
          v-if="actionName === 'horizontalRule'"
          class="menubar__button"
          @click="editor.chain().focus().setHorizontalRule().run()"
        >
          <icon name="hr" />
        </button>

        <button
          v-if="actionName === 'undo'"
          class="menubar__button"
          @click="editor.chain().focus().undo().run()"
        >
          <icon name="undo" />
        </button>

        <button
          v-if="actionName === 'redo'"
          class="menubar__button"
          @click="editor.chain().focus().redo().run()"
        >
          <icon name="redo" />
        </button>
      </span>
    </div>
    <div id="content" style="display: none"><p>111333</p></div>
    <editor-content class="editor__content" :editor="editor" />
    <div id="history"></div>
  </div>
</template>

<script>
import Icon from './Icon';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { Schema, DOMParser, DOMSerializer, Node } from '@tiptap/pm/model';
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view';
import { ChangeSet } from 'prosemirror-changeset';
import { recreateTransform } from '@z-editor/prosemirror-recreate-steps';
import Test from "@/extensions/test";
import Paragraph from "@/extensions/paragraph";

export default {
  name: 'Editor',
  components: {
    EditorContent,
    Icon,
  },
  props: {
    initialContent: {
      type: String,
      required: true,
      default: '<em>editable text</em>',
    },
    activeButtons: {
      type: Array,
      validator: function (list) {
        for (let el of list) {
          // The value must match one of these strings
          if (
            [
              'bold',
              'italic',
              'strike',
              'underline',
              'link',
              'code',
              'h1',
              'h2',
              'h3',
              'bulletList',
              'orderedList',
              'blockquote',
              'codeBlock',
              'horizontalRule',
              'undo',
              'redo',
            ].indexOf(el) === -1
          ) {
            return -1;
          }
        }
        return 1;
      },
      default: () => ['bold', 'italic'],
    },
  },
  emits: ['update'],
  data() {
    return {
      html: '',
      json: '',
      editor: null,
    };
  },
  created() {
    this.editor = new Editor({
      content: this.initialContent,
      extensions: [StarterKit, Underline, Link, Test, Paragraph],
    });

    this.html = this.editor.getHTML();
    this.json = this.editor.getJSON();
    this.editor.on('create', () => {
      this.html = this.editor.getHTML();
      this.json = this.editor.getJSON();
      this.$emit('update', { html: this.html, json: this.json });
    });

    this.editor.on('update', () => {
      this.html = this.editor.getHTML();
      this.json = this.editor.getJSON();
      this.$emit('update', { html: this.html, json: this.json });
    });
    this.editor.on('selectionUpdate', ({ editor }) => {
      console.log(editor.isActive('link'));
      //console.log(editor);
      //console.log(editor.state.selection.ranges);
      //console.log('selection update');
      console.log(editor.schema.marks);
    });
  },
  methods: {
    test() {
      let doc1 = this.editor.view.state.doc;

      let doc2 = Node.fromJSON(this.editor.schema, {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'xx1231232bb' }] },
        ],
      });
      console.log(JSON.stringify(doc2.toJSON()));
      let mySchema = this.editor.schema;
      let tr = recreateTransform(doc1, doc2, false, true);
      console.log(tr);
      let decos = DecorationSet.empty; // decorations 的空集合。
      let changeSet = ChangeSet.create(doc1).addSteps(tr.doc, tr.mapping.maps);
      let { startDoc, changes, simplifyChanges } = changeSet;
      changes.forEach((ccc) => {
        // 添加的元素
        ccc.inserted.forEach((insertion) => {
          decos = decos.add(tr.doc, [
            // 添加行内元素span, 添加class
            Decoration.inline(ccc.fromB, ccc.toB, { class: 'insertion' }, {}),
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
      // 新建一个div,
      let historyViewDiv = document.createElement('div');
      // 获取页面展示历史记录区域的id, 即#history
      let historyDiv = document.getElementById('history');

      // 将刚才新建的div添加到#history中
      historyDiv.insertBefore(historyViewDiv, historyDiv.firstElementChild);

      // 创建新的editorView, 展示差异
      new EditorView(historyViewDiv, {
        state: historyState,
      });
    },
  },
  beforeUnmount() {
    this.editor.destroy();
  },
};
</script>

<style lang="css">
.insertion {
  text-decoration: underline;
  background-color: rgba(0, 255, 42, 0.2);
}
.deletion {
  text-decoration: line-through;
  background-color: rgba(255, 29, 29, 0.2);
}
span > p:first-child,
span > p:last-child {
  display: inline;
}
span > p:empty {
  display: block;
}
</style>
