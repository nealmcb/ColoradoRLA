import * as React from 'react';
import { connect } from 'react-redux';


class AuditSeedContainer extends React.Component<any, any> {
    public render() {
        return (
            <div>Audit Seed</div>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: any) => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(AuditSeedContainer);
