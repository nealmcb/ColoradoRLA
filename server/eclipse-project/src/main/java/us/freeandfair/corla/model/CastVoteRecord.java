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

import java.io.Serializable;
import java.time.Instant;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
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
public class CastVoteRecord implements Serializable {
  /**
   * The serialVersionUID.
   */
  private static final long serialVersionUID = 1L;

  /**
   * The table of objects that have been created.
   */
  private static final Map<CastVoteRecord, CastVoteRecord> CACHE = 
      new HashMap<CastVoteRecord, CastVoteRecord>();
  
  /**
   * The table of objects by ID.
   */
  private static final Map<Long, CastVoteRecord> BY_ID =
      new HashMap<Long, CastVoteRecord>();
  
  /**
   * The current ID number to be used.
   */
  private static int current_id;
 
  /**
   * The database ID of this record.
   */
  @Id
  @GeneratedValue(strategy = GenerationType.TABLE)
  @SuppressWarnings("PMD.ImmutableField")
  private long my_db_id = getID();
  
  /**
   * A flag indicating whether this record was generated by auditors or
   * by import.
   */
  private final RecordType my_record_type;
  
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
  @Cascade({CascadeType.ALL})
  private final BallotStyle my_ballot_style;
  
  /**
   * The contests in this cast vote record and the choices
   * made in them.
   */
  @OneToMany
  @Cascade({CascadeType.MERGE})
  private final Map<Contest, Set<Choice>> my_choices;
  
