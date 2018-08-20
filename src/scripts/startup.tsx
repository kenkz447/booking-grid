import * as React from 'react';
import { render } from 'react-dom';

export function startup() {
    render(<h1>Booking Grid</h1>, document.getElementById('root'));
}