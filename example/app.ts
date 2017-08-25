import './app.scss';
import { Email } from './email';

export class App {
    emails: Email[] = [
        new Email(
            'Allen Buchinski', 'Yesterday', 'Pick up from airport?',
            'Hi Derek! Hope all is well with you. I am coming<br/>home from London and was wondering if you'
        ),
        new Email(
            'Jane Daniels', 'Yesterday', 'Dinner',
            'Hi Everyone, I\'m so excited to see everyone at<br/>dinner tonight. Parking can be tough around th'
        ),
        new Email(
            'Mary Ellen Mason', 'Sunday', 'Troy\'s Birthday',
            'Hey Everyone, Thanks for joining us for Troy\'s<br/>birthday. We all had an amazing time celebrati'
        ),
        new Email(
            'Ryan Romero', '9/7/16', 'New kitten',
            'I just wanted to send along a few photos of Louis,<br/>the newest member of the family. He wasted n'
        ),
        new Email(
            'David Patton', '9/7/16', 'Jersey trip',
            'I\'m going to the East Coast for a short visit this<br/>weekend. Just wondering if you want me to pi'
        ),
        new Email(
            'Paul Hikiji', '9/7/16', 'Moving next week',
            'Remember when you said you\'d help us move?<br/>We just signed a new lease. It\'s not far from w'
        ),
        new Email(
            'Graham McBride', '9/7/16', 'This weekend',
            'Hi, I wanted to touch base regarding our plans<br/>for this weekend. Are we still planning on goin'
        )
    ];
}
