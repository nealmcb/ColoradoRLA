/*
 * Free & Fair Colorado RLA System
 * 
 * @title ColoradoRLA
 * @created Jul 27, 2017
 * @copyright 2017 Colorado Department of State
 * @license SPDX-License-Identifier: AGPL-3.0-or-later
 * @creator Daniel M. Zimmerman <dmz@freeandfair.us>
 * @description A system to assist in conducting statewide risk-limiting audits.
 */

package us.freeandfair.corla.endpoint;

import static us.freeandfair.corla.asm.ASMEvent.CountyDashboardEvent.IMPORT_CVRS_EVENT;

import java.io.IOException;
import java.io.InputStreamReader;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.persistence.PersistenceException;

import org.codehaus.plexus.util.ExceptionUtils;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.google.gson.JsonParseException;
import com.google.gson.JsonParser;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import spark.HaltException;
import spark.Request;
import spark.Response;

import us.freeandfair.corla.Main;
import us.freeandfair.corla.asm.ASMEvent;
import us.freeandfair.corla.asm.ASMEvent.CountyDashboardEvent;
import us.freeandfair.corla.asm.ASMState;
import us.freeandfair.corla.asm.ASMState.CountyDashboardState;
import us.freeandfair.corla.asm.ASMUtilities;
import us.freeandfair.corla.asm.CountyDashboardASM;
import us.freeandfair.corla.csv.DominionCVRExportParser;
import us.freeandfair.corla.csv.Result;
import us.freeandfair.corla.model.CastVoteRecord.RecordType;
import us.freeandfair.corla.model.County;
import us.freeandfair.corla.model.CountyDashboard;
import us.freeandfair.corla.model.DoSDashboard;
import us.freeandfair.corla.model.ImportStatus;
import us.freeandfair.corla.model.ImportStatus.ImportState;
import us.freeandfair.corla.model.UploadedFile;
import us.freeandfair.corla.model.UploadedFile.FileStatus;
import us.freeandfair.corla.persistence.Persistence;
import us.freeandfair.corla.query.CastVoteRecordQueries;
import us.freeandfair.corla.query.CountyContestResultQueries;
import us.freeandfair.corla.util.ExponentialBackoffHelper;
import us.freeandfair.corla.util.UploadedFileStreamer;

/**
 * The "CVR export import" endpoint.
 * 
 * @author Daniel M. Zimmerman <dmz@freeandfair.us>
 * @version 1.0.0
 */
@SuppressWarnings({"PMD.AtLeastOneConstructor", "PMD.ExcessiveImports",
      "PMD.CyclomaticComplexity", "PMD.ModifiedCyclomaticComplexity",
      "PMD.StdCyclomaticComplexity", "PMD.GodClass", "PMD.DoNotUseThreads"})
public class CVRExportImport extends AbstractCountyDashboardEndpoint {

  /**
   * Class-wide logger
   */
  public static final Logger LOGGER =
    LogManager.getLogger(CVRExportImport.class);

  /**
   * The static set of counties that are currently running imports. This is
   * used to prevent multiple counties from importing CVRs at the same time,
   * which would cause issues since this endpoint is not a single transaction.
   */
  private static final Set<Long> COUNTIES_RUNNING = new HashSet<Long>();
  
  /**
   * {@inheritDoc}
   */
  @Override
  public EndpointType endpointType() {
    return EndpointType.POST;
  }
  
  /**
   * {@inheritDoc}
   */
  @Override
  public String endpointName() {
    return "/import-cvr-export";
  }

  /**
   * {@inheritDoc}
   */
  @Override
  protected ASMEvent endpointEvent() {
    return IMPORT_CVRS_EVENT;
  }
  
