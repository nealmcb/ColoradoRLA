import * as React from 'react';

import {
    Alignment,
    Button,
    Intent,
    Navbar,
    NavbarDivider,
    NavbarGroup,
    NavbarHeading,
    Popover,
    Position,
} from '@blueprintjs/core';

import { Link } from 'react-router-dom';

import * as config from 'corla/config';

import NavMenu from './NavMenu';

import resetDatabase from 'corla/action/dos/resetDatabase';
import logout from 'corla/action/logout';

const MenuButton = () =>
    <Button icon='menu' minimal />;

const Heading = () =>
    <NavbarHeading>Colorado RLA</NavbarHeading>;

const Divider = () =>
    <NavbarDivider />;

interface HomeButtonProps {
    path: string;
}

const HomeButton = ({ path }: HomeButtonProps) => (
    <Link to={ path }>
        <Button icon='home' minimal text='Home' />
    </Link>
);

interface LogoutButtonProps {
    logout: OnClick;
}

const LogoutButton = ({ logout }: LogoutButtonProps) =>
    <Button icon='log-out' minimal onClick={ logout } text='Log out' />;

interface ResetButtonProps {
    reset: OnClick;
}

const ResetDatabaseButton = ({ reset }: ResetButtonProps) => (
    <Button icon='warning-sign'
            intent={ Intent.DANGER }
            onClick={ reset }>
        DANGER: Reset Database
    </Button>
);

export default function withNav(Menu: React.ComponentClass, path: string) {
    const resetSection = path === '/sos' && config.debug
                       ? <div>
                            <ResetDatabaseButton reset={ resetDatabase } />
                            <Divider />
                        </div>
                       : <div />;

    return () => (
        <Navbar className='l-nav'>
            <NavbarGroup align={ Alignment.LEFT }>
                <Popover content={ <Menu /> } position={ Position.RIGHT_TOP }>
                    <MenuButton />
                </Popover>
                <Heading />
            </NavbarGroup>
            <NavbarGroup align={ Alignment.RIGHT }>
                { resetSection }
                <HomeButton path={ path } />
                <Divider />
                <LogoutButton logout={ logout }/>
            </NavbarGroup>
        </Navbar>
    );
}
