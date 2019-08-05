/**
 * This is the top-level component that defines your UI application.
 *
 * This is an appropriate spot for application wide components and configuration,
 * stuff like application chrome (headers, footers, navigation, etc), routing
 * (what urls go where), etc.
 *
 * @see https://github.com/reactjs/react-router-tutorial/tree/master/lessons
 */

import * as React from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from 'react-router';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import {
    Header,
    TransparentLayout,
    PaddedContent,
    Page,
    Footer,
    InternalLink,
    HeaderTitle,
    Body
} from '@allenai/varnish/components';
import { Menu } from 'antd';

import Home from './pages/Home';
import About from './pages/About';
import { AppRoute } from './AppRoute';

/**
 * An array capturing the available routes in your application. You can
 * add or remove routes here.
 */
const ROUTES: AppRoute[] = [
    {
        path: '/',
        label: 'Home',
        component: Home
    },
    {
        path: '/about',
        label: 'About',
        component: About
    }
];

export default class App extends React.PureComponent<RouteComponentProps> {
    render() {
        return (
            <BrowserRouter>
                <Route path="/">
                    <TransparentLayout>
                        <Header>
                            <HeaderTitle>Skiff Template</HeaderTitle>
                        </Header>
                        <PaddedContent>
                            <TopMenu
                                defaultSelectedKeys={[this.props.location.pathname]}>
                                {ROUTES.map(({ path, label }) => (
                                    <Menu.Item key={path}>
                                        <Body>
                                            <InternalLink to={path}>{label}</InternalLink>
                                        </Body>
                                    </Menu.Item>
                                ))}
                            </TopMenu>
                            <Page>
                                {ROUTES.map(({ path, component }) => (
                                    <Route key={path} path={path} exact component={component} />
                                ))}
                            </Page>
                        </PaddedContent>
                        <Footer />
                    </TransparentLayout>
                </Route>
            </BrowserRouter>
        );
    }
}

const TopMenu = styled(Menu).attrs({
    mode: "horizontal"
})`
    margin-top: ${({theme}) => theme.spacing.lg};
`;