  /**
   * {@inheritDoc}
   */
  @Override
  @SuppressWarnings({"PMD.ConfusingTernary"})
  public String endpointBody(final Request the_request, final Response the_response) {
    // we know we have county authorization, so let's find out which county
    final County county = Main.authentication().authenticatedCounty(the_request);

    if (county == null) {
      unauthorized(the_response, "unauthorized administrator for CVR import");
      return my_endpoint_result.get();
    }
    
    // check to be sure that the same county isn't in the middle of a CVR import
    synchronized (COUNTIES_RUNNING) {
      if (COUNTIES_RUNNING.contains(county.id())) {
        transactionFailure(the_response,
                           "county " + county.id() + " is already importing CVRs, try later");
        // for a transaction failure, we have to halt explicitly
        halt(the_response);
      }
    }
    
    try {
      JsonParser parser = new JsonParser();
      JsonElement jsonBody = parser.parse(the_request.body());
      JsonObject jsonObject = jsonBody.getAsJsonObject();
      JsonElement fileIdElement = jsonObject.get("file_id");
      if (null == fileIdElement) {
        badDataContents(the_response, "missing file_id attribute");
        return my_endpoint_result.get();
      }
      Long fileId = fileIdElement.getAsLong();
      final UploadedFile file = Persistence.getByID(fileId, UploadedFile.class);
      if (file == null) {
        badDataContents(the_response, "nonexistent file");
      } else if (!file.county().id().equals(county.id())) {
        unauthorized(the_response, "county " + county.id() + " attempted to import " +
                     "file " + file.filename() + "uploaded by county " +
                     file.county().id());
      } else if (file.getStatus() == FileStatus.HASH_VERIFIED) {
        file.setStatus(FileStatus.IMPORTING);
        final Map<String, Instant> result = new HashMap<>();
        result.put("import_start_time", Instant.now());
        // spawn a thread to do the import; this endpoint always immediately
        // returns a successful result if we get to this point
        synchronized (COUNTIES_RUNNING) {
          // signal that we're starting the import
          COUNTIES_RUNNING.add(county.id());
        }
        (new Thread(new CVRImporter(file))).start();

        okJSON(the_response, Main.GSON.toJson(result));
      } else {
        badDataContents(the_response, "attempt to import a file without a verified hash");
      }
    } catch (final JsonParseException e) {
      badDataContents(the_response, "malformed request: " + e.getMessage());
    }
    
    return my_endpoint_result.get();
  }

  /**
   * @return the COUNTIES_RUNNING set.
   */
  protected static final Set<Long> countiesRunning() {
    return COUNTIES_RUNNING;
  }
  
  /**
   * The (internal) exception that gets thrown when a CVR import fails.
   */
  private static class CVRImportException extends RuntimeException {
    private static final long serialVersionUID = 1;
    
    /**
     * Constructs a new CVRImportException with the specified description.
     *
     * @param the_description The description.
     */
    CVRImportException(final String the_description) {
      super(the_description);
    }
  }
  
  /**
   * The Runnable class that implements the actual CVR import.
   */
  private static class CVRImporter implements Runnable {
    /**
     * The valid states in which CVR imports can cause state changes.
     */
    private static final List<ASMState> VALID_STATES =
      Arrays.asList(CountyDashboardState.CVRS_IMPORTING,
                    CountyDashboardState.BALLOT_MANIFEST_OK_AND_CVRS_IMPORTING);
    
    /**
     * The " in " string.
     */
    private static final String IN = " in ";
    
    /**
     * The " tries" string.
     */
    private static final String TRIES = " tries";
    
    /**
     * The ", county " string.
     */
    private static final String COUNTY = ", county ";
    
    /**
     * The number of times to retry a DoS dashboard update operation.
     */
    private static final int UPDATE_RETRIES = 15;
    
    /**
     * The number of milliseconds to sleep between transaction retries.
     */
    private static final long TRANSACTION_SLEEP_MSEC = 10;
    
    /**
     * The " (id " string.
     */
    private static final String PAREN_ID = " (id ";
    
    /**
     * The file that this importer is importing.
     */
    private final UploadedFile my_file;
    
    /**
     * Constructs a new CVRImporter for the specified county and file.
     *
     * @param the_file The file.
     */
    CVRImporter(final UploadedFile the_file) {
      my_file = the_file;
    }
    
    /**
     * The run method for this CVRImporter.
     */
    public void run() {
        // this outer try block is the "last resort" cleanup block
        Persistence.beginTransaction();
        try {
          parseFile(my_file);
          updateStateMachine(true);
          Persistence.commitTransaction();
          LOGGER.info("CVR import complete for county " + my_file.county().id());
        } catch (final PersistenceException e) {
          // the import failed for DB reasons, so clean up
          LOGGER.error("CVR import failed for county " + my_file.county().id() + ": " +
                            ExceptionUtils.getStackTrace(e));
          cleanup(my_file.county(), true, "import failed because of database problem");
          updateStateMachine(false);
          Persistence.commitTransaction();
      } finally {
        // release the lock on CVR imports for this county
        final Set<Long> counties_running = countiesRunning();
        synchronized (counties_running) {
          // signal that we're ending the import
          counties_running.remove(my_file.county().id());
        }
      }
    }
    
