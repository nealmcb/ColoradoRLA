import * as React from 'react';

import { projectUrl } from 'corla/config';

const License = () => {
    return (
        <div className='pt-card rla-license'>
            The <em>Colorado RLA Tool</em> is Copyright © 2019 the Colorado Department of
            State, and is licensed under the AGPLv3 with a classpath exception.
            See the <a href={ projectUrl }>project site</a> for more information.
        </div>
    );
};

const LicenseFooter = () => {
    return (
        <div className='rla-license-footer'>
            <License />
        </div>
    );
};

export default LicenseFooter;
