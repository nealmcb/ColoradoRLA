package us.freeandfair.corla.controller;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.io.IOException;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.zip.ZipOutputStream;
import java.util.zip.ZipEntry;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import us.freeandfair.corla.report.WorkbookWriter;
import us.freeandfair.corla.report.ReportRows;
import us.freeandfair.corla.model.DoSDashboard;
import us.freeandfair.corla.persistence.Persistence;
import us.freeandfair.corla.query.ExportQueries;

/**
 * Find the data for a report and format it to be rendered into a presentation
 * format elsewhere
 **/
public final class AuditReport {

  /**
   * Class-wide logger
   */
  public static final Logger LOGGER =
    LogManager.getLogger(AuditReport.class);


  /** no instantiation **/
  private AuditReport () {};

  /**
   * Generate a report file and return the bytes
   * activity: a log of acvr submissions for a particular Contest (includes all
   *   participating counties)
   * activity-all: same as above for all targeted contests
   * results: the acvr submissions for each random number that was generated (to
   *   audit this program's calculations)
   * results-all: same as above for all targeted contests
   *
   * Here are the specific differences:
   * - the Activity report is sorted by timestamp, the Audit Report by random
       number sequence
   * - the Activity report shows previous revisions, the Audit Report does not
   * - the Result Report shows the random number that was generated for
       the CVR (and the position),  the Activity Report does not
   * - the Result Report shows duplicates(multiplicity), the Activity Report does not
   *
   * contestName is optional if reportType is *-all
   **/
  public static byte[] generate(final String contentType,
                                final String reportType,
                                final String contestName)
    throws IOException {
    // xlsx
    final WorkbookWriter writer = new WorkbookWriter();
    List<List<String>> rows;
    DoSDashboard dosdb;

    switch(reportType) {
    case "activity":
      rows = ReportRows.getContestActivity(contestName);
      writer.addSheet(contestName, rows);
      break;
    case "activity-all":
      dosdb = Persistence.getByID(DoSDashboard.ID, DoSDashboard.class);
      for (final String cName: dosdb.targetedContestNames()) {
        writer.addSheet(cName, ReportRows.getContestActivity(cName));
      }
      break;
    case "results":
      rows = ReportRows.getResultsReport(contestName);
      writer.addSheet(contestName, rows);
      break;
    case "results-all":
      dosdb = Persistence.getByID(DoSDashboard.ID, DoSDashboard.class);
      writer.addSheet("Summary", ReportRows.genSumResultsReport());
      for (final String cName: dosdb.targetedContestNames()) {
        writer.addSheet(cName, ReportRows.getResultsReport(cName));
      }
      break;
    default:
      LOGGER.error("invalid reportType: " + reportType);
      break;

    }

    return writer.write();
  }


  public static void generateZip(final OutputStream os) {
    try {
      ZipOutputStream zos = new ZipOutputStream(os);
      Map<String,String> files = ExportQueries.sqlFiles();

      for (Map.Entry<String,String> entry: files.entrySet()) {
        final String filename =  entry.getKey() + ".csv";
        final ZipEntry zipEntry = new ZipEntry(filename);
        zos.putNextEntry(zipEntry);
        ExportQueries.csvOut(entry.getValue(),
                             zos);
        zos.closeEntry();
      }

      for (Map.Entry<String,String> entry: files.entrySet()) {
        final String filename =  entry.getKey() + ".json";
        final ZipEntry zipEntry = new ZipEntry(filename);
        zos.putNextEntry(zipEntry);
        ExportQueries.jsonOut(entry.getValue(), zos);
        zos.closeEntry();
      }

      zos.putNextEntry(new ZipEntry("ActivityReport.xlsx"));
      zos.write(generate("xlsx", "activity-all", null));
      zos.closeEntry();

      zos.putNextEntry(new ZipEntry("ResultsReport.xlsx"));
      zos.write(generate("xlsx", "results-all", null));
      zos.closeEntry();


      zos.close();
    } catch (java.io.IOException e) {

    }
  }
}