    /**
     * Aborts the import with the specified error description.
     *
     * @param the_description The error description.
     * @exception CVRImportException always, to cancel execution
     */
    private void error(final String errorMessage, final UploadedFile uploadedFile) {
      Result result = new Result();
      result.success = false;
      result.errorMessage = errorMessage;
      error(result, uploadedFile);
    }

      private void error(final Result result, final UploadedFile uploadedFile)
    {
      uploadedFile.setStatus(FileStatus.FAILED);
      uploadedFile.setResult(result);
      Persistence.saveOrUpdate(uploadedFile);
      cleanup(uploadedFile.county());
      LOGGER.error(result.errorMessage + uploadedFile.toString());
    }
    
    /**
     * Updates the county state machine based on whether the import succeeded
     * or failed.
     *
     * @param the_success_flag true if the import was successful, false otherwise.
     */
    private void updateStateMachine(final boolean the_success_flag) {
      if (Persistence.isTransactionActive()) {
        Persistence.commitTransaction();
      }
      final String status;
      final ASMEvent event;
      if (the_success_flag) {
        status = "successful";
        event = CountyDashboardEvent.CVR_IMPORT_SUCCESS_EVENT;
      } else {
        status = "unsuccessful";
        event = CountyDashboardEvent.CVR_IMPORT_FAILURE_EVENT;
      }
      LOGGER.info("updating county " + my_file.county().id() + " state after " +
                       status + " CVR import");
      boolean success = false;
      int retries = 0;
      while (!success && retries < UPDATE_RETRIES) {
        try {
          retries = retries + 1;
          LOGGER.debug("updating state machine, attempt " + retries +
                            COUNTY + my_file.county().id());
          Persistence.beginTransaction();
          final CountyDashboardASM cdb_asm =
            ASMUtilities.asmFor(CountyDashboardASM.class, my_file.county().id().toString());
          if (VALID_STATES.contains(cdb_asm.currentState())) {
            // the dashboard is in a state we can legitimately change, which means
            // the actual import endpoint committed its transaction
            cdb_asm.stepEvent(event);
            ASMUtilities.save(cdb_asm);
            Persistence.commitTransaction();
            success = true;
          } else {
            // the dashboard is not in a state we can legitimately change, so let's
            // wait until it is
            Persistence.rollbackTransaction();
            // let's give other transactions time to breathe
            try {
              final long delay =
                ExponentialBackoffHelper.exponentialBackoff(retries, TRANSACTION_SLEEP_MSEC);
              LOGGER.info("waiting for county " + my_file.county().id() +
                               " state update, retrying in " + delay + "ms");
              Thread.sleep(delay);
            } catch (final InterruptedException ex) {
              // it's OK to be interrupted
            }
          }
        } catch (final PersistenceException e) {
          // something went wrong, let's try again
          if (Persistence.canTransactionRollback()) {
            try {
              Persistence.rollbackTransaction();
            } catch (final PersistenceException ex) {
              // not much we can do about it
            }
          }
          // let's give other transactions time to breathe
          try {
            final long delay =
              ExponentialBackoffHelper.exponentialBackoff(retries, TRANSACTION_SLEEP_MSEC);
            LOGGER.info("retrying state update for county " +
                             my_file.county().id() + IN + delay + "ms");
            Thread.sleep(delay);
          } catch (final InterruptedException ex) {
            // it's OK to be interrupted
          }
        }
      }
      // we always need a running transaction
      Persistence.beginTransaction();
      if (success && retries > 1) {
        LOGGER.info("updated state machine for county " + my_file.county().id() +
                         IN + retries + TRIES);
      } else if (!success) {
        error("could not update state machine for county " + my_file.county().id() +
              " after " + retries + TRIES, my_file);
      }
    }
    
