package us.freeandfair.corla.controller;

import javax.persistence.PersistenceException;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import us.freeandfair.corla.model.County;
import us.freeandfair.corla.model.CountyDashboard;
import us.freeandfair.corla.model.DoSDashboard;
import us.freeandfair.corla.model.ImportStatus;
import us.freeandfair.corla.model.ImportStatus.ImportState;
import us.freeandfair.corla.persistence.Persistence;
import us.freeandfair.corla.query.BallotManifestInfoQueries;
import us.freeandfair.corla.query.CastVoteRecordQueries;
import us.freeandfair.corla.query.ContestQueries;
import us.freeandfair.corla.query.CountyQueries;
import us.freeandfair.corla.query.CountyContestResultQueries;
import us.freeandfair.corla.query.UploadedFileQueries;

/**
 *
 */
public final class DeleteFileController {
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
  public static Boolean deleteFile(Long countyId, String fileType)
    throws DeleteFileFail {
    if (fileType.equals("cvr")) {
      LOGGER.info("deleting a CVR file for countyId: " + countyId);

      // deleteCastVoteRecords will also delete cvr_contest_infos due to constraints
      // deleteCastVoteRecords needs to be called before contests are deleted due to constraints
      deleteCastVoteRecords(countyId);
      deleteResultsAndContests(countyId);
    } else if (fileType.equals("bmi")) {
      LOGGER.info("deleting a BMI file for countyId: " + countyId);
      deleteBallotManifestInfos(countyId);
    } else {
      throw new DeleteFileFail("Did not recognize fileType: " + fileType);
    }

    resetDashboards(countyId, fileType);
    return true;
  }

  static Boolean resetDashboards(Long countyId, String fileType)
    throws DeleteFileFail {
    final CountyDashboard cdb = Persistence.getByID(countyId, CountyDashboard.class);

    if (fileType.equals("cvr")) {
      resetDashboardCVR(cdb);
      final DoSDashboard dosdb = Persistence.getByID(DoSDashboard.ID, DoSDashboard.class);
      dosdb.removeContestsToAuditForCounty(cdb.county());
      LOGGER.debug("Removed contests to audit for county");
      return true;
    } else if (fileType.equals("bmi")) {
      resetDashboardBMI(cdb);
      return true;
    } else {
      throw new DeleteFileFail("Did not recognize fileType: " + fileType);
    }
  }

  static Boolean resetDashboardCVR(CountyDashboard cdb) {
    Persistence.delete(cdb.cvrFile());
    cdb.setCVRFile(null);
    cdb.setCVRsImported(0);
    cdb.setCVRImportStatus(new ImportStatus(ImportState.NOT_ATTEMPTED));
    LOGGER.debug("Updated the county dashboard to remove CVR stuff");
    return true;
  }

  static Boolean resetDashboardBMI(CountyDashboard cdb) {
    Persistence.delete(cdb.manifestFile());
    cdb.setManifestFile(null);
    cdb.setBallotsInManifest(0);
    LOGGER.debug("Updated the county dashboard to remove BMI stuff");
    return true;
  }

  /**
   * Remove all CountyContestResults and Contests for a county
   */
  static Boolean deleteResultsAndContests(Long countyId)
    throws DeleteFileFail {
    // this will also delete the contests - surprise!
    Integer result = CountyContestResultQueries.deleteForCounty(countyId);
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
  static Boolean deleteCastVoteRecords(Long countyId)
    throws DeleteFileFail {
    Integer rowsDeleted = CastVoteRecordQueries.deleteAll(countyId);

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
  static Boolean deleteBallotManifestInfos(Long countyId)
    throws DeleteFileFail {
    Integer rowsDeleted = BallotManifestInfoQueries.deleteMatching(countyId);

    if (1 <= rowsDeleted) {
      LOGGER.debug("some bmis deleted!");
      return true;
    } else {
      throw new DeleteFileFail("No bmis deleted!");
    }
  }

  public static class DeleteFileFail extends Exception {
    public DeleteFileFail(String message) {
      super(message);
    }
  }
}
