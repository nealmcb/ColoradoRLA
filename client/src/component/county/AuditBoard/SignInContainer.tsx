import * as React from 'react';
import { connect } from 'react-redux';

import counties from '../../../data/counties';

import SignedInPage from './SignedInPage';
import SignInPage from './SignInPage';

import auditBoardSignedIn from '../../../selector/county/auditBoardSignedIn';


class AuditBoardSignInContainer extends React.Component<any, any> {
    public render() {
        const { auditBoard, auditBoardSignedIn, countyName } = this.props;

        if (auditBoardSignedIn) {
            return <SignedInPage auditBoard={ auditBoard } countyName={ countyName } />;
        }

        return <SignInPage { ...this.props } />;
    }
}

const mapStateToProps = (state: any) => {
    const { county } = state;

    const countyName = county.id ? counties[county.id].name : '';

    return {
        auditBoard: county.auditBoard,
        auditBoardSignedIn: auditBoardSignedIn(state),
        county,
        countyName,
    };
};


export default connect(mapStateToProps)(AuditBoardSignInContainer);