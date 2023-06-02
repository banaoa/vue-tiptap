import { Node, mergeAttributes } from '@tiptap/core';
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
      setParagraph:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name);
        },
    };
  },
});
export default Test;
