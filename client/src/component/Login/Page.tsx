import * as React from 'react';

import { Card } from '@blueprintjs/core';

import LicenseFooter from 'corla/component/LicenseFooter';
import LoginFormContainer from './FormContainer';

const LoginPage = () => {
    return (
        <div className='l-wrapper'>
            <div className='l-main'>
                <div className='login'>
                    <h1>Colorado RLA Tool Log-In</h1>
                    <LoginFormContainer />
                </div>
            </div>
            <LicenseFooter />
        </div>
    );
};

export default LoginPage;
