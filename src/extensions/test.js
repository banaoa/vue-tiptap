import { Node, mergeAttributes } from '@tiptap/core';
// https://tiptap.dev/guide/custom-extensions
const Test = Node.create({
  name: 'test',
  priority: 1000,
  marks: '_',
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  inline: true,
  group: 'inline',
  // https://tiptap.dev/api/schema#content
  content: 'inline*',
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

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
  addAttributes() {
    // Return an object with attribute configuration
    return {
      class: {
        default: null,
      },
    };
  },
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
