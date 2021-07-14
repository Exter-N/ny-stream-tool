import { Message, messageToString } from "../../../common/chat-message";

export class PyramidDetector {
    sender: string | undefined;
    message: string;
    private height: number;
    maxHeight: number;
    private descending: boolean;
    constructor() {
        this.sender = undefined;
        this.message = '';
        this.height = 0;
        this.maxHeight = 0;
        this.descending = true;
    }
    update(sender: string | undefined, message: Message): boolean {
        message = messageToString(message);
        if (sender !== this.sender) {
            this.reset(sender, message);

            return false;
        }

        if (!this.descending && message === Array(this.height + 1).fill(this.message).join(' ')) {
            ++this.height;
            ++this.maxHeight;

            return false;
        }

        if (this.height >= 2 && message === Array(this.height - 1).fill(this.message).join(' ')) {
            this.descending = true;
            --this.height;

            return 1 === this.height;
        }

        this.reset(sender, message);

        return false;
    }
    private reset(sender: string | undefined, message: string): void {
        this.sender = sender;
        this.message = message;
        this.height = 1;
        this.maxHeight = 1;
        this.descending = false;
    }
}