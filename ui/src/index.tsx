/**
 * This is the main entry point for the UI. You should not need to make any
 * changes here unless you want to update the theme.
 *
 * @see https://github.com/allenai/varnish
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { ThemeProvider, GlobalStyles } from '@allenai/varnish/theme';

import App from './App';

ReactDOM.render(
    <BrowserRouter>
        <React.Fragment>
            <GlobalStyles />
            <ThemeProvider>
                <Route path="/" component={App} />
            </ThemeProvider>
        </React.Fragment>
    </BrowserRouter>,
    document.getElementById('root')
);