    /**
     * Updates the appropriate county dashboard to reflect a new
     * CVR export upload.
     *
     * @param the_file The uploaded CVR file.
     * @param the_status The import status.
     * @param the_cvrs_imported The number of CVRs imported.
     */
    private void updateCountyDashboard(final UploadedFile the_file,
                                       final ImportStatus the_status,
                                       final Integer the_cvrs_imported) {
      if (Persistence.isTransactionActive()) {
        Persistence.commitTransaction();
      }
      boolean success = false;
      int retries = 0;
      while (!success && retries < UPDATE_RETRIES) {
        try {
          retries = retries + 1;
          LOGGER.debug("updating county dashboard, attempt " + retries +
                            COUNTY + my_file.county().id());
          Persistence.beginTransaction();
          final CountyDashboard cdb =
            Persistence.getByID(the_file.county().id(), CountyDashboard.class);
          if (cdb == null) {
            error("could not locate county dashboard", the_file);
          } else {
            cdb.setCVRFile(the_file);
            cdb.setCVRImportStatus(the_status);
            cdb.setCVRsImported(the_cvrs_imported);
            Persistence.saveOrUpdate(cdb);
          }
          Persistence.commitTransaction();
          success = true;
        } catch (final PersistenceException e) {
          // something went wrong, let's try again
          if (Persistence.canTransactionRollback()) {
            try {
              Persistence.rollbackTransaction();
            } catch (final PersistenceException ex) {
              // not much we can do about it
            }
          }
          // let's give other transactions time to breathe
          try {
            final long delay =
              ExponentialBackoffHelper.exponentialBackoff(retries, TRANSACTION_SLEEP_MSEC);
            LOGGER.info("retrying county " + my_file.county().id() +
                             " dashboard update in " + delay + "ms");
            Thread.sleep(delay);
          } catch (final InterruptedException ex) {
            // it's OK to be interrupted
          }
        }
      }
      // we always need a running transaction
      Persistence.beginTransaction();
      if (success && retries > 1) {
        LOGGER.info("updated state machine for county " + my_file.county().id() +
                         IN + retries + TRIES);
      } else if (!success) {
        error("could not update state machine for county " + my_file.county().id() +
              " after " + retries + TRIES, the_file);
      }
    }
    
    /**
     * Parses an uploaded CVR export and attempts to persist it to the database.
     *
     * @param the_file The uploaded file.
     */
    @SuppressWarnings({"PMD.AvoidCatchingGenericException", "PMD.AvoidRethrowingException"})
    private void parseFile(final UploadedFile the_file)
      throws CVRImportException {
      final UploadedFileStreamer ufs = new UploadedFileStreamer(the_file);
      (new Thread(ufs)).start();
        
      try {
        final InputStreamReader cvr_isr = new InputStreamReader(ufs.inputStream(), "UTF-8");
        final DominionCVRExportParser parser =
          new DominionCVRExportParser(cvr_isr,
                                      Persistence.getByID(the_file.county().id(),
                                                          County.class),
                                      Main.properties(),
                                      true);
        try {
          final int deleted = cleanup(the_file.county());
          if (deleted > 0) {
            LOGGER.info("deleted " + deleted + " previously-uploaded CVRs");
          }
        } catch (final PersistenceException ex) {
          error("unable to delete previously uploaded CVRs", the_file);
        }
        
        updateCountyDashboard(the_file, new ImportStatus(ImportState.IN_PROGRESS), 0);

        Result result = parser.parse();
        if (result.success) {
          final int imported = result.importedCount;
          LOGGER.info(imported + " CVRs parsed from file " + the_file.toString());
          updateCountyDashboard(the_file, new ImportStatus(ImportState.SUCCESSFUL), imported);
          the_file.setStatus(FileStatus.IMPORTED);
          the_file.setResult(result);
          Persistence.saveOrUpdate(the_file);
        } else {
          error(result, the_file);
          try {
            cleanup(the_file.county(), true, result.errorMessage);
          } catch (final PersistenceException e) {
            error("couldn't clean up after ",  the_file);
          }
          // throw new CVRImportException(result.errorMessage);
        }
      } catch (final PersistenceException e) {
        LOGGER.info("parse transactions did not complete successfully, " +
                         "attempting cleanup");
        try {
          cleanup(the_file.county(), true, "could not clean up");
        } catch (final PersistenceException ex) {
          // if we couldn't clean up, there's not much we can do about it
        }
        // error("cvr import transaction failed: " + e.getMessage(), the_file);
        error("cvr import transaction failed: ", the_file);
      } catch (final HaltException e) {

        // we don't want to intercept these, so we just rethrow it
        throw e;
      } catch (final IOException e) {
        LOGGER.error("could not parse malformed CVR export file "
                          + the_file.toString()
                          + ": " + ExceptionUtils.getStackTrace(e));

        try {
          cleanup(the_file.county(), true, "malformed CVR export file");
        } catch (final PersistenceException ex) {
          // if we couldn't clean up, there's not much we can do about it
        }
        error("malformed CVR export file ", the_file);

      } finally {
        ufs.stop();
      }
    }
    