  /**
   * Constructs an empty cast vote record, solely for persistence.
   */
  protected CastVoteRecord() {
    my_record_type = null;
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
   * @param the_record_type The type of this record.
   * @param the_timestamp The timestamp of this record.
   * @param the_county_id The county ID.
   * @param the_scanner_id The scanner ID.
   * @param the_batch_id The batch ID.
   * @param the_record_id The record ID.
   * @param the_imprinted_id The imprinted ID.
   * @param the_ballot_style The ballot style.
   * @param the_choices A map of the choices made in each contest.
   */
  @SuppressWarnings("PMD.ExcessiveParameterList")
  protected CastVoteRecord(final RecordType the_record_type,
                           final Instant the_timestamp,
                           final String the_county_id, final String the_scanner_id,
                           final String the_batch_id, final String the_record_id,
                           final String the_imprinted_id,
                           final BallotStyle the_ballot_style,
                           final Map<Contest, Set<Choice>> the_choices) {
    my_record_type = the_record_type;
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
   * @return the next ID
   */
  private static synchronized long getID() {
    return current_id++;
  }
  
  /**
   * Returns a CVR with the specified parameters.
   * 
   * @param the_record_type The type of this record.
   * @param the_timestamp The timestamp of this record.
   * @param the_county_id The county ID.
   * @param the_scanner_id The scanner ID.
   * @param the_batch_id The batch ID.
   * @param the_record_id The record ID.
   * @param the_imprinted_id The imprinted ID.
   * @param the_ballot_style The ballot style.
   * @param the_contests The contests.
   * @param the_choices The contest choices.
   */
  @SuppressWarnings({"PMD.ExcessiveParameterList", "PMD.UseObjectForClearerAPI"})
  public static synchronized CastVoteRecord instance(final RecordType the_record_type, 
                                                     final Instant the_timestamp,
                                                     final String the_county_id, 
                                                     final String the_scanner_id,
                                                     final String the_batch_id, 
                                                     final String the_record_id,
                                                     final String the_imprinted_id,
                                                     final BallotStyle the_ballot_style,
                                                     final Map<Contest, Set<Choice>> 
                                                           the_choices) {
    CastVoteRecord result = 
        new CastVoteRecord(the_record_type, the_timestamp, the_county_id, 
                           the_scanner_id, the_batch_id, the_record_id,
                           the_imprinted_id, the_ballot_style, the_choices);
    if (CACHE.containsKey(result)) {
      result = CACHE.get(result);
    } else {
      CACHE.put(result, result);
      BY_ID.put(result.dbID(), result);
    }
    return result;
  }
  
  /**
   * Returns the CVR with the specified ID.
   * 
   * @param the_id The ID.
   * @return the CVR, or null if it doesn't exist.
   */
  public static synchronized CastVoteRecord byID(final long the_id) {
    return BY_ID.get(the_id);
  }
  
  /**
   * "Forgets" the specified CVR.
   * 
   * @param the_cvr The CVR to "forget".
   */
  public static synchronized void forget(final CastVoteRecord the_cvr) {
    CACHE.remove(the_cvr);
    BY_ID.remove(the_cvr.dbID());
  }
  
  /**
   * Gets all CVRs that match the specified counties and record type.
   * 
   * @param the_county_ids The county ID to retrieve CVRs for; if this set is 
   * empty or null, all CVRs for all counties are retrieved.
   * @param the_record_type The record type to retrieve.
   * @return the requested CVRs.
   */
  public static synchronized Collection<CastVoteRecord> 
      getMatching(final Set<String> the_county_ids, final RecordType the_record_type) {
    final Set<CastVoteRecord> result = new HashSet<CastVoteRecord>();
    final boolean check_county = the_county_ids != null && !the_county_ids.isEmpty();
    
    for (final CastVoteRecord cvr : CACHE.keySet()) {
      if (check_county && !the_county_ids.contains(cvr.countyID())) {
        continue;
      }
      if (the_record_type == RecordType.ANY || the_record_type == cvr.recordType()) {
        result.add(cvr);
      }
    }
    
    return result;
  }
  
  /**
   * @return the database ID of this record.
   */
  public long dbID() {
    return my_db_id;
  }
  
  /**
   * @return this record's type.
   */
  public RecordType recordType() {
    return my_record_type;
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
  public Map<Contest, Set<Choice>> choices() {
    return my_choices;
  }

  /**
   * @return a String representation of this cast vote record.
   */
  @Override
  public String toString() {
    return "CastVoteRecord [record_type=" + my_record_type + ", timestamp=" + 
           my_timestamp + ", county_id=" + my_county_id + ", scanner_id=" +
           my_scanner_id + ", batch_id=" + my_batch_id + ", record_id=" + 
           my_record_id + ", imprinted_id=" + my_imprinted_id + ", ballot_style=" +
           my_ballot_style.id() + ", contests=" + my_choices + 
           ", choices=" + my_choices + "]";
  }
  
  /**
   * Compare this object with another for equivalence.
   * 
   * @param the_other The other object.
   * @return true if the objects are equivalent, false otherwise.
   */
  @Override
  public boolean equals(final Object the_other) {
    boolean result = true;
    if (the_other instanceof CastVoteRecord) {
      final CastVoteRecord other_cvr = (CastVoteRecord) the_other;
      result &= other_cvr.recordType() == recordType();
      result &= other_cvr.timestamp().equals(timestamp());
      result &= other_cvr.countyID().equals(countyID());
      result &= other_cvr.scannerID().equals(scannerID());
      result &= other_cvr.batchID().equals(batchID());
      result &= other_cvr.recordID().equals(recordID());
      result &= other_cvr.imprintedID().equals(imprintedID());
      result &= other_cvr.ballotStyle().equals(ballotStyle());
      result &= other_cvr.choices().equals(choices());
    } else {
      result = false;
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
            my_choices.hashCode() + my_choices.hashCode()).hashCode();
  }
  
  /** 
   * A comparator that compares CastVoteRecords based on their county id
   * and imprinted id.
   */
  public static class IDComparator 
      implements Serializable, Comparator<CastVoteRecord> {
    /**
     * The serialVersionUID.
     */
    private static final long serialVersionUID = 1L;
    
    /**
     * Compare this record to another, using the county id and imprinted id.
     * 
     * @param the_other The other record.
     * @return a negative integer, zero, or a positive integer as the first 
     * argument is less than, equal to, or greater than the second.
     */
    // we are explicitly trying to shortcut in case of object identity, 
    // so we suppress the "compare objects with equals" warning
    @SuppressWarnings("PMD.CompareObjectsWithEquals")
    @Override
    public int compare(final CastVoteRecord record_1, final CastVoteRecord record_2) {
      final int result;
      
      if (record_1 == record_2) {
        result = 0;
      } else if (record_1 == null) {
        result = 1;
      } else if (record_2 == null) {
        result = -1;
      } else {
        final String id_1 = record_1.countyID() + record_1.imprintedID();
        final String id_2 = record_2.countyID() + record_2.imprintedID();
        result = id_1.compareTo(id_2);
      }
      
      return result;
    }
  }
  
  /**
   * An enumeration used to select cast vote record types.
   */
  public enum RecordType {
    UPLOADED, AUDITOR_ENTERED, PHANTOM, ANY;
  }
}
