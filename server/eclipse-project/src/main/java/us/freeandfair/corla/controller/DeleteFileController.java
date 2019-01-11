package us.freeandfair.corla.controller;


import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import us.freeandfair.corla.asm.ASMUtilities;
import us.freeandfair.corla.asm.CountyDashboardASM;
import us.freeandfair.corla.model.CountyDashboard;
import us.freeandfair.corla.model.DoSDashboard;
import us.freeandfair.corla.model.ImportStatus;
import us.freeandfair.corla.model.ImportStatus.ImportState;
import us.freeandfair.corla.persistence.Persistence;
import us.freeandfair.corla.query.BallotManifestInfoQueries;
import us.freeandfair.corla.query.CastVoteRecordQueries;
import us.freeandfair.corla.query.CountyContestResultQueries;

/**
 *
 */
public abstract class DeleteFileController {

  /**
   * Class-wide logger
   */
  public static final Logger LOGGER =
    LogManager.getLogger(DeleteFileController.class);

  /**
   * Perform all the steps to undo a file upload.
   * fileType can be either "bmi" or "cvr"
   * returns true if all the steps succeeded, false if one or more failed
   * if any steps don't succeed they will throw a DeleteFileFail exception
   */
  public static Boolean deleteFile(final Long countyId, final String fileType)
    throws DeleteFileFail {
    if ("cvr".equals(fileType)) {
      LOGGER.info("deleting a CVR file for countyId: " + countyId);

      // deleteCastVoteRecords will also delete cvr_contest_infos due to
      // constraints, also, deleteCastVoteRecords needs to be called before
      // contests are deleted due to constraints
      deleteCastVoteRecords(countyId);
      deleteResultsAndContests(countyId);
    } else if ("bmi".equals(fileType)) {
      LOGGER.info("deleting a BMI file for countyId: " + countyId);
      deleteBallotManifestInfos(countyId);
    } else {
      throw new DeleteFileFail("Did not recognize fileType: " + fileType);
    }

    resetDashboards(countyId, fileType);
    return true;
  }

  /** reset cvr file info or bmi info on the county dashboard **/
  public static Boolean resetDashboards(final Long countyId,final  String fileType)
    throws DeleteFileFail {
    final CountyDashboard cdb = Persistence.getByID(countyId, CountyDashboard.class);
    if ("cvr".equals(fileType)) {
      resetDashboardCVR(cdb);
      final DoSDashboard dosdb = Persistence.getByID(DoSDashboard.ID, DoSDashboard.class);
      dosdb.removeContestsToAuditForCounty(cdb.county());
      LOGGER.debug("Removed contests to audit for county");
    } else if ("bmi".equals(fileType)) {
      resetDashboardBMI(cdb);
    } else {
      throw new DeleteFileFail("Did not recognize fileType: " + fileType);
    }

    // this must come after the other resetDashboard*s
    reinitializeCDB(cdb);
    return true;
  }

  /** reset cvr file info on the county dashboard **/
  public static Boolean resetDashboardCVR(final CountyDashboard cdb) {
    Persistence.delete(cdb.cvrFile());
    cdb.setCVRFile(null);
    cdb.setCVRsImported(0);
    cdb.setCVRImportStatus(new ImportStatus(ImportState.NOT_ATTEMPTED));
    LOGGER.debug("Updated the county dashboard to remove CVR stuff");
    return true;
  }

  /** if both cvr and bmi have been deleted use a asm reset shortcut **/
  public static void reinitializeCDB(final CountyDashboard cdb) {
    if (null == cdb.cvrFile() && null == cdb.manifestFile()) {
      final CountyDashboardASM countyDashboardASM = ASMUtilities.asmFor(CountyDashboardASM.class,
                                                                        String.valueOf(cdb.id()));
      countyDashboardASM.reinitialize();
      ASMUtilities.save(countyDashboardASM);
    }
  }

  /** reset bmi info on the county dashboard **/
  public static Boolean resetDashboardBMI(final CountyDashboard cdb) {
    Persistence.delete(cdb.manifestFile());
    cdb.setManifestFile(null);
    cdb.setBallotsInManifest(0);
    LOGGER.debug("Updated the county dashboard to remove BMI stuff");
    return true;
  }

  /**
   * Remove all CountyContestResults and Contests for a county
   */
  public static Boolean deleteResultsAndContests(final Long countyId)
    throws DeleteFileFail {
    // this will also delete the contests - surprise!
    final Integer result = CountyContestResultQueries.deleteForCounty(countyId);
    LOGGER.debug("Removed county contest results");

    if (result > 0) {
      LOGGER.debug("some contests and results deleted!");
      return true;
    } else {
      throw new DeleteFileFail("No contests or results deleted!");
    }
  }

  /**
   * Remove all CastVoteRecords for a county
   */
  public static Boolean deleteCastVoteRecords(final Long countyId)
    throws DeleteFileFail {
    final Integer rowsDeleted = CastVoteRecordQueries.deleteAll(countyId);

    if (1 <= rowsDeleted) {
      LOGGER.info("some cvrs deleted!");
      return true;
    } else {
      throw new DeleteFileFail("No CVRS deleted!");
    }
  }

  /**
   * Remove all BallotManifestInfo for a county
   * @param countyId
   */
  public static Boolean deleteBallotManifestInfos(final Long countyId)
    throws DeleteFileFail {
    final Integer rowsDeleted = BallotManifestInfoQueries.deleteMatching(countyId);

    if (1 <= rowsDeleted) {
      LOGGER.debug("some bmis deleted!");
      return true;
    } else {
      throw new DeleteFileFail("No bmis deleted!");
    }
  }

  /** used to abort the set of operations (transaction) **/
  public static class DeleteFileFail extends Exception {

    /** used to abort the set of operations (transaction) **/
    public DeleteFileFail(final String message) {
      super(message);
    }
  }
}
