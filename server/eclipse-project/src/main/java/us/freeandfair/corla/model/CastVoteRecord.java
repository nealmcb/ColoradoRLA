/*
 * Free & Fair Colorado RLA System
 * 
 * @title ColoradoRLA
 * @created Jul 25, 2017
 * @copyright 2017 Free & Fair
 * @license GNU General Public License 3.0
 * @author Daniel M. Zimmerman <dmz@freeandfair.us>
 * @description A system to assist in conducting statewide risk-limiting audits.
 */

package us.freeandfair.corla.model;

import java.time.Instant;
import java.util.Map;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;

/**
 * A cast vote record contains information about a single ballot, either 
 * imported from a tabulator export file or generated by auditors.
 * 
 * @author Daniel M. Zimmerman
 * @version 0.0.1
 */
@Entity
@Table(name = "cast_vote_record")
public class CastVoteRecord {
  /**
   * The database ID of this record.
   */
  @Id
  @GeneratedValue(strategy = GenerationType.TABLE)
  private long my_id;
  
  /**
   * A flag indicating whether this record was generated by auditors or
   * by import.
   */
  private final boolean my_audit_record_flag;
  
  /**
   * The timestamp of this cast vote record.
   */
  private final Instant my_timestamp;
  
  /**
   * The county ID of this cast vote record.
   */
  private final String my_county_id;
  
  /**
   * The scanner ID of this cast vote record.
   */
  private final String my_scanner_id;
  
  /**
   * The batch ID of this cast vote record.
   */
  private final String my_batch_id;
  
  /**
   * The record ID of this cast vote record.
   */
  private final String my_record_id;
  
  /**
   * The imprinted ID of this cast vote record.
   */
  private final String my_imprinted_id;
  
  /**
   * The ballot style of this cast vote record.
   */
  @ManyToOne
  @Cascade({CascadeType.SAVE_UPDATE})
  private final BallotStyle my_ballot_style;
  
  /**
   * A map from contests to choices made in this cast vote record.
   */
  @ManyToMany
  @Cascade({CascadeType.SAVE_UPDATE})
  private final Map<Contest, ChoiceSet> my_choices;
  
  /**
   * Constructs an empty cast vote record, solely for persistence.
   */
  protected CastVoteRecord() {
    my_audit_record_flag = false;
    my_timestamp = Instant.now();
    my_county_id = "";
    my_scanner_id = "";
    my_batch_id = "";
    my_record_id = "";
    my_imprinted_id = "";
    my_ballot_style = null;
    my_choices = null;
  }
  
  /**
   * Constructs a new cast vote record.
   * 
   * @param the_audit_record_flag true if this record was generated by
   * auditors, false otherwise
   * @param the_timestamp The timestamp of this record.
   * @param the_county_id The county ID.
   * @param the_scanner_id The scanner ID.
   * @param the_batch_id The batch ID.
   * @param the_record_id The record ID.
   * @param the_imprinted_id The imprinted ID.
   * @param the_ballot_style The ballot style.
   * @param the_choices The contest choices.
   */
  public CastVoteRecord(final boolean the_audit_record_flag, 
                        final Instant the_timestamp,
                        final String the_county_id, final String the_scanner_id,
                        final String the_batch_id, final String the_record_id,
                        final String the_imprinted_id,
                        final BallotStyle the_ballot_style,
                        final Map<Contest, ChoiceSet> the_choices) {
    my_audit_record_flag = the_audit_record_flag;
    my_timestamp = the_timestamp;
    my_county_id = the_county_id;
    my_scanner_id = the_scanner_id;
    my_batch_id = the_batch_id;
    my_record_id = the_record_id;
    my_imprinted_id = the_imprinted_id;
    my_ballot_style = the_ballot_style;
    // TODO: make a clean copy of the_choices so it can't be tampered with
    my_choices = the_choices;
  }

  /**
   * @return the database ID of this record.
   */
  public long dbID() {
    return my_id;
  }
  
  /**
   * @return true if this record was generated by auditors, false otherwise.
   */
  public boolean isAuditRecord() {
    return my_audit_record_flag;
  }
  
  /**
   * @return the timestamp of this record.
   */
  public Instant timestamp() {
    return my_timestamp;
  }
  
  /**
   * @return the county ID.
   */
  public String countyID() {
    return my_county_id;
  }
  
  /**
   * @return the scanner ID.
   */
  public String scannerID() {
    return my_scanner_id;
  }
  
  /**
   * @return the batch ID.
   */
  public String batchID() {
    return my_batch_id;
  }
  
  /**
   * @return the record ID.
   */
  public String recordID() {
    return my_record_id;
  }
  
  /**
   * @return the imprinted ID for this cast vote record.
   */
  public String imprintedID() {
    return my_imprinted_id;
  }
  
  /**
   * @return the ballot style for this cast vote record.
   */
  
  public BallotStyle ballotStyle() {
    return my_ballot_style;
  }
  
  /**
   * @return the choices made in this cast vote record.
   */
  public Map<Contest, ChoiceSet> choices() {
    return my_choices;
  }

  /**
   * @return a String representation of this cast vote record.
   */
  @Override
  public String toString() {
    return "CastVoteRecord [audit_record=" + my_audit_record_flag + ", timestamp=" + 
           my_timestamp + ", county_id=" + my_county_id + ", scanner_id=" +
           my_scanner_id + ", batch_id=" + my_batch_id + ", record_id=" + 
           my_record_id + ", imprinted_id=" + my_imprinted_id + ", ballot_style=" +
           my_ballot_style.id() + ", choices=" + my_choices + "]";
  }
  
  /**
   * Compare this object with another for equivalence.
   * 
   * @param the_other The other object.
   * @return true if the objects are equivalent, false otherwise.
   */
  @Override
  public boolean equals(final Object the_other) {
    boolean result = false;
    if (the_other instanceof CastVoteRecord) {
      final CastVoteRecord other_cvr = (CastVoteRecord) the_other;
      result &= other_cvr.isAuditRecord() == isAuditRecord();
      result &= other_cvr.timestamp().equals(timestamp());
      result &= other_cvr.countyID() == countyID();
      result &= other_cvr.scannerID() == scannerID();
      result &= other_cvr.batchID() == batchID();
      result &= other_cvr.recordID() == recordID();
      result &= other_cvr.imprintedID().equals(imprintedID());
      result &= other_cvr.ballotStyle().equals(ballotStyle());
      result &= other_cvr.choices().equals(choices());
    }
    return result;
  }
  
  /**
   * @return a hash code for this object.
   */
  @Override
  public int hashCode() {
    // can't just use toString() because order of choices may differ
    return (my_county_id + my_scanner_id + my_batch_id + my_record_id + 
            my_choices.hashCode()).hashCode();
  }
}
