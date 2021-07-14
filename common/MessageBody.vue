<script lang="ts">
import { defineComponent, h, VNode } from 'vue';
import { Message } from "./chat-message";

export default defineComponent({
    props: ['message'],
    render(): string | (string | VNode)[] {
        const message = this.message as Message;
        if (Array.isArray(message)) {
            return message.map<string | VNode | undefined>(part => {
                if (typeof part == 'string') {
                    return part;
                } else if ('text' in part) {
                    const type = part.href ? 'a' : 'span';
                    const style: Partial<CSSStyleDeclaration> = {};
                    const props = {
                        href: undefined as (string | undefined),
                        style,
                    };
                    if (part.href) {
                        props.href = part.href;
                    }
                    if (part.bold) {
                        style.fontWeight = 'bold';
                    }
                    if (part.italic) {
                        style.fontStyle = 'italic';
                    }
                    if (part.underline) {
                        style.textDecoration = 'underline';
                    }
                    if (part.color) {
                        style.color = part.color;
                    }

                    return h(type, props, part.text);
                } else if ('name' in part) {
                    return h('img', {
                        src: part.url1x,
                        width: part.width,
                        height: part.height,
                        alt: part.name,
                    });
                }
            }).filter(n => null != n) as (string | VNode)[];
        } else {
            return message;
        }
    },
});
</script>