/*
 * Free & Fair Colorado RLA System
 * @title ColoradoRLA
 * @created Aug 8, 2017
 * @copyright 2017 Free & Fair
 * @license GNU General Public License 3.0
 * @author Joe Kiniry <kiniry@freeandfair.us>
 * @description A system to assist in conducting statewide risk-limiting audits.
 */

package us.freeandfair.corla.asm;

/**
 * The states of the Abstract State Machine (ASM) of the Colorado RLA Tool.
 * @trace asm.asm_state
 * @author Joseph R. Kiniry <kiniry@freeandfair.us>
 * @version 0.0.1
 */
public interface AsmState {
  /**
   * The Department of State Dashboard's states.
   * @trace asm.department_of_state_dashboard_state
   */
  enum DosDashboardState implements AsmState {
    DOS_INITIAL_STATE,
    DOS_AUTHENTICATED,
    RISK_LIMITS_SET,
    CONTESTS_TO_AUDIT_IDENTIFIED,
    RANDOM_SEED_PUBLISHED,
    BALLOT_ORDER_DEFINED,
    // @todo kiniry This state is probably unnecessary.
    AUDIT_READY_TO_START,
    DOS_AUDIT_ONGOING,
    DOS_AUDIT_COMPLETE,
    AUDIT_RESULTS_PUBLISHED
  }
  
  /**
   * The County Dashboard's states.
   * @trace asm.county_dashboard_state
   */
  enum CountyDashboardState implements AsmState {
    INITIAL_STATE,
    AUTHENTICATED,
    AUDIT_BOARD_ESTABLISHED_STATE,
    COUNTY_UPLOAD_VERIFIED_BALLOT_MANIFEST_UPLOAD_SUCESSFUL,
    COUNTY_UPLOAD_VERIFIED_BALLOT_MANIFEST_CHECKING_HASH,
    COUNTY_UPLOAD_VERIFIED_BALLOT_MANIFEST_HASH_VERIFIED,
    COUNTY_UPLOAD_VERIFIED_BALLOT_MANIFEST_HASH_WRONG,
    COUNTY_UPLOAD_VERIFIED_BALLOT_MANIFEST_FILE_TYPE_WRONG,
    COUNTY_UPLOAD_VERIFIED_BALLOT_MANIFEST_DATA_PARSED,
    COUNTY_UPLOAD_VERIFIED_BALLOT_MANIFEST_DATA_TRANSMISSION_INTERRUPTED,
    COUNTY_UPLOAD_VERIFIED_BALLOT_MANIFEST_TOO_LATE,
    UPLOAD_VERIFIED_CVRS_UPLOAD_SUCESSFUL,
    UPLOAD_VERIFIED_CVRS_CHECKING_HASH,
    UPLOAD_VERIFIED_CVRS_HASH_VERIFIED,
    UPLOAD_VERIFIED_CVRS_HASH_WRONG,
    UPLOAD_VERIFIED_CVRS_FILE_TYPE_WRONG,
    UPLOAD_VERIFIED_CVRS_DATA_PARSED,
    UPLOAD_VERIFIED_CVRS_DATA_TRANSMISSION_INTERRUPTED,
    UPLOAD_VERIFIED_CVRS_TOO_LATE
  }
  
  /**
   * The Audit Board Dashboard's states.
   * @trace asm.audit_board_dashboard_state
   */
  enum AuditBoardDashboardState implements AsmState {
    // @review kiniry Is an explicit independent initial state useful?
    AUDIT_INITIAL_STATE,
    AUDIT_IN_PROGRESS_STATE,
    SIGNOFF_INTERMEDIATE_AUDIT_REPORT_STATE,
    SUBMIT_AUDIT_REPORT_STATE
  }
}
