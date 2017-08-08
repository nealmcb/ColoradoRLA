/*
 * Free & Fair Colorado RLA System
 * 
 * @title ColoradoRLA
 * @created Aug 8, 2017
 * @copyright 2017 Free & Fair
 * @license GNU General Public License 3.0
 * @author Joe Kiniry <kiniry@freeandfair.us>
 * @description A system to assist in conducting statewide risk-limiting audits.
 */

package us.freeandfair.corla.asm;

/**
 * The events of the Abstract State Machine (ASM) of the Colorado RLA Tool.
 * @trace asm.asm_event
 * @author Joseph R. Kiniry <kiniry@freeandfair.us>
 * @version 0.0.1
 */
public class AsmEvents {
  /**
   * We currently never instantiate this class. The class is nothing more than a
   * container for nested state enumeration classes.
   */
  public AsmEvents() {
    assert false;
    // @ assert false;
  }
  
  /**
   * The Department of State Dashboard's events.
   */
  // @trace asm.department_of_state_dashboard_event
  public enum DosDashboardEvent {
    AUTHENTICATE_STATE_ADMINISTRATOR_EVENT,
    ESTABLISH_RISK_LIMIT_FOR_COMPARISON_AUDITS_EVENT,
    SELECT_CONTESTS_FOR_COMPARISON_AUDIT_EVENT,
    PUBLIC_SEED_EVENT,
    PUBLISH_BALLOTS_TO_AUDIT_EVENT,
    INDICATE_FULL_HAND_COUNT_CONTEST,
    REFRESH
  }
  
  /**
   * The County Dashboard's events.
   */
  // @trace asm.county_dashboard_event
  public enum CountyDashboardEvent {
    AUTHENTICATE_COUNTY_ADMINISTRATOR,
    ESTABLISH_AUDIT_BOARD_EVENT,
    COUNTY_UPLOAD_VERIFIED_BALLOT_MANIFEST_EVENT,
    UPLOAD_VERIFIED_CVRS,
    START_AUDIT,
    REFRESH
  }
  
  /**
   * The Audit Board Dashboard's events.
   */
  // @trace asm.audit_board_dashboard_event
  public enum AuditBoardDashboardEvent {
    REMOTE_MARKINGS_EVENT,
    REPORT_BALLOT_NOT_FOUND_EVENT,
    SUBMIT_AUDIT_INVESTIGATION_REPORT_EVENT,
    SUBMIT_AUDIT_REPORT_EVENT,
    SUBMIT_INTERMEDIATE_AUDIT_REPORT_EVENT,
    REFRESH_EVENT
  }
}
