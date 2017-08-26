export class Email {
    readonly author: string;
    readonly date: string;
    readonly title: string;
    readonly body: string;

    constructor(author: string, date: string, title: string, body: string) {
        this.author = author;
        this.date = date;
        this.title = title;
        this.body = body;
    }
}
