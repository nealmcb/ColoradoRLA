import { isEmpty, merge } from 'lodash';

import { parse } from 'corla/adapter/countyDashboardRefresh';

/*
 * XXX: Audit board index hack
 *
 * We ran out of time to get this working the "right" way which would have
 * involved a session and the server knowing which board was currently signed
 * in. Because this state information is overwritten by dashboard refresh
 * responses, we need to shim in the client's idea of the current audit board
 * just before we merge the response into the local application state, which
 * this function helps us to do.
 *
 * We don't get access to component-local state from reducers, so we can't
 * simply read it out of the component either. There is a better way to do this
 * involving an action emitted from the button that the audit board selects to
 * sign in which sets some state that is not overwritten by dashboard refresh
 * responses, but this method suffices for the time being and is at least
 * localized to this place in the code, and can be replaced with a better method
 * in the future without cascading changes.
 *
 * This method retains the benefit of allowing users to sign in multiple audit
 * boards in the same browser session, because the state is held in the URL.
 */
const auditBoardIndexFromUrl = () => {
    const re = /^\/county\/board\/(\d+)$/;
    const matches = window.location.pathname.match(re);

    if (!matches) {
      return null;
    }

    return matches[1];
};

export default function dashboardRefreshOk(
    state: County.AppState,
    action: Action.CountyDashboardRefreshOk,
): County.AppState {
    const newState = parse(action.data, state);

    // If it becomes null it will not get overwritten.
    delete state.auditBoardCount;

    const nextState = merge({}, state, newState);

    // We want to overwrite these, not deeply merge, because an empty
    // value indicates a signed-out audit board or that we are between
    // rounds.
    nextState.auditBoards = newState.auditBoards;
    nextState.currentRound = newState.currentRound;

    // XXX: Audit board index hack
    const auditBoardIndex = auditBoardIndexFromUrl();
    if (auditBoardIndex) {
      nextState.auditBoardIndex = parseInt(auditBoardIndex, 10);
    }

    return nextState;
}
