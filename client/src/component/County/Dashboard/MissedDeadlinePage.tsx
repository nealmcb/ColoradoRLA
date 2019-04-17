import * as React from 'react';

import * as _ from 'lodash';

import { Card } from '@blueprintjs/core';

import { Link } from 'react-router-dom';

import CountyNav from '../Nav';

import * as config from 'corla/config';


const MissedDeadlinePage = () => {
    return (
        <div className='county-root'>
            <CountyNav />
            <h2>Upload Deadline Missed</h2>
            <div>
                <Card>
                    You are unable to upload a file because the deadline has passed and the
                    audit has begun. Please contact the CDOS voting systems team at&nbsp;
                    <strong>{ config.helpEmail }</strong> or <strong>{ config.helpTel }</strong> for assistance.
                </Card>
            </div>
        </div>
    );
};


export default MissedDeadlinePage;