    /**
     * Attempts to wipe all CVR records for a specific county. This ends any current
     * transaction, does the delete in its own transaction, and starts a new
     * transaction so that one is open at all times during endpoint execution.
     *
     * @param the_county The county to wipe.
     * @return the number of deleted CVR records, if any were deleted.
     * @exception PersistenceException if the wipe was unsuccessful.
     */
    private int cleanup(final County the_county) {
      return cleanup(the_county, false, null);
    }
    
    /**
     * Attempts to wipe all CVR records for a specific county. This ends any current
     * transaction, does the delete in its own transaction, and starts a new
     * transaction so that one is open at all times during endpoint execution.
     *
     * This is all (perhaps?) because the import is happening in its own,
     * separate, thread and transaction.
     *
     * We don't remove the file from the
     * dashboard because the state wants to look at it, but we will try to undo
     * everything else
     *
     * @param the_county The county to wipe.
     * @param the_failure_flag true to set the CVR import status on the county
     * dashboard to FAILED, false otherwise.
     * @param the_failure_message The failure message to report, if the_failure_flag
     * is true.
     * @return the number of deleted CVR records, if any were deleted.
     * @exception PersistenceException if the wipe was unsuccessful.
     */
    private int cleanup(final County the_county, final boolean the_failure_flag,
                        final String the_failure_message) {
      if (Persistence.isTransactionActive()) {
        Persistence.commitTransaction();
      }
      boolean success = false;
      int retries = 0;
      int result = 0;
      while (!success && retries < UPDATE_RETRIES) {
        try {
          retries = retries + 1;
          LOGGER.debug("updating DoS dashboard, attempt " + retries +
                            COUNTY + the_county.id());
          Persistence.beginTransaction();
          final DoSDashboard dosdb = Persistence.getByID(DoSDashboard.ID, DoSDashboard.class);
          dosdb.removeContestsToAuditForCounty(the_county);
          // prevent Hibernate from reordering the ContestsToAudit deletion after the
          // Contest and CountyContestResult deletion in the following queries
          Persistence.flush();
          result =
            CastVoteRecordQueries.deleteAll(the_county.id());
          CountyContestResultQueries.deleteForCounty(the_county.id());
          final CountyDashboard cdb =
            Persistence.getByID(the_county.id(), CountyDashboard.class);

          cdb.setCVRsImported(0);
          if (the_failure_flag) {
            cdb.setCVRImportStatus(new ImportStatus(ImportState.FAILED, the_failure_message));
          }
          Persistence.commitTransaction();
          success = true;
        } catch (final PersistenceException e) {
          // something went wrong, let's try again
          if (Persistence.canTransactionRollback()) {
            try {
              Persistence.rollbackTransaction();
            } catch (final PersistenceException ex) {
              // not much we can do about it
            }
          }
          result = 0;
          // let's give other transactions time to breathe
          try {
            final long delay =
              ExponentialBackoffHelper.exponentialBackoff(retries, TRANSACTION_SLEEP_MSEC);
            LOGGER.info("retrying DoS dashboard update for county " + the_county.id() +
                             IN + delay + "ms");
            Thread.sleep(delay);
          } catch (final InterruptedException ex) {
            // it's OK to be interrupted
          }
        }
      }
      // we always need a running transaction
      Persistence.beginTransaction();
      if (success && retries > 1) {
        LOGGER.info("updated DoS dashboard for county " + the_county.id() +
                         " CVR reset in " + retries + TRIES);
      } else if (!success) {
        error("could not update DoS dashboard for county " + the_county.id() +
              " CVR reset after " + retries + TRIES, my_file);
      }
      return result;
    }
  }
}
