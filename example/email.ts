export class Email {
    author: string;
    date: string;
    title: string;
    body: string;

    constructor(author: string, date: string, title: string, body: string) {
        this.author = author;
        this.date = date;
        this.title = title;
        this.body = body;
    }
}
